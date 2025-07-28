const router = require('express').Router();
const { body } = require('express-validator');

const rateLimiter = require('../middlewares/rateLimiter');
const validate    = require('../middlewares/validateMiddleware');

const {
  signup,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

// ↪ Inscription avec validation + protection anti‑abus
router.post(
  '/signup',
  rateLimiter,
  [
    body('username')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Pseudo trop court (min 3 caractères)'),
    body('email')
      .isEmail()
      .withMessage('Email invalide'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Mot de passe trop court (min 6 caractères)')
  ],
  validate,
  signup
);

// ↪ Connexion
router.post(
  '/login',
  rateLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide'),
    body('password')
      .notEmpty()
      .withMessage('Mot de passe requis')
  ],
  validate,
  login
);

// ↪ Vérification de l’email (lien envoyé après signup)
router.get('/verify-email', verifyEmail);

// ↪ Demande de réinitialisation de mot de passe
router.post(
  '/forgot-password',
  rateLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
  ],
  validate,
  forgotPassword
);

// ✅ Alias front‑friendly pour la même fonction
router.post(
  '/request-password-reset',
  rateLimiter,
  [
    body('email')
      .isEmail()
      .withMessage('Email invalide')
  ],
  validate,
  forgotPassword
);

// ↪ Réinitialisation via token + nouveau mot de passe
router.post(
  '/reset-password',
  rateLimiter,
  [
    body('token')
      .notEmpty()
      .withMessage('Token requis'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('Nouveau mot de passe trop court (min 6 caractères)')
  ],
  validate,
  resetPassword
);

module.exports = router;