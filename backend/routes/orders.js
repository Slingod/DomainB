const router = require('express').Router();
const { body, param } = require('express-validator');

const requireAuth = require('../middlewares/requireAuth');
const validate    = require('../middlewares/validateMiddleware');
const db          = require('../db');

/**
 * NOTE
 * - On lit l'id utilisateur via req.user.id (mis par requireAuth()).
 * - CSRF est géré globalement (POST/PUT/DELETE).
 * - On renvoie "total" (alias de total_price) pour coller à ton front.
 */

// Mes commandes (auth requis)
router.get('/my', requireAuth(), (req, res) => {
  const rows = db.prepare(`
    SELECT o.id, o.total_price, o.created_at
    FROM orders o
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);

  const itemsStmt = db.prepare(`
    SELECT oi.product_id, oi.quantity, oi.unit_price, p.title, p.image_url
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = ?
  `);

  const withItems = rows.map(o => ({
    id: o.id,
    total: o.total_price,           // <<< alias pour le front
    created_at: o.created_at,
    items: itemsStmt.all(o.id)
  }));

  res.json(withItems);
});

// Créer une commande (auth requis)
router.post('/',
  requireAuth(),
  [
    body('items').isArray({ min: 1 }),
    body('items.*.product_id').isInt({ min: 1 }).toInt(),
    body('items.*.quantity').isInt({ min: 1 }).toInt()
  ],
  validate,
  (req, res) => {
    const { items } = req.body;

    // calcule total + vérifie stock
    let total = 0;
    for (const it of items) {
      const p = db.prepare('SELECT id, price, stock FROM products WHERE id = ?').get(it.product_id);
      if (!p) return res.status(400).json({ error: `Produit ${it.product_id} introuvable` });
      if (p.stock < it.quantity) return res.status(400).json({ error: `Stock insuffisant pour le produit ${p.id}` });
      total += p.price * it.quantity;
    }

    // transaction: crée commande + lignes + décrémente stock
    const tx = db.transaction(() => {
      const insOrder = db.prepare('INSERT INTO orders (user_id, total_price) VALUES (?, ?)');
      const orderId = insOrder.run(req.user.id, total).lastInsertRowid;

      const insItem  = db.prepare('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)');
      const updStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');

      for (const it of items) {
        const p = db.prepare('SELECT id, price FROM products WHERE id = ?').get(it.product_id);
        insItem.run(orderId, p.id, it.quantity, p.price);
        updStock.run(it.quantity, p.id);
      }
      return orderId;
    });

    const orderId = tx();
    const order   = db.prepare('SELECT id, total_price, created_at FROM orders WHERE id = ?').get(orderId);

    res.status(201).json({
      id: order.id,
      total: order.total_price,     // <<< alias
      created_at: order.created_at
    });
  }
);

// (ADMIN) Liste toutes les commandes
router.get('/',
  requireAuth('admin'),
  (req, res) => {
    const rows = db.prepare(`
      SELECT o.id, o.user_id, o.total_price, o.created_at, u.email
      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
    `).all();
    // alias total pour cohérence
    res.json(rows.map(r => ({ ...r, total: r.total_price })));
  }
);

// (ADMIN) Détails d'une commande
router.get('/:id',
  requireAuth('admin'),
  [ param('id').isInt().toInt() ],
  validate,
  (req, res) => {
    const id = req.params.id;
    const order = db.prepare('SELECT id, user_id, total_price, created_at FROM orders WHERE id = ?').get(id);
    if (!order) return res.status(404).json({ error: 'Not found' });

    const items = db.prepare(`
      SELECT oi.product_id, oi.quantity, oi.unit_price, p.title, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(id);

    res.json({ ...order, total: order.total_price, items });
  }
);

module.exports = router;