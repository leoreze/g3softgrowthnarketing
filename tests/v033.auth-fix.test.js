const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('v0.3.3 seed repairs existing development credentials', () => {
  const seed = fs.readFileSync(path.join(root, 'src/db/seed.js'), 'utf8');
  assert.match(seed, /UPDATE users SET name=\$1,password_hash=\$2,role=\$3,active=TRUE,updated_at=NOW\(\)/);
  assert.match(seed, /bcrypt\.hash\(pass, 12\)/);
});

test('v0.3.3 keeps production seed blocked', () => {
  const seed = fs.readFileSync(path.join(root, 'src/db/seed.js'), 'utf8');
  assert.match(seed, /if \(env\.isProduction\) throw new Error/);
});
