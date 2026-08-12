const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const envPath = path.join(root, '.env');

console.log(`Project root: ${root}`);
console.log(`.env exists: ${fs.existsSync(envPath) ? 'YES' : 'NO'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || '(not loaded)'}`);
console.log(`DATABASE_URL: ${process.env.DATABASE_URL ? 'SET' : 'MISSING'}`);
console.log(`SESSION_SECRET: ${process.env.SESSION_SECRET ? 'SET' : 'MISSING'}`);
console.log('Secrets are never printed.');
