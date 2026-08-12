const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const migration=fs.readFileSync(path.join(root,'src/db/migrations/014_task_execution_center.sql'),'utf8');
const tasks=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');

test('v1.0.3 adds execution center persistence',()=>{
  assert.match(migration,/deliverable_status/);
  assert.match(migration,/deliverable_submitted_at/);
  assert.match(migration,/task_evidence/);
  assert.match(migration,/idx_task_evidence_task/);
});

test('v1.0.3 exposes execution actions with authorization and audit',()=>{
  for(const route of ["/:id/subtasks/:subtaskId","/:id/subtasks","/:id/comments","/:id/time","/:id/evidence","/:id/deliverable","/:id/block"]) assert.match(tasks,new RegExp(`router\\.(post|patch|delete)\\('${route.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}`));
  assert.match(tasks,/canOperateTask/);
  assert.match(tasks,/task_evidence/);
  assert.match(tasks,/audit\(req/);
  assert.match(tasks,/deliverable_status=CASE WHEN deliverable_status='SUBMITTED' THEN 'APPROVED'/);
  assert.match(tasks,/deliverable_status=CASE WHEN deliverable_status='SUBMITTED' THEN 'REJECTED'/);
});

test('v1.0.3 Task Execution Center is reachable from Tarefas',()=>{
  assert.match(app,/(Central de execução|Task Execution Center)/);
  assert.match(app,/data-open-task/);
  assert.match(app,/document\.addEventListener\('click'/);
  assert.match(app,/api\(`\/api\/tasks\/\$\{id\}\/details`/);
  assert.match(app,/data-subtask-toggle/);
  assert.match(app,/evidenceForm/);
  assert.match(app,/timeForm/);
  assert.match(app,/commentForm/);
  assert.match(app,/taskDeliverable/);
});

test('v1.0.3 execution center CSS remains external/CSP-safe',()=>{
  assert.doesNotMatch(app,/style\\s*=/i);
  assert.doesNotMatch(app,/onclick\\s*=/i);
  assert.match(css,/\.task-execution-center/);
});
