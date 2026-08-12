const fs = require('fs');
const path = require('path');

// Resolve the project root from this file, not from the shell's current directory.
// This prevents `DATABASE_URL is required` when commands are launched from another
// working directory (IDE, PowerShell profile, npm runner, etc.).
const projectRoot = path.resolve(__dirname, '..', '..');
const envCandidates = [
  path.join(projectRoot, '.env'),
  path.join(process.cwd(), '.env')
];

const envPath = envCandidates.find((candidate) => fs.existsSync(candidate));

if (envPath) {
  // Node 20+ provides a native loader. Prefer it when available, with dotenv as
  // a compatibility fallback. Existing process.env values are never overwritten.
  try {
    if (typeof process.loadEnvFile === 'function') {
      process.loadEnvFile(envPath);
    } else {
      const dotenv = require('dotenv');
      dotenv.config({ path: envPath });
    }
  } catch (error) {
    throw new Error(`Unable to load environment file: ${path.basename(envPath)} (${error.message})`);
  }
} else {
  // Production platforms inject environment variables directly; no .env file is
  // required there. Local commands receive a precise error below if missing.
  if (typeof process.loadEnvFile !== 'function') {
    const dotenv = require('dotenv');
    dotenv.config();
  }
}

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';
const isTest = NODE_ENV === 'test';

function required(name) {
  const value = process.env[name];
  if (!value) {
    const hint = name === 'DATABASE_URL'
      ? 'Create a .env file in the project root or configure DATABASE_URL in the hosting environment.'
      : `Configure ${name} in the environment.`;
    throw new Error(`${name} is required. ${hint}`);
  }
  return value.trim();
}

const databaseUrl = required('DATABASE_URL');
let databaseHost = '';
let databaseProtocol = '';
try {
  const parsed = new URL(databaseUrl);
  databaseHost = parsed.hostname;
  databaseProtocol = parsed.protocol;
} catch {
  throw new Error('DATABASE_URL is invalid');
}

const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(databaseHost);
const sessionSecret = required('SESSION_SECRET');
if (isProduction && sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must contain at least 32 characters in production.');
}
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',').map(v=>v.trim()).filter(Boolean);

module.exports = {
  nodeEnv: NODE_ENV,
  isProduction,
  port: Number(process.env.PORT || 3000),
  databaseUrl,
  databaseHost,
  databaseProtocol,
  isLocalDatabase,
  sessionSecret,
  corsOrigin: allowedOrigins[0] || 'http://localhost:3000',
  allowedOrigins,
  isTest
};
