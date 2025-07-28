const db = require('../db');

exports.listUserOrders = (req, res) => {
  // 1) Récupère pour l’utilisateur toutes ses commandes avec leur total
  const orders = db
    .prepare(`
      SELECT o.id, o.created_at,
             SUM(oi.quantity * oi.unit_price) AS total
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `)
    .all(req.user.id);

  // 2) Complète chaque commande avec ses lignes détaillées
  const detailed = orders.map(o => {
    const items = db
      .prepare(`
        SELECT 
          oi.product_id, 
          p.title, 
          oi.quantity, 
          oi.unit_price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `)
      .all(o.id);
    return { ...o, items };
  });

  res.json(detailed);
};

exports.createOrder = (req, res) => {
  const userId = req.user.id;
  const { items } = req.body;

  // 1) Validation basique
  if (!Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ error: 'Le champ `items` (tableau) est requis.' });
  }

  // 2) Calcul du total général avant transaction
  let totalPrice = 0;
  for (const line of items) {
    const { product_id, quantity } = line;
    if (!product_id || !quantity || quantity < 1) {
      return res
        .status(400)
        .json({ error: 'Chaque ligne doit contenir product_id et quantity valides.' });
    }
    const prod = db
      .prepare('SELECT price, stock FROM products WHERE id = ?')
      .get(product_id);
    if (!prod) {
      return res.status(400).json({ error: `Produit ${product_id} introuvable.` });
    }
    if (prod.stock < quantity) {
      return res
        .status(400)
        .json({ error: `Stock insuffisant pour le produit ${product_id}.` });
    }
    totalPrice += prod.price * quantity;
  }

  // 3) Transaction : création order + order_items + décrément stock
  const tx = db.transaction(() => {
    // a) Création de l’en-tête de commande (avec total_price)
    const info = db
      .prepare(`
        INSERT INTO orders (user_id, total_price, created_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `)
      .run(userId, totalPrice);
    const orderId = info.lastInsertRowid;

    // b) Pour chaque ligne : décrémente le stock et insère la ligne
    for (const line of items) {
      const { product_id, quantity } = line;
      // récupère de nouveau pour garantir cohérence
      const product = db
        .prepare('SELECT price, stock FROM products WHERE id = ?')
        .get(product_id);

      // décrémente
      db
        .prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
        .run(quantity, product_id);

      // insertion de la ligne
      db
        .prepare(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?)
        `)
        .run(orderId, product_id, quantity, product.price);
    }

    return orderId;
  });

  try {
    const newOrderId = tx();
    res.status(201).json({ message: 'Commande créée.', orderId: newOrderId });
  } catch (err) {
    // rollback automatique
    res.status(400).json({ error: err.message });
  }
};