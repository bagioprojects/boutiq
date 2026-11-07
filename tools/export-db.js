const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'public', 'data', 'fkbutik.db');
const outPath = path.join(__dirname, '..', 'database', 'backup_initial_data.sql');

if (!fs.existsSync(dbPath)) {
  console.error('Database file not found at:', dbPath);
  process.exit(1);
}

const db = new DatabaseSync(dbPath);
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();

let sqlDump = `-- ========================================================\n`;
sqlDump += `-- FK BUTIK E-COMMERCE DATABASE BACKUP\n`;
sqlDump += `-- Generated: ${new Date().toISOString()}\n`;
sqlDump += `-- ========================================================\n\n`;
sqlDump += `PRAGMA foreign_keys = OFF;\n\n`;

for (const t of tables) {
  sqlDump += `-- Table: ${t.name}\n`;
  sqlDump += `DROP TABLE IF EXISTS ${t.name};\n`;
  sqlDump += `${t.sql};\n\n`;

  const rows = db.prepare(`SELECT * FROM ${t.name}`).all();
  if (rows.length > 0) {
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.map(k => `"${k}"`).join(', ');
      const vals = keys.map(k => {
        const val = row[k];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        return `'${String(val).replace(/'/g, "''")}'`;
      }).join(', ');
      sqlDump += `INSERT INTO ${t.name} (${cols}) VALUES (${vals});\n`;
    }
    sqlDump += `\n`;
  }
}

sqlDump += `PRAGMA foreign_keys = ON;\n`;

fs.writeFileSync(outPath, sqlDump, 'utf8');
console.log(`Database exported successfully to ${outPath} (${tables.length} tables, ${Buffer.byteLength(sqlDump)} bytes)`);

