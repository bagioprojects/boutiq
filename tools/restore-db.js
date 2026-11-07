const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'public', 'data', 'fkbutik.db');
const sqlPath = path.join(__dirname, '..', 'database', 'backup_initial_data.sql');

if (!fs.existsSync(sqlPath)) {
  console.error('SQL dump file not found at:', sqlPath);
  process.exit(1);
}

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const sql = fs.readFileSync(sqlPath, 'utf8');
const db = new DatabaseSync(dbPath);

db.exec(sql);
console.log(`Database restored successfully from ${sqlPath} to ${dbPath}`);
