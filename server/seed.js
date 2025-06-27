const db = require('./db');
async function seed() {
  // Supprime tout (optionnel)
  db.prepare('DELETE FROM users').run();
  db.prepare('DELETE FROM products').run();
  // Crée un admin
  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, 'admin', 1)
  `).run('admin', 'admin@shop.com', require('bcrypt').hashSync('admin123', 10));
  // 2 Members
  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, 'member', 1)
  `).run('alice', 'alice@shop.com', require('bcrypt').hashSync('secret', 10));
  db.prepare(`
    INSERT INTO users (username, email, password_hash, role, email_verified)
    VALUES (?, ?, ?, 'moderator', 1)
  `).run('mod', 'mod@shop.com', require('bcrypt').hashSync('modpass', 10));
  // Quelques produits
  const insertP = db.prepare('INSERT INTO products (title, description, price) VALUES (?, ?, ?)');
  insertP.run('Produit A', 'Description A', 9.99);
  insertP.run('Produit B', 'Description B', 19.99);
  console.log('► Seed terminé');
}
seed();