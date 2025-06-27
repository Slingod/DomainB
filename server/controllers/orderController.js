const db = require('../db');

exports.listUserOrders = (req, res) => {
  const rows = db.prepare(`
    SELECT o.id, o.created_at, o.total_price AS total,
           oi.product_id, oi.quantity, p.title
    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON p.id = oi.product_id
    WHERE o.user_id = ?
    ORDER BY o.created_at DESC
  `).all(req.user.id);

  // Regroupe les items par commande
  const grouped = rows.reduce((acc, r) => {
    let ord = acc.find(o => o.id === r.id);
    if (!ord) {
      ord = { id: r.id, created_at: r.created_at, total: r.total, items: [] };
      acc.push(ord);
    }
    ord.items.push({ product_id: r.product_id, title: r.title, quantity: r.quantity });
    return acc;
  }, []);
  res.json(grouped);
};

exports.createOrder = (req, res) => {
  const { items } = req.body; // [{ id, price, quantity }]
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const info = db.prepare(`
    INSERT INTO orders (user_id, total_price)
    VALUES (?, ?)
  `).run(req.user.id, total);

  const orderId = info.lastInsertRowid;
  const insert = db.prepare(`
    INSERT INTO order_items (order_id, product_id, quantity, price)
    VALUES (?, ?, ?, ?)
  `);

  items.forEach(i => insert.run(orderId, i.id, i.quantity, i.price));
  res.status(201).json({ order_id: orderId });
};