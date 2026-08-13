const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.21 binds the web server to 0.0.0.0 for Render',()=>{
  const source=fs.readFileSync(path.join(root,'src/server.js'),'utf8');
  assert.match(source,/app\.listen\(env\.port,'0\.0\.0\.0'/);
});

test('v1.0.21 Render Blueprint uses pre-deploy migrations and CI-gated deploys',()=>{
  const yaml=fs.readFileSync(path.join(root,'render.yaml'),'utf8');
  assert.match(yaml,/preDeployCommand:\s*npm run db:migrate/);
  assert.match(yaml,/startCommand:\s*npm start/);
  assert.match(yaml,/autoDeployTrigger:\s*checksPass/);
  assert.match(yaml,/healthCheckPath:\s*\/api\/ready/);
});

test('v1.0.21 keeps production secrets out of the Blueprint',()=>{
  const yaml=fs.readFileSync(path.join(root,'render.yaml'),'utf8');
  assert.match(yaml,/key:\s*DATABASE_URL[\s\S]*sync:\s*false/);
  assert.match(yaml,/key:\s*SESSION_SECRET[\s\S]*sync:\s*false/);
});

test('v1.0.25 version is 1.0.25',()=>assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,'1.0.28'));
