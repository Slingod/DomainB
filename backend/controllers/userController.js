const db = require('../db');
const { sendCustomEmail } = require('../utils/email');

// Récupérer le profil connecté
exports.getUser = (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, first_name, last_name, address, phone, role
    FROM users
    WHERE id = ?
  `).get(req.user.id);
  res.json(user);
};

// Mettre à jour son propre profil
exports.updateUser = (req, res) => {
  const { first_name, last_name, address, phone } = req.body;
  db.prepare(`
    UPDATE users
    SET first_name = ?, last_name = ?, address = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(first_name, last_name, address, phone, req.user.id);
  res.json({ message: 'Profil mis à jour' });
};

// Supprimer son propre compte (ou pour admin, supprimer un autre)
exports.deleteUser = (req, res) => {
  const targetId = req.params.id || req.user.id;
  db.prepare('DELETE FROM users WHERE id = ?').run(targetId);
  res.json({ message: 'Utilisateur supprimé' });
};

// Lister tous les utilisateurs (modérateur & admin)
exports.listUsers = (req, res) => {
  const users = db.prepare(`
    SELECT 
      id, username, email, first_name, last_name,
      address,
      phone,
      role, created_at
    FROM users
    ORDER BY created_at DESC
  `).all();
  res.json(users);
};

// Export RGPD : télécharger ses données au format JSON
exports.exportUserData = (req, res) => {
  const user = db.prepare(`
    SELECT id, username, email, first_name, last_name, address, phone, created_at
    FROM users
    WHERE id = ?
  `).get(req.user.id);

  const orders = db.prepare(`
    SELECT id, total_price AS total, created_at
    FROM orders
    WHERE user_id = ?
  `).all(req.user.id);

  for (const order of orders) {
    const items = db.prepare(`
      SELECT oi.product_id, p.title, oi.quantity, oi.unit_price
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
    `).all(order.id);

    order.items = items;
  }

  res.setHeader('Content-Disposition', 'attachment; filename="user-data.json"');
  res.json({ user, orders });
};

// Export RGPD par email : envoie un JSON en pièce jointe
exports.exportUserDataByEmail = async (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, username, email, first_name, last_name, address, phone, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    const orders = db.prepare(`
      SELECT id, total_price AS total, created_at
      FROM orders WHERE user_id = ?
    `).all(req.user.id);

    for (const order of orders) {
      const items = db.prepare(`
        SELECT oi.product_id, p.title, oi.quantity, oi.unit_price
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = ?
      `).all(order.id);

      order.items = items;
    }

    const payload = { user, orders };
    const jsonString = JSON.stringify(payload, null, 2);

    await sendCustomEmail({
      to: user.email,
      subject: 'Votre export de données (RGPD)',
      text: `Bonjour ${user.username},\n\nVous trouverez en pièce jointe l’export de vos données.\n\nCordialement,\nL’équipe du Domaine Berthuit`,
      attachments: [
        {
          filename: 'export-donnees.json',
          content: jsonString,
          contentType: 'application/json'
        }
      ]
    });

    res.json({ message: 'Export envoyé par email !' });
  } catch (err) {
    console.error('Erreur /users/me/export-mail :', err);
    res.status(500).json({ error: 'Impossible d’envoyer l’export par email.' });
  }
};

// Modérateur/admin : modifier email, address ou phone d’un autre utilisateur
exports.moderateUpdate = (req, res) => {
  const { email, address, phone } = req.body;

  const targetUser = db.prepare('SELECT id, role FROM users WHERE id = ?')
    .get(req.params.id);

  if (!targetUser) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  const targetRole = String(targetUser.role).toLowerCase();
  const actorRole  = String(req.user.role).toLowerCase();

  if (actorRole === 'moderator' && targetRole !== 'member') {
    return res.status(403).json({
      error: 'Vous ne pouvez modifier que les membres simples.'
    });
  }

  const fields = [];
  const values = [];

  if (email)   { fields.push('email = ?');   values.push(email); }
  if (address) { fields.push('address = ?'); values.push(address); }
  if (phone)   { fields.push('phone = ?');   values.push(phone); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Aucun champ à modifier.' });
  }

  const sql = `
    UPDATE users
    SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  values.push(req.params.id);
  db.prepare(sql).run(...values);

  res.json({ message: 'Utilisateur modifié avec succès.' });
};

// Admin only — changer le rôle d’un utilisateur
exports.updateUserRole = (req, res) => {
  const { role: newRole } = req.body;
  const userId = req.params.id;

  if (req.user.id.toString() === userId) {
    return res.status(400).json({ error: "Vous ne pouvez pas changer votre propre rôle." });
  }

  const roles = ['member','moderator','admin'];
  if (!roles.includes(newRole)) {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }

  db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(newRole, userId);

  res.json({ message: `Rôle mis à jour en "${newRole}".` });
};
