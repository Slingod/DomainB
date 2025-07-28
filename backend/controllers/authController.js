const db     = require('../db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');
const xss    = require('xss');
const {
  sendVerificationEmail,
  sendResetEmail,
} = require('../utils/email');

// Inscription
exports.signup = async (req, res) => {
  try {
    const username = xss(req.body.username?.trim());
    const email    = xss(req.body.email?.trim().toLowerCase());
    const password = req.body.password;
    const hash     = bcrypt.hashSync(password, 10);

    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const info = stmt.run(username, email, hash);

    const token = crypto.randomBytes(32).toString('hex');
    db.prepare(
      'INSERT INTO email_verifications (user_id, token) VALUES (?, ?)'
    ).run(info.lastInsertRowid, token);

    try {
      await sendVerificationEmail(email, token);
      console.log(`✔ Email de vérification envoyé à ${email}`);
    } catch (mailErr) {
      console.error('❌ Échec de l’envoi du mail de vérification :', mailErr);
    }

    return res.status(201).json({ message: 'Compte créé ! Vérifiez votre email.' });

  } catch (err) {
    console.error('Erreur /auth/signup :', err);
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const msg = err.message.includes('.email')
        ? "Cette adresse email est déjà utilisée."
        : "Ce nom d'utilisateur est déjà pris.";
      return res.status(409).json({ error: msg });
    }
    return res.status(500).json({ error: 'Impossible de créer le compte.' });
  }
};

// Vérification email
exports.verifyEmail = (req, res) => {
  const { token } = req.query;
  const record = db
    .prepare('SELECT * FROM email_verifications WHERE token = ?')
    .get(token);

  if (!record) {
    const html = fs.readFileSync(path.join(__dirname, '../views/tokenInvalid.html'), 'utf-8');
    return res.status(400).send(html);
  }

  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
    .run(record.user_id);
  db.prepare('DELETE FROM email_verifications WHERE id = ?')
    .run(record.id);

  const html = fs.readFileSync(path.join(__dirname, '../views/emailVerified.html'), 'utf-8');
  res.send(html);
};

// Connexion
exports.login = (req, res) => {
  const email = xss(req.body.email?.trim().toLowerCase());
  const password = req.body.password;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur non trouvé' });
  }
  if (!bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Mot de passe incorrect' });
  }
  if (!user.email_verified) {
    return res.status(403).json({ error: 'Email non vérifié' });
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    role: user.role,
    username: user.username,
  });
};

// Demande de réinitialisation (via /auth/forgot-password)
exports.forgotPassword = async (req, res) => {
  try {
    const email = xss(req.body.email?.trim().toLowerCase());
    if (!email) return res.status(400).json({ error: 'Email requis' });

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.json({ message: 'Si ce compte existe, vous recevrez un email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
    db.prepare('INSERT INTO password_resets (user_id, token) VALUES (?, ?)').run(user.id, token);

    await sendResetEmail(email, token);
    res.json({ message: 'Si ce compte existe, vous recevrez un email.' });

  } catch (err) {
    console.error('Erreur /auth/forgot-password :', err);
    res.status(500).json({ error: 'Erreur lors de la demande de réinitialisation.' });
  }
};

// Réinitialisation du mot de passe
exports.resetPassword = async (req, res) => {
  try {
    const token = req.body.token?.trim();
    const newPassword = req.body.newPassword;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token et nouveau mot de passe requis.' });
    }

    const record = db.prepare('SELECT * FROM password_resets WHERE token = ?').get(token);
    if (!record) {
      return res.status(400).json({ error: 'Lien expiré ou invalide.' });
    }

    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(hash, record.user_id);

    db.prepare('DELETE FROM password_resets WHERE id = ?').run(record.id);

    res.json({ message: 'Mot de passe réinitialisé avec succès.' });

  } catch (err) {
    console.error('Erreur /auth/reset-password :', err);
    res.status(500).json({ error: 'Impossible de réinitialiser le mot de passe.' });
  }
};

// ✅ Route alternative pour compatibilité frontend
exports.requestPasswordReset = async (req, res) => {
  try {
    const email = xss(req.body.email?.trim().toLowerCase());
    if (!email) return res.status(400).json({ error: 'Email requis.' });

    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.json({ message: 'Si ce compte existe, vous recevrez un email.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
    db.prepare('INSERT INTO password_resets (user_id, token) VALUES (?, ?)').run(user.id, token);

    await sendResetEmail(email, token);
    res.json({ message: 'Lien de réinitialisation envoyé si l’email existe.' });

  } catch (err) {
    console.error('Erreur /auth/request-password-reset :', err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};