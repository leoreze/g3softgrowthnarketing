const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

test('v0.3.2 development provisioning allows remote development seed flow', () => {
  const seed = fs.readFileSync(path.join(root, 'src/db/seed.js'), 'utf8');
  const bootstrap = fs.readFileSync(path.join(root, 'src/db/bootstrap.js'), 'utf8');
  const authCheck = fs.readFileSync(path.join(root, 'src/db/auth-check.js'), 'utf8');
  assert.match(seed, /if \(env\.isProduction\)/);
  assert.doesNotMatch(seed, /Remote databases.*db:seed|disabled for remote databases/i);
  assert.match(bootstrap, /if\(env\.isProduction && process\.env\.BOOTSTRAP_REMOTE_CONFIRM/);
  assert.doesNotMatch(bootstrap, /if\(!env\.isLocalDatabase/);
  assert.match(authCheck, /if\(env\.isProduction && process\.env\.BOOTSTRAP_REMOTE_CONFIRM/);
});

test('v0.3.2 provides one-command database setup', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.match(pkg.version, /^(?:0\.(3\.[2-9]|4\.0|5\.0|6\.0|7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
  assert.equal(pkg.scripts['db:setup'], 'node src/db/setup.js');
  assert.match(fs.readFileSync(path.join(root, 'src/db/setup.js'), 'utf8'), /await migrate\(\);[\s\S]*await seed\(\);/);
});
