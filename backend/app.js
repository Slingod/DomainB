require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');

// Init DB (better-sqlite3)
require('./db');

const csrf = require('./middlewares/csrf');

// Routes métier
const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const productRoutes    = require('./routes/products');
const orderRoutes      = require('./routes/orders');
const moderationRoutes = require('./routes/moderation');

// ✅ Route d'upload (POST /uploads/images)
const uploadsRoutes    = require('./routes/uploads.routes');

const app = express();
app.disable('x-powered-by');
app.use(compression());

// --- CORS ---
const FRONTEND_ORIGINS = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    if (FRONTEND_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','X-CSRF-Token','X-Requested-With','Accept'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '200kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(cookieParser());
app.use(hpp());

// --- CSP nonce par requête ---
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

// --- Sécurité (Helmet) ---
// IMPORTANT: autorise l'utilisation cross-origin des ressources (images) :
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }, // <-- clé pour éviter "NotSameOrigin"
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "base-uri": ["'self'"],
      "object-src": ["'none'"],
      "img-src": ["'self'", "data:"],
      "script-src": [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
      ],
      "style-src": ["'self'", "'unsafe-inline'"],
      "font-src": ["'self'", "https:", "data:"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "form-action": ["'self'"],
      "upgrade-insecure-requests": []
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false
}));

// HSTS seulement si vrai HTTPS + cookies secure
if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true') {
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
}

// --- Rate limit global (doux) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// 📂 Dossier public (où la route d'upload enregistre les fichiers)
const PUBLIC_DIR = path.join(__dirname, 'public');

// ✅ Monte la route d'upload AVANT le CSRF (on ne CSRF pas l'upload binaire)
app.use('/uploads', uploadsRoutes);

// ✅ Fichiers statiques: sert /uploads/* depuis backend/public/uploads
//    + force CORP cross-origin sur ces réponses
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});
app.use('/uploads', express.static(path.join(PUBLIC_DIR, 'uploads'), {
  dotfiles: 'ignore',
  immutable: true,
  maxAge: '31536000', // 1 an (OK grâce aux noms hashés)
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Pas besoin de CSP ici, on laisse simple pour les images
  }
}));

// --- CSRF global (double-submit cookie) ---
if (process.env.CSRF_PROTECTION === 'true') {
  app.use(csrf());
}

// --- Routes API ---
app.use('/auth',       authRoutes);
app.use('/users',      userRoutes);
app.use('/products',   productRoutes);
app.use('/orders',     orderRoutes);
app.use('/moderation', moderationRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API up: /auth /users /products /orders /moderation /uploads');
});

// 404
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const body = { error: status === 500 ? 'Erreur interne' : (err.message || 'Erreur') };
  if (process.env.NODE_ENV !== 'production') body.details = err.stack;
  res.status(status).json(body);
});

// Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});