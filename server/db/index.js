import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'
import { DATA_DIR } from '../config.js'

fs.mkdirSync(DATA_DIR, { recursive: true })

const db = new Database(path.join(DATA_DIR, 'cache.sqlite'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS cache (
    cache_key  TEXT PRIMARY KEY,
    provider   TEXT NOT NULL,
    payload    TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache(expires_at);

  CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    phone_number TEXT NOT NULL UNIQUE,
    created_at   INTEGER NOT NULL
  );
`)

export default db
