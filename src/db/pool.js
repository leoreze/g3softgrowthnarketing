const { Pool } = require('pg');
const env = require('../config/env');

const sslEnabled = process.env.DB_SSL === 'false' ? false : !env.isLocalDatabase;

const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: sslEnabled ? { rejectUnauthorized: false } : false,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
  maxUses: Number(process.env.DB_MAX_USES || 7500)
});
pool.on('error', (error) => {
  console.error(`[DB_POOL_ERROR] ${error.message}`);
});

module.exports = pool;
