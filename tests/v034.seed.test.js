const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const seed = fs.readFileSync(path.join(__dirname, '..', 'src', 'db', 'seed.js'), 'utf8');

test('v0.3.4 seed task insert binds all task parameters', () => {
  assert.match(seed, /VALUES\(\$1,\$2,\$3,\$4,\$5,\$6,\$7,\$8,\$9\)/);
});

test('v0.3.4 seed updates existing admin password idempotently', () => {
  assert.match(seed, /UPDATE users SET name=\$1,password_hash=\$2,role=\$3,active=TRUE,updated_at=NOW\(\) WHERE id=\$4/);
  assert.match(seed, /bcrypt\.hash\(pass, 12\)/);
});
