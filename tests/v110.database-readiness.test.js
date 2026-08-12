const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.10 task details uses a version-agnostic migration diagnostic',()=>{
  const s=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
  assert.match(s,/DB_MIGRATION_REQUIRED/);
  assert.match(s,/requiredMigration:'016_task_execution_schema_repair'|requiredMigration:'017_execution_schema_reconciliation'/);
  assert.doesNotMatch(s,/A estrutura da v1\.0\.6 ainda não foi aplicada/);
});

test('v1.0.10 readiness checks the execution and approval schema',()=>{
  const s=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  for(const token of ['task_acceptance_criteria','task_evidence_requirements','task_evidence','execution_type','migrationRequired']) assert.match(s,new RegExp(token));
});

test('v1.0.10 readiness no longer depends on a local-only preparation command',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert.equal(pkg.scripts['local:prepare'],undefined);
  assert.equal(fs.existsSync(path.join(root,'src/db/local-prepare.js')),false);
});

test('v1.0.10 doctor reports migration 015 readiness',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/doctor.js'),'utf8');
  assert.match(s,/task_acceptance_criteria/);
  assert.match(s,/task_evidence_requirements/);
  assert.match(s,/task_evidence/);
  assert.match(s,/Pending migrations/);
  assert.match(s,/015_task_acceptance_evidence_intelligence|016_task_execution_schema_repair|017_execution_schema_reconciliation/);
});

test('v1.0.10 keeps destructive reset protected in production',()=>{
  const reset=fs.readFileSync(path.join(root,'src/db/reset.js'),'utf8');
  assert.match(reset,/disabled in production/);
});
