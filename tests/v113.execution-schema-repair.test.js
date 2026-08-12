const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');

test('v1.0.13 includes an additive execution schema repair migration',()=>{
  const migration=fs.readFileSync(path.join(root,'src/db/migrations/016_task_execution_schema_repair.sql'),'utf8');
  for(const token of [
    'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_status',
    'ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_type',
    'CREATE TABLE IF NOT EXISTS task_evidence',
    'CREATE TABLE IF NOT EXISTS task_acceptance_criteria',
    'CREATE TABLE IF NOT EXISTS task_evidence_requirements'
  ]) assert.match(migration,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
  assert.doesNotMatch(migration,/DROP TABLE|TRUNCATE TABLE|DROP SCHEMA/i);
});

test('v1.0.13 task details points to the repair migration',()=>{
  const tasks=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
  assert.match(tasks,/requiredMigration:'016_task_execution_schema_repair'|requiredMigration:'017_execution_schema_reconciliation'/);
  assert.doesNotMatch(tasks,/requiredMigration:'015_task_acceptance_evidence_intelligence'/);
});

test('v1.0.13 readiness points to the repair migration',()=>{
  const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  assert.match(app,/migrationRequired='016_task_execution_schema_repair'|migrationRequired='017_execution_schema_reconciliation'/);
});
