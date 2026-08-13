const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.22 diagnostic workspace supports sources, metrics, evidences, reviews and history',()=>{
 const s=fs.readFileSync(path.join(root,'src/db/migrations/019_diagnostic_workspace.sql'),'utf8');
 for(const t of ['growth_diagnostic_sources','growth_diagnostic_metrics','growth_diagnostic_evidences','growth_diagnostic_reviews']) assert.match(s,new RegExp(`CREATE TABLE IF NOT EXISTS ${t}`));
 assert.match(s,/DROP CONSTRAINT IF EXISTS growth_diagnostics_campaign_id_key/);
 assert.match(s,/ALTER COLUMN campaign_id DROP NOT NULL/);
 assert.doesNotMatch(s,/DROP DATABASE|DROP SCHEMA|TRUNCATE/);
});

test('v1.0.22 diagnostic API exposes historical analyses and comparison',()=>{
 const s=fs.readFileSync(path.join(root,'src/routes/diagnostics.js'),'utf8');
 for(const token of ['/analyses','/compare','/export/:id','/duplicate','/:id/sources','/:id/metrics','/:id/evidences']) assert.match(s,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(s,/snapshot_locked/);
 assert.match(s,/assertMutable/);
});

test('v1.0.22 diagnostic frontend contains the central intelligence workspace',()=>{
 const s=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
 for(const token of ['Nova análise','Análises realizadas','Fontes & ativos','Evidências','Métricas','Comparar','Duplicar','Exportar','score','confiança']) assert.match(s,new RegExp(token));
 assert.doesNotMatch(s,/style="width:/);
});

test('v1.0.23 package version is 1.0.23',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.equal(pkg.version,'1.0.28');
});
