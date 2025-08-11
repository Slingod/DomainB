require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

// Init DB (better-sqlite3) — pas de db.connect()
require('./db');

const csrf = require('./middlewares/csrf');

// Routes
const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const productRoutes    = require('./routes/products');
const orderRoutes      = require('./routes/orders');
const moderationRoutes = require('./routes/moderation');

const app = express();
app.disable('x-powered-by');
app.use(compression());

// CORS
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
  allowedHeaders: ['Content-Type','Authorization','X-CSRF-Token'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '200kb', strict: true }));
app.use(express.urlencoded({ extended: false, limit: '200kb' }));
app.use(cookieParser());
app.use(hpp());

// Sécurité
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"],
      "img-src": ["'self'", "data:"],
      "script-src": ["'self'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "connect-src": ["'self'", ...FRONTEND_ORIGINS],
      "frame-ancestors": ["'self'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' },
  crossOriginEmbedderPolicy: false
}));
if (process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE === 'true') {
  app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));
}

// Rate limit global doux
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ⚠️ Ne PAS rate-limiter tout /auth ici (ça casserait /auth/csrf)

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  dotfiles: 'ignore',
  immutable: true,
  maxAge: '7d',
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self' data:; media-src 'self'");
  }
}));

// CSRF global (double-submit cookie)
if (process.env.CSRF_PROTECTION === 'true') {
  app.use(csrf());
}

// Routes
app.use('/auth',       authRoutes);
app.use('/users',      userRoutes);
app.use('/products',   productRoutes);
app.use('/orders',     orderRoutes);
app.use('/moderation', moderationRoutes);

app.get('/', (req, res) => {
  res.send('🚀 API up: /auth /users /products /orders /moderation');
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