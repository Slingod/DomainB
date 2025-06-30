const nodemailer = require('nodemailer');
const fs         = require('fs');
const path       = require('path');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const PUBLIC_URL   = process.env.PUBLIC_URL   || `http://localhost:${process.env.PORT || 5000}`;

let transporterPromise = null;
async function getTransporter() {
  if (transporterPromise) return transporterPromise;
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporterPromise = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporterPromise = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log('💌 Utilisation d’un compte Ethereal :', testAccount);
  }
  return transporterPromise;
}

// charge un template et remplace {{KEY}} par la valeur
function renderTemplate(filename, replacements) {
  let tpl = fs.readFileSync(path.join(__dirname, '../views', filename), 'utf-8');
  for (const [key, val] of Object.entries(replacements)) {
    tpl = tpl.replace(new RegExp(`{{${key}}}`, 'g'), val);
  }
  return tpl;
}

exports.sendVerificationEmail = async (toEmail, token) => {
  const transporter = await getTransporter();
  const verifyUrl = `${PUBLIC_URL}/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Mon Shop" <no-reply@monshop.com>`,
    to: toEmail,
    subject: '🔒 Vérifiez votre adresse email',
    text: `Bienvenue sur Mon Shop ! Copiez ce lien pour vérifier : ${verifyUrl}`,
    html: renderTemplate('verifyEmail.html', { VERIFY_URL: verifyUrl })
  }).then(info => {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};

exports.sendResetEmail = async (toEmail, token) => {
  const transporter = await getTransporter();
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Mon Shop" <no-reply@monshop.com>`,
    to: toEmail,
    subject: '🔑 Réinitialisation du mot de passe',
    text: `Vous avez demandé une réinitialisation. Copiez ce lien : ${resetUrl}`,
    html: renderTemplate('resetPassword.html', { RESET_URL: resetUrl })
  }).then(info => {
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  });
};

exports.sendCustomEmail = async (opts) => {
  const transporter = await getTransporter();
  await transporter.sendMail({ from:`"Mon Shop" <no-reply@monshop.com>`, ...opts })
    .then(info => console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)));
};