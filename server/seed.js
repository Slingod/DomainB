const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  // 1) Vider les tables
  db.prepare('DELETE FROM email_verifications').run();
  db.prepare('DELETE FROM order_items').run();
  db.prepare('DELETE FROM orders').run();
  db.prepare('DELETE FROM products').run();
  db.prepare('DELETE FROM users').run();

  // 2) Créer un admin
  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, 'admin', 1)
  `).run(
    'admin',
    'admin@shop.com',
    bcrypt.hashSync('admin123', 10)
  );

  // 3) Créer deux autres utilisateurs
  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, 'member', 1)
  `).run(
    'alice',
    'alice@shop.com',
    bcrypt.hashSync('secret', 10)
  );

  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, 'moderator', 1)
  `).run(
    'mod',
    'mod@shop.com',
    bcrypt.hashSync('modpass', 10)
  );

  // 4) Insérer des produits avec stock initial
  const insertP = db.prepare(`
    INSERT INTO products (title, description, price, stock)
    VALUES (?, ?, ?, ?)
  `);
  insertP.run('Produit A', 'Description A', 9.99, 50);
  insertP.run('Produit B', 'Description B', 19.99, 20);

  console.log('► Seed terminé');
}

seed();