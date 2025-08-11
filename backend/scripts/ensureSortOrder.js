const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

function hasColumn(table, col) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all();
  return rows.some(r => r.name === col);
}

try {
  if (hasColumn('products', 'sort_order')) {
    console.log('✅ sort_order existe déjà, rien à faire.');
    process.exit(0);
  }

  const tx = db.transaction(() => {
    console.log('▶️ Ajout de la colonne sort_order…');
    db.exec(`ALTER TABLE products ADD COLUMN sort_order INTEGER;`);

    console.log('▶️ Remplissage des valeurs initiales…');
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

    console.log('▶️ Création de l’index…');
    db.exec(`CREATE INDEX IF NOT EXISTS idx_products_sort ON products(sort_order);`);
  });

  tx();
  console.log('✅ Migration terminée.');
} catch (e) {
  console.error('❌ Migration échouée :', e.message);
  process.exit(1);
}