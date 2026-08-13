const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.11 migration is environment-agnostic and does not refuse remote or production databases',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/migrate.js'),'utf8');
  assert.match(s,/async function migrate\(\)/);
  assert.doesNotMatch(s,/isProduction.*disabled|disabled.*production/);
  assert.doesNotMatch(s,/isLocalDatabase.*disabled|requires a local PostgreSQL/);
  assert.match(s,/CREATE TABLE IF NOT EXISTS schema_migrations/);
});

test('v1.0.11 removes the local-only preparation command',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert.match(pkg.version,/^1\.0\.(?:11|12|14|15|16|17|18|19|20|21|22|23|25|27|28)$/);
  assert.equal(pkg.scripts['local:prepare'],undefined);
  assert.equal(fs.existsSync(path.join(root,'src/db/local-prepare.js')),false);
});

test('v1.0.11 keeps destructive reset protected in production',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/reset.js'),'utf8');
  assert.match(s,/db:reset is disabled in production/);
});
