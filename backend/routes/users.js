const router = require('express').Router();
const { body, param } = require('express-validator');

const requireAuth = require('../middlewares/requireAuth');
const validate    = require('../middlewares/validateMiddleware');
const db          = require('../db');

const {
  getUser,
  updateUser,
  deleteUser,
  exportUserData,
  exportUserDataByEmail,
  listUsers,
} = require('../controllers/userController');

// Espace membre
router.get('/me',    requireAuth(), getUser);
router.put('/me',    requireAuth(), updateUser);
router.delete('/me', requireAuth(), deleteUser);
router.get('/me/export',       requireAuth(), exportUserData);
router.post('/me/export-mail', requireAuth(), exportUserDataByEmail);

// Modérateur + Admin
router.get('/',
  requireAuth(),
  (req, res, next) => {
    if (!['moderator','admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'forbidden' });
    }
    return listUsers(req, res, next);
  }
);

// Admin: update user
router.put('/:id',
  requireAuth('admin'),
  [
    param('id').isInt().toInt(),
    body('email').optional().isEmail(),
    body('first_name').optional().isString(),
    body('last_name').optional().isString(),
    body('address').optional().isString(),
    body('phone').optional().isString(),
    body('role').optional().isIn(['member','moderator','admin'])
  ],
  validate,
  (req, res) => {
    const { id } = req.params;
    const { email, first_name, last_name, address, phone, role } = req.body;

    const fields = [], vals = [];
    if (email)      { fields.push('email = ?');      vals.push(email); }
    if (first_name) { fields.push('first_name = ?'); vals.push(first_name); }
    if (last_name)  { fields.push('last_name = ?');  vals.push(last_name); }
    if (address)    { fields.push('address = ?');    vals.push(address); }
    if (phone)      { fields.push('phone = ?');      vals.push(phone); }
    if (role)       { fields.push('role = ?');       vals.push(role); }

    if (fields.length === 0) return res.status(400).json({ error: 'Aucun champ à modifier' });

    vals.push(id);
    db.prepare(`UPDATE users SET ${fields.join(', ')}, updated_at=CURRENT_TIMESTAMP WHERE id = ?`).run(...vals);
    return res.json({ message: 'Utilisateur mis à jour' });
  }
);

// Admin: delete user
router.delete('/:id',
  requireAuth('admin'),
  [ param('id').isInt().toInt() ],
  validate,
  (req, res) => {
    const id = req.params.id;
    const u = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!u) return res.status(404).json({ error: 'Not found' });
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return res.json({ ok: true });
  }
);

module.exports = router;
