const Database = require('better-sqlite3');

function openDb(file = process.env.DB_FILE || 'foodmenu.db') {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS food_items (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      name             TEXT    NOT NULL COLLATE NOCASE UNIQUE,
      category         TEXT    NOT NULL CHECK (category IN ('Starter','Main Course','Dessert','Beverage','Fast Food')),
      price            REAL    NOT NULL CHECK (price > 0),
      preparation_time INTEGER NOT NULL DEFAULT 10 CHECK (preparation_time BETWEEN 1 AND 180),
      is_available     INTEGER NOT NULL DEFAULT 1 CHECK (is_available IN (0,1)),
      created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
  return db;
}
module.exports = { openDb };
