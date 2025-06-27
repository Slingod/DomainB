const nodemailer = require('nodemailer');
require('dotenv').config();

const PUBLIC_URL = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT}`;

let transporterPromise = null;

// Crée un transporteur Nodemailer : vrai SMTP si configuré, sinon Ethereal
async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    // Ton propre serveur SMTP (ex. Gmail, SendGrid…)
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

exports.sendVerificationEmail = async (toEmail, token) => {
  const transporter = await getTransporter();
  const verifyUrl = `${PUBLIC_URL}/auth/verify-email?token=${token}`;
  const info = await transporter.sendMail({
    from: `"Mon Shop" <no-reply@monshop.com>`,
    to: toEmail,
    subject: '🔒 Vérifiez votre adresse email',
    text: `Bienvenue sur Mon Shop ! Veuillez copier/coller ce lien dans votre navigateur pour vérifier votre email : ${verifyUrl}`,
    html: `
      <div style="font-family:Arial,sans-serif; background:#f4f4f4; padding:20px;">
        <div style="max-width:600px; margin:0 auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
          <div style="background:#007bff; color:white; padding:20px; text-align:center;">
            <h1>Bienvenue sur Mon Shop !</h1>
          </div>
          <div style="padding:20px; color:#333;">
            <p>Merci de vous être inscrit. Cliquez sur le bouton ci-dessous pour vérifier votre adresse email :</p>
            <p style="text-align:center;">
              <a href="${verifyUrl}"
                 style="display:inline-block; padding:12px 24px; background:#28a745; color:white; text-decoration:none; border-radius:4px; font-weight:bold;">
                Vérifier mon email
              </a>
            </p>
            <p>Si le bouton ne fonctionne pas, copiez-collez ce lien :</p>
            <p style="word-break:break-all;"><small>${verifyUrl}</small></p>
            <hr style="border:none; border-top:1px solid #eee; margin:20px 0;" />
            <p style="font-size:12px; color:#999;">
              Si vous n&apos;avez pas créé de compte, ignorez cet email.
            </p>
          </div>
        </div>
      </div>
    `
  });

  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

/**
 * Envoie un email générique avec options Nodemailer
 * Ex : export RGPD en pièce jointe, notifications, etc.
 */
exports.sendCustomEmail = async (opts) => {
  const transporter = await getTransporter();
  const info = await transporter.sendMail({
    from: `"Mon Shop" <no-reply@monshop.com>`,
    ...opts,
  });
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};
