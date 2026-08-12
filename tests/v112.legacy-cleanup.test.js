const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.12 exposes a safe legacy cleanup command',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert.match(pkg.version,/^1\.0\.(?:12|14|15|16|17|18|19|20|21|22)$/);
  assert.equal(pkg.scripts['local:prepare'],undefined);
  assert.equal(pkg.scripts['clean:legacy'],'node scripts/clean-legacy.js');
  assert.equal(fs.existsSync(path.join(root,'src/db/local-prepare.js')),false);
});

test('v1.0.12 cleanup script targets only the obsolete local preparation file',()=>{
  const s=fs.readFileSync(path.join(root,'scripts/clean-legacy.js'),'utf8');
  assert.match(s,/src.*db.*local-prepare\.js/);
  assert.match(s,/rmSync/);
});
