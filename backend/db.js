'use strict';

const Database = require('better-sqlite3');
const fs       = require('fs');
const path     = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Toujours activer les FK
db.pragma('foreign_keys = ON');

// Charger (ou créer) le schéma
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

// ✅ Whitelist pour PRAGMA table_info()
const ALLOWED_TABLES = new Set([
  'users',
  'products',
  'orders',
  'order_items',
  'email_verifications',
  'password_resets',
  'refresh_tokens'
]);

function hasColumn(table, col) {
  try {
    if (!ALLOWED_TABLES.has(table)) return false;
    // PRAGMA table_info() n'accepte pas de placeholders → whitelist
    const rows = db.prepare(`PRAGMA table_info(${table})`).all();
    return rows.some(r => r.name === col);
  } catch {
    return false;
  }
}

// Auto-migration sûre pour sort_order
function ensureSortOrder() {
  if (hasColumn('products', 'sort_order')) return;

  const migrate = db.transaction(() => {
    // 1) Ajouter la colonne
    db.exec(`ALTER TABLE products ADD COLUMN sort_order INTEGER;`);

    // 2) Initialiser la valeur
    db.exec(`
      UPDATE products
      SET sort_order = COALESCE(
        sort_order,
        CASE
          WHEN created_at IS NOT NULL AND created_at <> ''
            THEN CAST(strftime('%s', created_at) AS INTEGER)
          ELSE id
        END
      );
    `);

    // 3) Index pour l’ORDER BY
    db.exec(`CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);`);
  });

  migrate();
}

ensureSortOrder();

module.exports = db;