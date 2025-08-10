const db = require('../db');

// 1) Lister tous les produits
exports.listProducts = (req, res) => {
  try {
    const includeHidden = req.query.include_hidden === 'true';
    const isAdmin = req.user && req.user.role === 'admin';

    // const isAdmin = true; // 👈 Activer ça SEULEMENT pour debug rapide

    let products;

    if (isAdmin && includeHidden) {
      products = db.prepare('SELECT * FROM products').all(); // Tous les produits
    } else {
      products = db.prepare('SELECT * FROM products WHERE is_visible = 1').all(); // Uniquement visibles
    }

    products.forEach(p => {
      try {
        p.description = JSON.parse(p.description || '{}');
      } catch {
        p.description = {};
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
};

// 2) Récupérer un produit par son ID
exports.getProduct = (req, res) => {
  try {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);

    if (!p) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    try {
      p.description = JSON.parse(p.description || '{}');
    } catch {
      p.description = {};
    }

    res.json(p);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du produit.' });
  }
};

// 3) Créer un nouveau produit (admin)
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
    const descJson = JSON.stringify(description || {});

    const info = db.prepare(`
      INSERT INTO products (title, description, price, image_url, stock, is_visible, is_summer_product)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      descJson,
      price,
      image_url || null,
      Number(stock) || 0,
      is_visible ? 1 : 0,
      is_summer_product ? 1 : 0
    );

    res.status(201).json({ id: info.lastInsertRowid });
  } catch (error) {
    console.error('Erreur lors de la création du produit :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la création du produit.' });
  }
};

// 4) Mettre à jour un produit existant (admin)
exports.updateProduct = (req, res) => {
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
    const descJson = JSON.stringify(description || {});

    db.prepare(`
      UPDATE products
      SET
        title = ?,
        description = ?,
        price = ?,
        image_url = ?,
        stock = ?,
        is_visible = ?,
        is_summer_product = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      descJson,
      price,
      image_url || null,
      Number(stock) || 0,
      is_visible ? 1 : 0,
      is_summer_product ? 1 : 0,
      req.params.id
    );

    res.json({ message: 'Produit modifié.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit :', error);
    res.status(500).json({ error: 'Erreur serveur lors de la mise à jour du produit.' });
  }
};

// 5) Supprimer un produit (admin)
exports.deleteProduct = (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM products WHERE id = ?');
    const result = stmt.run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Produit introuvable.' });
    }

    res.json({ message: 'Produit supprimé.' });
  } catch (err) {
    if (
      err.code === 'SQLITE_CONSTRAINT' || 
      err.code === 'SQLITE_CONSTRAINT_FOREIGNKEY'
    ) {
      return res.status(400).json({
        error: "Impossible de supprimer ce produit car il est lié à des commandes existantes."
      });
    }

    console.error('Erreur lors de la suppression du produit :', err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }
};