const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

const app=()=>fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');

test('v1.0.7 legacy task submit endpoint creates an approval request through the shared workflow service',()=>{
 const s=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
 assert.match(s,/createRequestFromWorkflow/);
 assert.match(s,/workflowType:'TASK'/);
 assert.match(s,/approval_requests WHERE entity='task'/);
});

test('v1.0.7 task details exposes pending approval request id for governance decisions',()=>{
 const s=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
 assert.match(s,/approval_request_id/);
 assert.match(s,/approval_request_status/);
});

test('v1.0.7 task approval UI uses the governance decision endpoint',()=>{
 const s=app();
 assert.match(s,/\/api\/approvals\/\$\{t\.approval_request_id\}\/decision/);
 assert.match(s,/decision:'APPROVED'/);
 assert.match(s,/decision:'REJECTED'/);
});

test('v1.0.7 Content Planner cards support native drag and drop between workflow columns',()=>{
 const s=app();
 assert.match(s,/draggable=\"true\" data-content-card/);
 assert.match(s,/data-content-drop-status/);
 assert.match(s,/function bindContentPlanner/);
 assert.match(s,/\/api\/content\/\$\{id\}/);
});

test('v1.0.7 task details gives a safe migration diagnostic for unapplied execution schema',()=>{
 const s=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
 assert.match(s,/DB_MIGRATION_REQUIRED/);
 assert.match(s,/npm run db:migrate/);
});
