const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const path=require('path');
const root=path.join(__dirname,'..');
test('v0.3.0 governance manifest and migration exist',()=>{const pkg=require(path.join(root,'package.json'));assert.match(pkg.version,/^(?:0\.(3\.[0-9]+|4\.0|5\.0|6\.0|7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);assert.ok(fs.existsSync(path.join(root,'src/db/migrations/005_governance.sql')));assert.ok(fs.existsSync(path.join(root,'src/routes/approvals.js')));});
test('governance migration defines approval requests steps and immutable decisions',()=>{const s=fs.readFileSync(path.join(root,'src/db/migrations/005_governance.sql'),'utf8');for(const x of ['approval_requests','approval_steps','approval_decisions','uq_open_approval_entity'])assert.match(s,new RegExp(x));});
test('approval API is mounted',()=>{const s=fs.readFileSync(path.join(root,'src/app.js'),'utf8');assert.match(s,/api\/approvals/);});
test('approval route exposes submit and decision endpoints',()=>{const s=fs.readFileSync(path.join(root,'src/routes/approvals.js'),'utf8');assert.match(s,/\/tasks\/:id\/submit/);assert.match(s,/\/:id\/decision/);});
