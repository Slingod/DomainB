const router = require('express').Router();
const { body } = require('express-validator');
const { signup, login, verifyEmail } = require('../controllers/authController');
const validate = require('../middlewares/validateMiddleware');
const rateLimiter = require('../middlewares/rateLimiter');

router.post('/signup',
  rateLimiter,
  [
    body('username').trim().isLength({ min: 3 }).withMessage('Pseudo trop court'),
    body('email').isEmail().withMessage('Email invalide'),
    body('password').isLength({ min: 6 }).withMessage('Mot de passe trop court')
  ],
  validate,
  signup
);

router.post('/login',
  rateLimiter,
  [
    body('email').isEmail().withMessage('Email invalide'),
    body('password').notEmpty().withMessage('Mot de passe requis')
  ],
  validate,
  login
);

router.get('/verify-email', verifyEmail);

module.exports = router;