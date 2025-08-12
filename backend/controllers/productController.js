const db = require('../db');
const { sanitizeDescriptionMap } = require('../utils/sanitizeRichText');

// 1) Lister tous les produits (respecte include_hidden & rôle)
exports.listProducts = (req, res) => {
  try {
    const includeHidden = req.query.include_hidden === 'true';
    const role = req.user?.role;
    const isPrivileged = role === 'admin' || role === 'moderator';

    const sql = (includeHidden && isPrivileged)
      ? `SELECT * FROM products ORDER BY COALESCE(sort_order, CAST(strftime('%s', created_at) AS INTEGER)) ASC`
      : `SELECT * FROM products WHERE is_visible = 1 ORDER BY COALESCE(sort_order, CAST(strftime('%s', created_at) AS INTEGER)) ASC`;

    const products = db.prepare(sql).all();

    // Parse JSON description (héritage) — côté front on re-sanitise de toute façon
    for (const p of products) {
      try { p.description = JSON.parse(p.description || '{}'); }
      catch { p.description = {}; }
    }

    res.json(products);
  } catch (error) {
    console.error('Erreur listProducts:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
};

// 2) Détail produit
exports.getProduct = (req, res) => {
  try {
    const role = req.user?.role;
    const isPrivileged = role === 'admin' || role === 'moderator';

    const p = db.prepare(`
      SELECT * FROM products WHERE id = ?
    `).get(req.params.id);

    if (!p) return res.status(404).json({ error: 'Produit introuvable.' });
    if (!isPrivileged && Number(p.is_visible) !== 1) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    try { p.description = JSON.parse(p.description || '{}'); }
    catch { p.description = {}; }

    res.json(p);
  } catch (error) {
    console.error('Erreur getProduct:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du produit.' });
  }
};

// 3) Créer (ADMIN) — SANITIZE avant insert
exports.createProduct = (req, res) => {
  const {
    title,
    description,
    price,
    image_url,
    stock,
    is_visible = true,
    is_summer_product = false
  } = req.body;

  try {
    const descSanitized = sanitizeDescriptionMap(description || {});
    const descJson = JSON.stringify(descSanitized);

    const info = db.prepare(`
      INSERT INTO products (title, description, price, image_url, stock, is_visible, is_summer_product, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      String(title || '').trim(),
      descJson,
      Number(price) || 0,
      image_url || null,
      Number(stock) || 0,
      is_visible ? 1 : 0,
      is_summer_product ? 1 : 0
    );

    // facultatif : initialiser sort_order si null → timestamp de création
    db.prepare(`
      UPDATE products
      SET sort_order = COALESCE(sort_order, CAST(strftime('%s', created_at) AS INTEGER))
      WHERE id = ?
    `).run(info.lastInsertRowid);

    const created = db.prepare(`SELECT * FROM products WHERE id = ?`).get(info.lastInsertRowid);
    try { created.description = JSON.parse(created.description || '{}'); } catch {}
    res.status(201).json(created);
  } catch (error) {
    console.error('Erreur createProduct:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du produit.' });
  }
};

// 4) Update (ADMIN) — SANITIZE avant update
exports.updateProduct = (req, res) => {
  const {
    title,
    description,
    price,
    image_url,
    stock,
    is_visible,
    is_summer_product
  } = req.body;

  try {
    const p = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
    if (!p) return res.status(404).json({ error: 'Produit introuvable.' });

    const nextTitle  = (title ?? p.title);
    const nextDesc   = sanitizeDescriptionMap(description ?? JSON.parse(p.description || '{}'));
    const nextPrice  = (price ?? p.price);
    const nextImage  = (image_url ?? p.image_url);
    const nextStock  = (stock ?? p.stock);
    const nextVis    = (typeof is_visible === 'boolean' ? is_visible : !!p.is_visible);
    const nextSummer = (typeof is_summer_product === 'boolean' ? is_summer_product : !!p.is_summer_product);

    db.prepare(`
      UPDATE products
      SET title = ?, description = ?, price = ?, image_url = ?, stock = ?,
          is_visible = ?, is_summer_product = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      String(nextTitle || '').trim(),
      JSON.stringify(nextDesc),
      Number(nextPrice) || 0,
      nextImage || null,
      Number(nextStock) || 0,
      nextVis ? 1 : 0,
      nextSummer ? 1 : 0,
      req.params.id
    );

    const updated = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
    try { updated.description = JSON.parse(updated.description || '{}'); } catch {}
    res.json(updated);
  } catch (error) {
    console.error('Erreur updateProduct:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du produit.' });
  }
};

// 5) Delete (ADMIN)
exports.deleteProduct = (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT' || err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({
        error: "Impossible de supprimer ce produit car il est lié à des commandes existantes."
      });
    }
    console.error('Erreur deleteProduct:', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 6) Reorder (ADMIN) — déjà utilisé par l’admin DnD
exports.reorderProducts = (req, res) => {
  try {
    const ids = Array.isArray(req.body.ids) ? req.body.ids : null;
    if (!ids || ids.length === 0) {
      return res.status(400).json({ error: 'ids must be a non-empty array' });
    }

    // Vérifie que tous les ids existent
    const existing = db.prepare(`SELECT id FROM products WHERE id IN (${'?,'.repeat(ids.length).slice(0,-1)})`).all(...ids);
    if (existing.length !== ids.length) {
      return res.status(400).json({ error: 'Some ids do not exist' });
    }

    const tx = db.transaction(() => {
      let order = 1;
      for (const id of ids) {
        db.prepare(`UPDATE products SET sort_order = ? WHERE id = ?`).run(order++, id);
      }
    });
    tx();

    res.json({ ok: true });
  } catch (e) {
    console.error('Erreur reorderProducts:', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
