const router = require('express').Router();
const { body } = require('express-validator');

const validate = require('../middlewares/validateMiddleware');
const rateLimit = require('express-rate-limit');

const crypto  = require('crypto');
const bcrypt  = require('bcrypt'); // ou bcryptjs si tu l'utilises
const jwtLib  = require('jsonwebtoken');
const db      = require('../db');
const { signAccess, signRefresh, setAuthCookies, clearAuthCookies } = require('../utils/jwt');
const requireAuth = require('../middlewares/requireAuth');

const {
  signup,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// helpers
function sha256(s) { return crypto.createHash('sha256').update(s).digest('hex'); }
function verifyWithAnySecret(token) {
  const secrets = [process.env.JWT_SECRET, process.env.JWT_SECRET_PREVIOUS].filter(Boolean);
  let lastErr;
  for (const s of secrets) {
    try { return jwtLib.verify(token, s); } catch (e) { lastErr = e; }
  }
  throw lastErr || new Error('Invalid token');
}

// limiters par endpoint
const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});
const refreshLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 200, // large pour éviter 429 pendant des rafales
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * GET /auth/csrf
 * Pose ou réutilise le cookie csrf_token (double-submit cookie).
 * Appelé au boot par le front (via api.js).
 */
router.get('/csrf', (req, res) => {
  const SECURE = process.env.COOKIE_SECURE === 'true';
  let token = req.cookies['csrf_token'];
  if (!token) token = crypto.randomBytes(24).toString('hex');
  res.cookie('csrf_token', token, {
    httpOnly: false, secure: SECURE, sameSite: 'lax', path: '/'
  });
  res.json({ ok: true });
});

// --- Signup / Email / Reset (inchangé) ---
router.post(
  '/signup',
  loginLimiter, // anti-abus
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Pseudo trop court (min 3 caractères)'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court (min 6 caractères)')
  ],
  validate,
  signup
);

router.get('/verify-email', verifyEmail);

router.post(
  '/forgot-password',
  loginLimiter,
  [ body('email').isEmail().withMessage('Email invalide') ],
  validate,
  forgotPassword
);

router.post(
  '/request-password-reset',
  loginLimiter,
  [ body('email').isEmail().withMessage('Email invalide') ],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  loginLimiter,
  [
    body('token').notEmpty().withMessage('Token requis'),
    body('newPassword').isLength({ min: 6 }).withMessage('Nouveau mot de passe trop court (min 6 caractères)')
  ],
  validate,
  resetPassword
);

// --- Login (cookies httpOnly) ---
router.post(
  '/login',
  loginLimiter,
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  validate,
  async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT id, email, password_hash, role FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Identifiants invalides' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Identifiants invalides' });

    const accessToken = signAccess(user);
    const { token: refreshToken } = signRefresh(user);

    const payload = jwtLib.decode(refreshToken); // on vient de signer
    const exp = (payload?.exp || 0); // epoch seconds

    db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)')
      .run(user.id, sha256(refreshToken), exp);

    const csrfToken = crypto.randomBytes(24).toString('hex');
    setAuthCookies(res, { accessToken, refreshToken, csrfToken });

    return res.json({ user: { id: user.id, email: user.email, role: user.role } });
  }
);

// --- Refresh (rotation) ---
router.post('/refresh', refreshLimiter, (req, res) => {
  const refresh = req.cookies['refresh_token'];
  if (!refresh) return res.status(401).json({ error: 'Missing refresh token' });

  let payload;
  try {
    payload = verifyWithAnySecret(refresh);
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }

  const row = db.prepare(
    'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL'
  ).get(sha256(refresh));
  if (!row) return res.status(401).json({ error: 'Refresh token not found' });

  // révoque l'ancien (rotation)
  db.prepare('UPDATE refresh_tokens SET revoked_at = strftime(\'%s\',\'now\') WHERE id = ?').run(row.id);

  // nouvel access + refresh
  const user = db.prepare('SELECT id, role, email FROM users WHERE id = ?').get(Number(payload.sub));
  if (!user) return res.status(401).json({ error: 'User not found' });

  const accessToken = signAccess(user);
  const { token: newRefresh } = signRefresh(user);
  const newPayload = jwtLib.decode(newRefresh);
  db.prepare('INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?,?,?)')
    .run(user.id, sha256(newRefresh), newPayload.exp);

  const csrfToken = crypto.randomBytes(24).toString('hex');
  setAuthCookies(res, { accessToken, refreshToken: newRefresh, csrfToken });

  return res.json({ ok: true });
});

// --- Logout ---
router.post('/logout', loginLimiter, (req, res) => {
  const refresh = req.cookies['refresh_token'];
  if (refresh) {
    db.prepare('UPDATE refresh_tokens SET revoked_at = strftime(\'%s\',\'now\') WHERE token_hash = ?')
      .run(sha256(refresh));
  }
  clearAuthCookies(res);
  return res.json({ ok: true });
});

// --- Me ---
router.get('/me', requireAuth(), (req, res) => {
  const u = db.prepare('SELECT id, email, role, username FROM users WHERE id = ?').get(req.user.id);
  if (!u) return res.status(404).json({ error: 'Not found' });
  res.json({ user: u });
});

module.exports = router;