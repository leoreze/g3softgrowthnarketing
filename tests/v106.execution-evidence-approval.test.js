const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const migration=fs.readFileSync(path.join(root,'src/db/migrations/015_task_acceptance_evidence_intelligence.sql'),'utf8');
const service=fs.readFileSync(path.join(root,'src/services/task-acceptance.js'),'utf8');
const tasks=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
const approvals=fs.readFileSync(path.join(root,'src/routes/approvals.js'),'utf8');
const work=fs.readFileSync(path.join(root,'src/routes/work-management.js'),'utf8');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));

test('v1.0.6 appends migration 015 without changing the existing execution center schema',()=>{
  assert.match(migration,/G3Soft Growth OS v1\.0\.6/);
  assert.match(migration,/ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_type/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS task_acceptance_criteria/);
  assert.match(migration,/CREATE TABLE IF NOT EXISTS task_evidence_requirements/);
  assert.match(migration,/ON DELETE CASCADE/);
});

test('v1.0.6 defines task execution types and type-specific evidence requirements',()=>{
  for(const type of ['GENERAL','LANDING_PAGE','CONTENT','PAID_MEDIA','SEO','CRM','ANALYTICS','AUTOMATION','SALES'])assert.match(service,new RegExp(type));
  assert.match(service,/DEFAULTS/);
  assert.match(service,/evidence/);
  assert.match(migration,/Type-specific minimum evidence/);
});

test('v1.0.6 computes approval readiness server-side from criteria evidence and deliverable',()=>{
  assert.match(service,/getTaskReadiness/);
  assert.match(service,/criteriaReady/);
  assert.match(service,/evidenceReady/);
  assert.match(service,/deliverableReady/);
  assert.match(service,/ready: criteriaReady && evidenceReady && deliverableReady/);
});

test('v1.0.6 task submit blocks incomplete execution server-side',()=>{
  assert.match(tasks,/TASK_NOT_READY_FOR_APPROVAL/);
  assert.match(tasks,/getTaskReadiness\(client,taskId\)/);
  assert.match(tasks,/criteria:readiness\?\.criteria\?\.missing/);
  assert.match(tasks,/evidence:readiness\?\.evidence\?\.missing/);
});

test('v1.0.6 alternate approval submit endpoint has the same server-side gate',()=>{
  assert.match(approvals,/TASK_NOT_READY_FOR_APPROVAL/);
  assert.match(approvals,/getTaskReadiness\(client,taskId\)/);
});

test('v1.0.6 Kanban position endpoint cannot bypass approval readiness',()=>{
  assert.match(work,/getTaskReadiness\(pool,id\)/);
  assert.match(work,/nextStatus==='PENDING_APPROVAL'/);
  assert.match(work,/TASK_NOT_READY_FOR_APPROVAL/);
});

test('v1.0.6 exposes acceptance checklist CRUD with server-side authorization',()=>{
  assert.match(tasks,/router\.post\('\/:id\/acceptance-criteria'/);
  assert.match(tasks,/router\.patch\('\/:id\/acceptance-criteria\/:criterionId'/);
  assert.match(tasks,/router\.delete\('\/:id\/acceptance-criteria\/:criterionId'/);
  assert.match(tasks,/canOperateTask\(req\.user,task\)/);
  assert.match(tasks,/SYSTEM_CRITERION/);
});

test('v1.0.6 task details exposes readiness and acceptance criteria',()=>{
  assert.match(tasks,/acceptanceCriteria/);
  assert.match(tasks,/readiness/);
  assert.match(tasks,/task_acceptance_criteria/);
  assert.match(tasks,/task_evidence_requirements|evidence/);
});

test('v1.0.6 Task Execution Center exposes Approval Readiness and formal acceptance UI',()=>{
  assert.match(app,/(Prontidão para aprovação|Approval Readiness)/);
  assert.match(app,/Checklist de Aceite/);
  assert.match(app,/data-acceptance-toggle/);
  assert.match(app,/TASK_NOT_READY_FOR_APPROVAL|Complete o checklist/);
  assert.match(app,/evidence-requirements/);
});

test('v1.0.6 preserves CSP-safe frontend and requested microtask spacing',()=>{
  assert.doesNotMatch(app,/style\s*=/i);
  assert.doesNotMatch(app,/<(?:button|input|select|a)[^>]+onclick\s*=/i);
  assert.match(css,/\.execution-section \.execution-check:not\(:last-child\)\{margin-bottom:20px\}/);
  assert.match(css,/\.new-subtask-form input\[name="title"\]\{margin-top:20px;margin-bottom:20px\}/);
  assert.match(css,/\.new-subtask-form\{margin-top:20px!important;margin-bottom:20px!important\}/);
});

test('v1.0.6 preserves semantic versioning and remains based on v1.0.5 baseline',()=>{
  assert.match(pkg.version,/^1\.0\.(?:6|7|8|9|10|11|12|14|15|16|17|18|19|20)$/);
  assert.match(fs.readFileSync(path.join(root,'tests/v105.task-comment-regression.test.js'),'utf8'),/v1\.0\.5/);
  assert.match(fs.readFileSync(path.join(root,'src/db/migrations/014_task_execution_center.sql'),'utf8'),/Task Execution Center/);
});
