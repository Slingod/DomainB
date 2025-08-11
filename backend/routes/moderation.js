const router = require('express').Router();
const { body, param } = require('express-validator');

const requireAuth = require('../middlewares/requireAuth');
const validate    = require('../middlewares/validateMiddleware');
const db          = require('../db');

function requireModeratorOrAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'missing_token' });
  if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'forbidden' });
  }
  next();
}

// Liste des utilisateurs (modérateur + admin)
router.get(
  '/users',
  requireAuth(),
  requireModeratorOrAdmin,
  (_req, res) => {
    const rows = db.prepare(`
      SELECT id, username, email, role, address, phone, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    res.json(rows);
  }
);

// Éditer un utilisateur (modérateur + admin)
router.put(
  '/users/:id',
  requireAuth(),
  requireModeratorOrAdmin,
  [
    param('id').isInt().toInt(),
    body('email').optional().isEmail().trim(),
    body('address').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('role').optional().isIn(['member','moderator','admin'])
  ],
  validate,
  (req, res) => {
    const { id } = req.params;

    const exists = db.prepare('SELECT id FROM users WHERE id = ?').get(id);
    if (!exists) return res.status(404).json({ error: 'Not found' });

    const updatable = ['email','address','phone','role'];
    const fields = [], values = [];
    for (const k of updatable) {
      if (req.body[k] !== undefined) {
        fields.push(`${k} = ?`);
        values.push(req.body[k]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'Aucun champ à modifier' });

    values.push(id);
    db.prepare(
      `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).run(...values);

    const user = db.prepare(
      'SELECT id, username, email, role, address, phone, created_at, updated_at FROM users WHERE id = ?'
    ).get(id);

    res.json({ user });
  }
);

module.exports = router;