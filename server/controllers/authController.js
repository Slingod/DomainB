const db     = require('../db');
const bcrypt = require('bcrypt');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/email');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hash = bcrypt.hashSync(password, 10);

    // 1) Création de l'utilisateur
    const stmt = db.prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    );
    const info = stmt.run(username, email, hash);

    // 2) Génération et stockage du token de vérif
    const token = crypto.randomBytes(32).toString('hex');
    db.prepare(
      'INSERT INTO email_verifications (user_id, token) VALUES (?, ?)'
    ).run(info.lastInsertRowid, token);

    // 3) Envoi de l'email de vérification (ne bloque pas la création du compte)
    try {
      await sendVerificationEmail(email, token);
      console.log(`✔ Email de vérification envoyé à ${email}`);
    } catch (mailErr) {
      console.error('❌ Échec de l’envoi du mail de vérification :', mailErr);
    }

    // 4) Réponse 201 même en cas d’erreur SMTP
    return res
      .status(201)
      .json({ message: 'Compte créé ! Vérifiez votre email.' });

  } catch (err) {
    console.error('Erreur /auth/signup :', err);
    // Gestion des contraintes d'unicité
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      const msg = err.message.includes('.email')
        ? "Cette adresse email est déjà utilisée."
        : "Ce nom d'utilisateur est déjà pris.";
      return res.status(409).json({ error: msg });
    }
    // Autre erreur
    return res.status(500).json({ error: 'Impossible de créer le compte.' });
  }
};

exports.verifyEmail = (req, res) => {
  const { token } = req.query;
  const record = db
    .prepare('SELECT * FROM email_verifications WHERE token = ?')
    .get(token);

  if (!record) {
    return res
      .status(400)
      .send(`<html>
        <head><title>Token invalide</title>
          <style>
            body { font-family: sans-serif; background:#f8f9fa; margin:0; }
            .container {
              max-width: 400px;
              margin:10% auto;
              padding:2rem;
              background:white;
              border-radius:8px;
              text-align:center;
              box-shadow:0 2px 10px rgba(0,0,0,0.1);
            }
            h1 { color:#dc3545; }
            a {
              display:inline-block;
              margin-top:1rem;
              color:white;
              background:#6c757d;
              padding:0.5rem 1rem;
              border-radius:4px;
              text-decoration:none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Token invalide</h1>
            <p>Ce lien de vérification n’est pas valide ou a déjà été utilisé.</p>
            <a href="/">Retour à l’accueil</a>
          </div>
        </body>
      </html>`);
  }

  // Marque email comme vérifié et supprime le token
  db.prepare('UPDATE users SET email_verified = 1 WHERE id = ?')
    .run(record.user_id);
  db.prepare('DELETE FROM email_verifications WHERE id = ?')
    .run(record.id);

  // Page de succès
  res.send(`<html>
    <head><title>Email vérifié</title>
      <style>
        body { font-family: sans-serif; background:#e9f7ef; margin:0; }
        .container {
          max-width: 400px;
          margin:10% auto;
          padding:2rem;
          background:white;
          border-radius:8px;
          text-align:center;
          box-shadow:0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color:#28a745; }
        p { color:#333; }
        a {
          display:inline-block;
          margin-top:1rem;
          color:white;
          background:#28a745;
          padding:0.5rem 1rem;
          border-radius:4px;
          text-decoration:none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✓ Email vérifié !</h1>
        <p>Votre adresse a bien été confirmée.</p>
        <a href="http://localhost:5173/login">Se connecter</a>
      </div>
    </body>
  </html>`);
};

exports.login = (req, res) => {
  const { email, password } = req.body;
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
  res.json({ token, role: user.role });
};