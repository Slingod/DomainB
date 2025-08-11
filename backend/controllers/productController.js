const db = require('../db');

// utils
function isStaff(req) {
  return req.user && ['admin', 'moderator'].includes(req.user.role);
}

// 1) Lister les produits
exports.listProducts = (req, res) => {
  try {
    const includeHidden = req.query.include_hidden === 'true';
    const staff = isStaff(req);

    let rows;
    if (staff && includeHidden) {
      rows = db.prepare(`
        SELECT id, title, description, price, image_url, stock, is_summer_product, is_visible,
               created_at, updated_at, sort_order
        FROM products
        ORDER BY sort_order ASC, created_at DESC
      `).all();
    } else {
      rows = db.prepare(`
        SELECT id, title, description, price, image_url, stock, is_summer_product, is_visible,
               created_at, updated_at, sort_order
        FROM products
        WHERE is_visible = 1
        ORDER BY sort_order ASC, created_at DESC
      `).all();
    }

    rows.forEach(p => {
      try { p.description = JSON.parse(p.description || '{}'); } catch { p.description = {}; }
    });

    res.json(rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
};

// 2) Détail produit
exports.getProduct = (req, res) => {
  try {
    const p = db.prepare(`
      SELECT id, title, description, price, image_url, stock, is_summer_product, is_visible,
             created_at, updated_at, sort_order
      FROM products
      WHERE id = ?
    `).get(req.params.id);

    if (!p) return res.status(404).json({ error: 'Produit introuvable.' });
    if (!p.is_visible && !isStaff(req)) return res.status(404).json({ error: 'Produit introuvable.' });

    try { p.description = JSON.parse(p.description || '{}'); } catch { p.description = {}; }

    res.json(p);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du produit.' });
  }
};

// 3) Créer produit (admin)
exports.createProduct = (req, res) => {
  const {
    title,
    description,
    price,
    image_url,
    stock = 0,
    is_visible = true,
    is_summer_product = false
  } = req.body;

  try {
    const descJson = JSON.stringify(description || {});
    const max = db.prepare(`SELECT COALESCE(MAX(sort_order), 0) AS m FROM products`).get().m;
    const nextOrder = Number(max) + 1;

    const info = db.prepare(`
      INSERT INTO products (title, description, price, image_url, stock, is_visible, is_summer_product, sort_order)
      VALUES (?,?,?,?,?,?,?,?)
    `).run(
      title,
      descJson,
      price,
      image_url || null,
      Number(stock) || 0,
      is_visible ? 1 : 0,
      is_summer_product ? 1 : 0,
      nextOrder
    );

    const created = db.prepare(`SELECT * FROM products WHERE id = ?`).get(info.lastInsertRowid);
    try { created.description = JSON.parse(created.description || '{}'); } catch { created.description = {}; }
    res.status(201).json(created);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la création du produit.' });
  }
};

// 4) Mettre à jour produit (admin)
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
    const current = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
    if (!current) return res.status(404).json({ error: 'Produit introuvable.' });

    const descJson = JSON.stringify(description ?? JSON.parse(current.description || '{}'));

    db.prepare(`
      UPDATE products
      SET title=?, description=?, price=?, image_url=?, stock=?, is_visible=?, is_summer_product=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(
      title ?? current.title,
      descJson,
      price ?? current.price,
      image_url ?? current.image_url,
      Number.isFinite(+stock) ? +stock : current.stock,
      typeof is_visible === 'boolean' ? (is_visible ? 1 : 0) : current.is_visible,
      typeof is_summer_product === 'boolean' ? (is_summer_product ? 1 : 0) : current.is_summer_product,
      req.params.id
    );

    const updated = db.prepare(`SELECT * FROM products WHERE id = ?`).get(req.params.id);
    try { updated.description = JSON.parse(updated.description || '{}'); } catch { updated.description = {}; }
    res.json(updated);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du produit.' });
  }
};

// 5) Supprimer produit (admin)
exports.deleteProduct = (req, res) => {
  try {
    const r = db.prepare(`DELETE FROM products WHERE id = ?`).run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Produit introuvable.' });
    res.json({ ok: true });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT' || e.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      return res.status(400).json({ error: 'Impossible de supprimer ce produit car il est lié à des commandes existantes.' });
    }
    console.error(e);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};

// 6) Réordonner les produits (admin)
exports.reorderProducts = (req, res) => {
  const ids = Array.isArray(req.body.ids) ? req.body.ids : null;
  if (!ids || ids.length === 0) {
    return res.status(400).json({ error: 'ids manquant' });
  }
  // vérifier que tous existent
  const all = db.prepare(`SELECT id FROM products WHERE id IN (${ids.map(() => '?').join(',')})`).all(...ids);
  if (all.length !== ids.length) {
    return res.status(400).json({ error: 'Liste invalide (id manquant/inexistant)' });
  }

  const tx = db.transaction((arr) => {
    for (let i = 0; i < arr.length; i++) {
      db.prepare(`UPDATE products SET sort_order = ? WHERE id = ?`).run(i + 1, arr[i]);
    }
  });
  tx(ids);

  res.json({ ok: true });
};
