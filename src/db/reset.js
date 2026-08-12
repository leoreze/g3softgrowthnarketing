const pool = require('./pool');
const migrate = require('./migrate');
const seed = require('./seed');
const env = require('../config/env');

async function reset() {
  if (env.isProduction) throw new Error('db:reset is disabled in production. Use db:migrate.');
  if (!env.isLocalDatabase) {
    throw new Error('db:reset is disabled for remote databases. Use a local PostgreSQL database for destructive resets.');
  }
  if (process.env.RESET_CONFIRM !== 'YES') {
    throw new Error('db:reset requires RESET_CONFIRM=YES. This operation destroys the local database schema.');
  }
  await pool.query('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  await migrate();
  await seed();
  console.log('Local database reset complete.');
}

if (require.main === module) reset().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => pool.end());
module.exports = reset;
