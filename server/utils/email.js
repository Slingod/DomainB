const nodemailer = require('nodemailer');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PUBLIC_URL   = process.env.PUBLIC_URL   || `http://localhost:${process.env.PORT || 5000}`;

let transporterPromise = null;
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Ton propre SMTP
    transporterPromise = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Compte de test Ethereal
    const testAccount = await nodemailer.createTestAccount();
    transporterPromise = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('💌 Utilisation d’un compte Ethereal :', testAccount);
  }
  return transporterPromise;
}

// Vérification d’email (lien backend)
exports.sendVerificationEmail = async (toEmail, token) => {
  const transporter = await getTransporter();
  const verifyUrl = `${PUBLIC_URL}/auth/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: `"Mon Shop" <no-reply@monshop.com>`,
    to: toEmail,
    subject: '🔒 Vérifiez votre adresse email',
    text: `Bienvenue sur Mon Shop ! Copiez ce lien pour vérifier : ${verifyUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="background:#007bff; color:white; padding:20px; text-align:center;">
            <h1>Bienvenue sur Mon Shop !</h1>
          </div>
          <div style="padding:20px; color:#333;">
            <p>Cliquez pour vérifier votre email :</p>
            <p style="text-align:center;">
              <a href="${verifyUrl}"
                 style="padding:12px 24px;background:#28a745;color:white;text-decoration:none;border-radius:4px;">
                Vérifier mon email
              </a>
            </p>
            <p><small>${verifyUrl}</small></p>
          </div>
        </div>
      </div>`
  });
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

// Réinitialisation de mot de passe (lien frontend)
exports.sendResetEmail = async (toEmail, token) => {
  const transporter = await getTransporter();
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const info = await transporter.sendMail({
    from: `"Mon Shop" <no-reply@monshop.com>`,
    to: toEmail,
    subject: '🔑 Réinitialisation du mot de passe',
    text: `Vous avez demandé une réinitialisation. Copiez ce lien : ${resetUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="background:#dc3545; color:white; padding:20px; text-align:center;">
            <h2>Réinitialisation du mot de passe</h2>
          </div>
          <div style="padding:20px; color:#333;">
            <p>Cliquez pour réinitialiser :</p>
            <p style="text-align:center;">
              <a href="${resetUrl}"
                 style="padding:12px 24px;background:#dc3545;color:white;text-decoration:none;border-radius:4px;">
                Réinitialiser mon mot de passe
              </a>
            </p>
            <p><small>${resetUrl}</small></p>
          </div>
        </div>
      </div>`
  });
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

// Envoi générique
exports.sendCustomEmail = async (opts) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({ from:`"Mon Shop"<no-reply@monshop.com>`, ...opts });
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};