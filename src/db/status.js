const pool = require('./pool');
const env = require('../config/env');

async function status() {
  const result = await pool.query('SELECT current_database() AS database, current_user AS user');
  console.log(`Database: ${result.rows[0].database}`);
  console.log(`User: ${result.rows[0].user}`);
  console.log(`Host: ${env.databaseHost}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Local database: ${env.isLocalDatabase ? 'YES' : 'NO'}`);

  const table = await pool.query(`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'schema_migrations'
    ) AS exists
  `);

  if (!table.rows[0].exists) {
    console.log('Migrations: schema_migrations does not exist yet.');
    return;
  }

  const migrations = await pool.query('SELECT version, name, applied_at FROM schema_migrations ORDER BY version');
  console.log('Migrations:');
  if (!migrations.rowCount) console.log('  (none)');
  for (const row of migrations.rows) console.log(`  ${row.version}  ${row.name}  ${new Date(row.applied_at).toISOString()}`);
}

if (require.main === module) status().catch(e => { console.error(`Database status failed: ${e.message}`); process.exitCode = 1; }).finally(() => pool.end());
module.exports = status;
