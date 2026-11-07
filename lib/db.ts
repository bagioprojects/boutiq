import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

declare global {
  var _fkDbInstance: DatabaseSync | undefined;
}

function resolveDbPath(): string {
  if (process.env.DATABASE_PATH && fs.existsSync(process.env.DATABASE_PATH)) {
    return process.env.DATABASE_PATH;
  }

  const candidatePaths = [
    path.join(process.cwd(), 'public', 'data', 'fkbutik.db'),
    path.join(process.cwd(), 'ecommerce-core', 'public', 'data', 'fkbutik.db'),
    path.resolve(__dirname, '..', 'public', 'data', 'fkbutik.db'),
    path.resolve(__dirname, '..', '..', 'public', 'data', 'fkbutik.db'),
  ];

  if (process.platform === 'win32') {
    candidatePaths.push(
      'C:\\FKButik\\ecommerce-core\\public\\data\\fkbutik.db',
      'C:\\FKButik\\public\\data\\fkbutik.db'
    );
  }

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).size > 0) {
      return candidate;
    }
  }

  // Fallback to standard ecommerce-core location
  const defaultPath = path.join(process.cwd(), 'public', 'data', 'fkbutik.db');
  const dir = path.dirname(defaultPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return defaultPath;
}

export function getDb(): DatabaseSync {
  if (!global._fkDbInstance) {
    const dbPath = resolveDbPath();
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const db = new DatabaseSync(dbPath);
    try {
      db.exec('PRAGMA busy_timeout = 30000;');
      db.exec('PRAGMA journal_mode = WAL;');
      db.exec('PRAGMA synchronous = NORMAL;');

      // Verify / ensure users table exists
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT,
          full_name TEXT NOT NULL,
          phone TEXT,
          role TEXT DEFAULT 'customer',
          auth_provider TEXT DEFAULT 'local',
          google_id TEXT,
          is_verified INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          last_login_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      const orderCols = db.prepare('PRAGMA table_info(orders)').all() as any[];
      if (!orderCols.some(c => c.name === 'user_id')) {
        db.exec('ALTER TABLE orders ADD COLUMN user_id INTEGER;');
      }
      if (!orderCols.some(c => c.name === 'cargo_company')) {
        db.exec("ALTER TABLE orders ADD COLUMN cargo_company TEXT DEFAULT 'Yurtiçi Kargo';");
      }
    } catch {}

    global._fkDbInstance = db;
  }
  return global._fkDbInstance;
}

export const db = getDb();


