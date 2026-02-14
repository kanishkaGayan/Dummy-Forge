import Database from 'better-sqlite3';
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
`);

export default db;
