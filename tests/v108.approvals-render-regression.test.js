const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

const app=()=>fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');

test('v1.0.8 approvals view defines renderApprovals before render dispatch',()=>{
 const s=app();
 assert.match(s,/function renderApprovals\(\)/);
 assert.match(s,/approvals:renderApprovals/);
 assert.match(s,/data-approval=\"\$\{a\.id\}\"/);
});

test('v1.0.8 approval cards open the governance approval details',()=>{
 const s=app();
 assert.ok(s.includes("$$('[data-approval]').forEach(b=>b.onclick=()=>approvalDetails"));
 assert.match(s,/function approvalDetails\(id\)/);
});
