const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');

test('v0.3.x auth hardening manifest',()=>{
  const pkg=require(path.join(root,'package.json'));
  assert.match(pkg.version,/^(?:0\.(3\.[1-9]|4\.0|5\.0|6\.0|7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
  assert.equal(pkg.scripts['db:auth-check'],'node src/db/auth-check.js');
  assert.ok(fs.existsSync(path.join(root,'src/services/auth.js')));
  assert.ok(fs.existsSync(path.join(root,'src/db/migrations/006_auth_hardening.sql')));
});

test('authentication uses normalized email lookup and bcrypt',()=>{
  const s=fs.readFileSync(path.join(root,'src/services/auth.js'),'utf8');
  assert.match(s,/LOWER\(email\)=LOWER\(\$1\)/);
  assert.match(s,/bcrypt\.compare/);
  assert.match(s,/password_hash/);
});

test('login route regenerates and saves the session before success',()=>{
  const s=fs.readFileSync(path.join(root,'src/routes/auth.js'),'utf8');
  assert.match(s,/req\.session\.regenerate/);
  assert.match(s,/req\.session\.save/);
  assert.match(s,/INVALID_CREDENTIALS/);
  assert.match(s,/last_login_at=NOW\(\)/);
});

test('seed no longer has an insecure short password fallback',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/seed.js'),'utf8');
  assert.doesNotMatch(s,/ChangeMe!123/);
  assert.match(s,/SEED_ADMIN_PASSWORD/);
  assert.match(s,/minimumPasswordLength/);
  assert.match(s,/env\.isProduction \? 12 : 8/);
});

test('auth diagnostic does not print password or hash',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/auth-check.js'),'utf8');
  assert.match(s,/PASSWORD_MATCH/);
  assert.doesNotMatch(s,/console\.log\([^\n]*(AUTH_CHECK_PASSWORD|BOOTSTRAP_ADMIN_PASSWORD|u\.password_hash)/i);
});

test('auth migration is non-destructive',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/migrations/006_auth_hardening.sql'),'utf8');
  assert.match(s,/ADD COLUMN IF NOT EXISTS last_login_at/);
  assert.match(s,/CREATE INDEX IF NOT EXISTS idx_users_email_lower/);
  assert.doesNotMatch(s,/DROP TABLE|DROP SCHEMA|TRUNCATE|DELETE FROM/i);
});
