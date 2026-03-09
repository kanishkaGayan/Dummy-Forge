import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'dummy-forge.db');
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    config TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Countries (
    country_id INTEGER PRIMARY KEY,
    country_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS States (
    state_id INTEGER PRIMARY KEY,
    country_id INTEGER,
    state_name TEXT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Countries(country_id)
  );

  CREATE TABLE IF NOT EXISTS Cities (
    city_id INTEGER PRIMARY KEY,
    country_id INTEGER,
    city_name TEXT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Countries(country_id)
  );

  CREATE TABLE IF NOT EXISTS Villages (
    village_id INTEGER PRIMARY KEY,
    country_id INTEGER,
    village_name TEXT NOT NULL,
    FOREIGN KEY (country_id) REFERENCES Countries(country_id)
  );
`);

const existingCountryCount = db.prepare('SELECT COUNT(*) as count FROM Countries').get() as { count: number };

if (existingCountryCount.count === 0) {
  const sqlPath = path.join(process.cwd(), 'countries_data_expanded.sql');
  if (fs.existsSync(sqlPath)) {
    const sqlData = fs.readFileSync(sqlPath, 'utf8');
    const insertStatements = sqlData
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith('INSERT INTO '))
      .join('\n');

    if (insertStatements.length > 0) {
      db.exec(insertStatements);
    }
  }
}

export default db;
