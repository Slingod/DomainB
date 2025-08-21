const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const mime = require('mime-types');

const router = express.Router();

// --- limites & formats ---
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

// --- dossiers ---
const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const DEST_DIR = path.join(PUBLIC_DIR, 'uploads', 'products');
fs.mkdirSync(DEST_DIR, { recursive: true });

// --- multer en mémoire ---
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) return cb(new Error('FORMAT_INVALID'));
    cb(null, true);
  }
});

// helper pour exécuter upload.single avec gestion d'erreurs claires
function runMulter(req, res, next) {
  const single = upload.single('file');
  single(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'FILE_TOO_LARGE' });
    }
    if (err.message === 'FORMAT_INVALID') {
      return res.status(415).json({ error: 'FORMAT_INVALID' });
    }
    console.error('Multer error:', err);
    return res.status(400).json({ error: 'UPLOAD_FAILED' });
  });
}

// TODO: branche ton vrai middleware d’auth admin ici
// const requireAdmin = require('../middlewares/requireAdmin');
// router.post('/images', requireAdmin, runMulter, async (req, res) => {
router.post('/images', runMulter, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'NO_FILE' });

    // --- sécurité: vérif réelle par sharp (évite les faux MIME) ---
    await sharp(req.file.buffer).metadata(); // si pas image -> throw

    const base = crypto.randomBytes(16).toString('hex');
    const targetW = 1200;

    // WebP — EXIF purgé (ne PAS utiliser .withMetadata())
    const webpPath = path.join(DEST_DIR, `${base}.webp`);
    await sharp(req.file.buffer)
      .rotate() // applique l’orientation puis supprime EXIF
      .resize({ width: targetW, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(webpPath);

    // JPEG fallback — EXIF purgé
    const jpegPath = path.join(DEST_DIR, `${base}.jpg`);
    const { width, height } = await sharp(req.file.buffer)
      .rotate()
      .resize({ width: targetW, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(jpegPath);

    const publicBase = process.env.PUBLIC_BASE_URL || 'http://localhost:5000'; // dev
    const urlWebp = `${publicBase}/uploads/products/${path.basename(webpPath)}`;
    const urlJpeg  = `${publicBase}/uploads/products/${path.basename(jpegPath)}`;

    // Réponse consommée par le front
    return res
      .status(201)
      .set('Cache-Control', 'no-store') // la RÉPONSE d’upload n’est pas mise en cache
      .json({ url: urlWebp, fallback: urlJpeg, width, height, altSuggested: '' });
  } catch (err) {
    console.error('Upload processing error:', err);
    return res.status(500).json({ error: 'UPLOAD_FAILED' });
  }
});

module.exports = router;