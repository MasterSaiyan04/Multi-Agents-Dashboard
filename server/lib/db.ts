import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

import { runMigrations } from './migrations.js';

let db: any = null;

function resolveDatabasePath() {
  const configured = process.env.DATABASE_PATH || './data/mission-control.db';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(process.cwd(), configured);
}

export function getDb() {
  if (db) {
    return db;
  }

  const databasePath = resolveDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  db = new Database(databasePath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  runMigrations(db);
  return db;
}
