const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const migration=fs.readFileSync(path.join(root,'src/db/migrations/013_task_execution_deliverables.sql'),'utf8');
const tasksRoute=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');

test('v1.0.2 adds execution plan and deliverable',()=>{
  assert.match(migration,/execution_plan TEXT/);
  assert.match(migration,/deliverable TEXT/);
  assert.match(migration,/WITH specs/);
  assert.match(migration,/COALESCE\(t\.execution_plan,s\.execution_plan\)/);
  assert.match(migration,/COALESCE\(t\.deliverable,s\.deliverable\)/);
  assert.equal(fs.existsSync(path.join(root,'src/db/migrations/012_roadmap_180_days.sql')),true);
});

test('v1.0.2 exposes task detail endpoint with microtasks history and comments',()=>{
  assert.match(tasksRoute,/router.get\('\/:id\/details'/);
  assert.match(tasksRoute,/task_subtasks/);
  assert.match(tasksRoute,/task_status_history/);
  assert.match(tasksRoute,/task_comments/);
});

test('v1.0.2 frontend exposes unified task execution modal',()=>{
  assert.match(app,/async function taskDetails/);
  assert.match(app,/COMO SERÁ REALIZADA/);
  assert.match(app,/ENTREGÁVEL/);
  assert.match(app,/Microtarefas/);
  assert.match(app,/data-open-task/);
});

test('v1.0.2 Roadmap phases can open and navigate to tasks',()=>{
  assert.match(app,/data-open-phase/);
  assert.match(app,/async function phaseDetails/);
  assert.match(app,/data-phase-task/);
});

test('v1.0.2 keeps detail implementation CSP-safe',()=>{
  assert.doesNotMatch(app,/style\\s*=/i);
  assert.doesNotMatch(app,/onclick\\s*=/i);
});
