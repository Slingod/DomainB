const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const role = require('../middlewares/roleMiddleware');
const {
  getUser,
  updateUser,
  deleteUser,
  exportUserData,
  exportUserDataByEmail,
  listUsers,
  updateUserRole
} = require('../controllers/userController');
const db = require('../db');

// Membre : consulter / modifier / supprimer son profil
router.get('/me', auth, getUser);
router.put('/me', auth, updateUser);
router.delete('/me', auth, deleteUser);

// Export RGPD JSON direct
router.get('/me/export', auth, exportUserData);

// Export RGPD par email (PJ JSON)
router.post('/me/export-mail', auth, exportUserDataByEmail);

// Modérateur + Admin : lister tous les utilisateurs
router.get('/', auth, role(['moderator','admin']), listUsers);

// ✨ Nouveau : mise à jour complète d’un utilisateur (admin seulement)
router.put('/:id', auth, role(['admin']), (req, res) => {
  const { id } = req.params;
  const { email, first_name, last_name, address, phone, role } = req.body;

  const fields = [], vals = [];
  if (email) { fields.push('email = ?'); vals.push(email); }
  if (first_name) { fields.push('first_name = ?'); vals.push(first_name); }
  if (last_name) { fields.push('last_name = ?'); vals.push(last_name); }
  if (address) { fields.push('address = ?'); vals.push(address); }
  if (phone) { fields.push('phone = ?'); vals.push(phone); }
  if (role) { fields.push('role = ?'); vals.push(role); }

  if (fields.length === 0) {
    return res.status(400).json({ error: 'Aucun champ à modifier' });
  }

  vals.push(id);
  db.prepare(`UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...vals);

  return res.json({ message: 'Utilisateur mis à jour' });
});

// **Admin : changer le rôle d’un utilisateur (si vous voulez conserver l’ancienne route)**
// router.put('/:id/role', auth, role(['admin']), updateUserRole);

// Admin : supprimer n'importe quel utilisateur
router.delete('/:id', auth, role(['admin']), deleteUser);

module.exports = router;