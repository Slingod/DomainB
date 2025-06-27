const db = require('../db');

exports.listProducts = (req, res) => {
  const products = db.prepare('SELECT * FROM products').all();
  res.json(products);
};

exports.getProduct = (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(p);
};

exports.createProduct = (req, res) => {
  const { title, description, price, image_url } = req.body;
  const info = db.prepare(`
    INSERT INTO products (title, description, price, image_url)
    VALUES (?, ?, ?, ?)
  `).run(title, description, price, image_url);
  res.status(201).json({ id: info.lastInsertRowid });
};

exports.updateProduct = (req, res) => {
  const { title, description, price, image_url } = req.body;
  db.prepare(`
    UPDATE products
    SET title=?, description=?, price=?, image_url=?, updated_at=CURRENT_TIMESTAMP
    WHERE id=?
  `).run(title, description, price, image_url, req.params.id);
  res.json({ message: 'Produit modifié' });
};

exports.deleteProduct = (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Produit supprimé' });
};