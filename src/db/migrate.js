const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const pool = require('./pool');

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (version VARCHAR(32) PRIMARY KEY, name VARCHAR(255) NOT NULL, checksum VARCHAR(128) NOT NULL, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    const dir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      const version = file.split('_')[0];
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      const checksum = crypto.createHash('sha256').update(sql).digest('hex');
      const existing = await client.query('SELECT checksum FROM schema_migrations WHERE version=$1', [version]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== checksum) throw new Error(`Migration ${file} was modified after being applied.`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(version,name,checksum) VALUES($1,$2,$3)', [version, file, checksum]);
        await client.query('COMMIT');
        console.log(`Applied ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    console.log('Migrations OK');
  } finally { client.release(); }
}

if (require.main === module) migrate().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => pool.end());
module.exports = migrate;
