const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v0.5.0 adds a non-destructive workflow engine migration',()=>{
  const sql=fs.readFileSync(path.join(root,'src/db/migrations/008_workflow_engine.sql'),'utf8');
  for(const x of ['workflow_definitions','workflow_definition_steps','workflow_definition_id']) assert.match(sql,new RegExp(x));
  assert.doesNotMatch(sql,/DROP DATABASE|DROP SCHEMA|TRUNCATE|DROP TABLE/i);
});

test('v0.5.0 keeps all previous migration files unchanged',()=>{
  const expected={
    '001_initial_schema.sql':'7718d55ae90195afa5127a9ff50f7ea49313a27b5eade10a9fd62fb0372ecd29',
    '002_workflow.sql':'a701d5d8a6b7bdd41610460625df1af6f28dff01af42725afe85fb59bf41348b',
    '003_calendar_indexes.sql':'1bf891d0ebfb97b6d93f30bdc64ff10c826ff797b9e5f9c060b0bf4c2cd4a594',
    '004_work_management.sql':'ac6581fa884f96db13a7dc61fb7f5e2f7809164bdbb8fa85ce5ae766017eafc1',
    '005_governance.sql':'fdfb6de515ad9b5c005070b386f1dff89e313723dd4ada72efbd00e2143053df'
  };
  const crypto=require('crypto');
  for(const [file,hash] of Object.entries(expected)){
    const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'src/db/migrations',file))).digest('hex');
    assert.equal(actual,hash,file+' changed');
  }
});

test('v0.5.0 exposes workflow and campaign approval APIs',()=>{
  const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  const wf=fs.readFileSync(path.join(root,'src/routes/workflows.js'),'utf8');
  const approvals=fs.readFileSync(path.join(root,'src/routes/approvals.js'),'utf8');
  assert.match(app,/api\/workflows/);
  assert.match(wf,/workflow_definitions/);
  assert.match(approvals,/\/campaigns\/:id\/submit/);
  assert.match(approvals,/workflow_definition_id/);
});

test('v0.5.0 frontend exposes Workflows and campaign approval action',()=>{
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  assert.match(html,/data-view="workflows"/);
  assert.match(html,/v(?:0\.(?:7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)/);
  assert.match(js,/renderWorkflows/);
  assert.match(js,/\/api\/approvals\/campaigns\/\$\{state\.campaign\.id\}\/submit/);
});
