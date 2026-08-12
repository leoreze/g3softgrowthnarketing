const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'..');
test('v1.0.14 reconciliation migration repairs partial execution tables additively',()=>{
 const s=fs.readFileSync(path.join(root,'src/db/migrations/017_execution_schema_reconciliation.sql'),'utf8');
 assert.match(s,/ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_type/);
 assert.match(s,/ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS system_key/);
 assert.match(s,/ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS evidence_type/);
 assert.match(s,/ALTER TABLE task_evidence_requirements ADD COLUMN IF NOT EXISTS min_count/);
 assert.doesNotMatch(s,/DROP TABLE|TRUNCATE|DROP SCHEMA|DROP DATABASE/);
});
test('v1.0.14 details route exposes only a safe migration diagnostic',()=>{
 const s=fs.readFileSync(path.join(root,'src/routes/tasks.js'),'utf8');
 assert.match(s,/DB_MIGRATION_REQUIRED/);
 assert.match(s,/requiredMigration:'017_execution_schema_reconciliation'/);
});
