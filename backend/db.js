const Database = require('better-sqlite3');
const fs       = require('fs');
const path     = require('path');

// Ouvre (ou crée) la base SQLite
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Active les clés étrangères
db.pragma('foreign_keys = ON');

// Charge et exécute ton schéma SQL
const schema = fs.readFileSync(
  path.join(__dirname, 'schema.sql'),
  'utf-8'
);
db.exec(schema);

module.exports = db;