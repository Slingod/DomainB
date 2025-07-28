require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import de la DB pour initialisation
const db = require('./db');

// Import des routes
const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/users');
const productRoutes    = require('./routes/products');
const orderRoutes      = require('./routes/orders');
const moderationRoutes = require('./routes/moderation');

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Montée des routes de l’API
app.use('/auth',       authRoutes);
app.use('/users',      userRoutes);
app.use('/products',   productRoutes);
app.use('/orders',     orderRoutes);
app.use('/moderation', moderationRoutes);

// Route d’accueil simple
app.get('/', (req, res) => {
  res.send(
    '🚀 API du Domaine Berthuit est en ligne ! Endpoints disponibles : ' +
    '/auth, /users, /products, /orders, /moderation'
  );
});

// Gestion des 404 pour toutes les autres routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});