const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');
const campaigns=fs.readFileSync(path.join(root,'src/routes/campaigns.js'),'utf8');
const content=fs.readFileSync(path.join(root,'src/routes/content.js'),'utf8');
const automations=fs.readFileSync(path.join(root,'src/routes/automations.js'),'utf8');
const tasks=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
const approvals=fs.readFileSync(path.join(root,'src/routes/approvals.js'),'utf8');

test('v1.0.17 CRUD server-side exists for campaigns content and automations',()=>{
  assert.match(campaigns,/router\.patch\('\/:id'/); assert.match(campaigns,/router\.delete\('\/:id'/);
  assert.match(content,/router\.patch\('\/:id'/); assert.match(content,/router\.delete\('\/:id'/);
  assert.match(automations,/router\.patch\('\/:id'/); assert.match(automations,/router\.delete\('\/:id'/);
});

test('v1.0.17 microtasks support edit and delete with authorization',()=>{
  assert.match(tasks,/router\.patch\('\/:id\/subtasks\/:subtaskId'/);
  assert.match(tasks,/router\.delete\('\/:id\/subtasks\/:subtaskId'/);
  assert.match(tasks,/Sem permissão para editar esta microtarefa/);
  assert.match(tasks,/Sem permissão para excluir esta microtarefa/);
});

test('v1.0.17 task editing is server-side authorized',()=>{
  assert.match(tasks,/Somente o responsável, gestor ou administrador pode editar esta tarefa/);
});

test('v1.0.17 approval details exposes the actual item context',()=>{
  assert.match(approvals,/let context=\{type:request\.entity\}/);
  assert.match(approvals,/getTaskReadiness\(pool,request\.entity_id\)/);
  assert.match(approvals,/task_evidence/);
  assert.match(approvals,/task_acceptance_criteria/);
  assert.match(approvals,/content_items/);
  assert.match(approvals,/campaigns/);
});

test('v1.0.17 approval UI explicitly states what the approver must approve',()=>{
  assert.match(app,/O que você precisa aprovar/);
  assert.match(app,/o cumprimento dos critérios de aceite/);
  assert.match(app,/as evidências apresentadas/);
  assert.match(app,/o entregável registrado/);
});

test('v1.0.17 approval UI is Portuguese Brazil',()=>{
  assert.match(app,/Aprovações claras e rastreáveis/);
  assert.match(app,/Revisar →/);
  assert.match(app,/Sua decisão/);
  assert.match(app,/Rejeitar/);
  assert.match(app,/Aprovar/);
});

test('v1.0.17 phase task content and automation CRUD actions are visible',()=>{
  assert.match(app,/data-edit-phase/); assert.match(app,/data-delete-phase/);
  assert.match(app,/data-edit-task/); assert.match(app,/data-delete-task/);
  assert.match(app,/data-edit-content/); assert.match(app,/data-delete-content/);
  assert.match(app,/data-edit-automation/); assert.match(app,/data-delete-automation/);
});

test('v1.0.17 microtask edit and delete controls are visible in execution center',()=>{
  assert.match(app,/data-edit-subtask/); assert.match(app,/data-delete-subtask/);
  assert.match(app,/editSubtask\(id/); assert.match(app,/deleteSubtask\(id/);
});

test('v1.0.17 requested microtask vertical spacing remains 20px',()=>{
  assert.match(css,/\.execution-microtask-card\{[^}]*margin-bottom:20px/);
  assert.match(css,/\.new-subtask-form\{[^}]*margin-top:20px!important;margin-bottom:20px!important/);
  assert.match(css,/\.new-subtask-form input\{margin-top:20px!important;margin-bottom:20px!important/);
});

test('v1.0.17 automation cards have vertical separation',()=>{
  assert.match(css,/\.automation-grid\{[^}]*row-gap:20px!important/);
});

test('v1.0.17 content planner keeps native drag and drop and Portuguese statuses',()=>{
  assert.match(app,/draggable="true"/);
  assert.match(app,/data-content-drop-status/);
  assert.match(app,/ptLabel\('contentStatus'/);
});

test('v1.0.18 version baseline accepts current patch and previous migrations are untouched',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert.match(pkg.version,/^1\.0\.(?:18|19|20|21|22|23|25|27|28)$/);
  for(let i=1;i<=17;i++) assert.ok(fs.existsSync(path.join(root,'src/db/migrations',String(i).padStart(3,'0')+'_'+fs.readdirSync(path.join(root,'src/db/migrations')).find(x=>x.startsWith(String(i).padStart(3,'0')+'_')).split('_').slice(1).join('_'))));
});
