const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const tasks=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');

test('v1.0.5 defines task comment permission before rendering comment controls',()=>{
  assert.match(app,/const canOperate=\['ADMIN','MANAGER'\]\.includes\(state\.user\?\.role\)\|\|t\.assignee_id===state\.user\?\.id;/);
  assert.match(app,/const canCommentTask=canOperate\|\|state\.user\?\.role==='STAKEHOLDER';/);
  assert.match(app,/canCommentTask\?'<form id=\"commentForm\"/);
});

test('v1.0.5 frontend comment permission matches backend policy',()=>{
  assert.match(tasks,/function canCommentTask\(user,task\)\{return canOperateTask\(user,task\)\|\|user\.role==='STAKEHOLDER';\}/);
  assert.match(app,/const canCommentTask=canOperate\|\|state\.user\?\.role==='STAKEHOLDER';/);
});
