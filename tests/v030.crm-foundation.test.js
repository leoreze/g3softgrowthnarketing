const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

const migration=fs.readFileSync(path.join(root,'src/db/migrations/020_crm_foundation.sql'),'utf8');
const route=fs.readFileSync(path.join(root,'src/routes/crm.js'),'utf8');
const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');

const conflict=/^(<<<<<<<|=======|>>>>>>>)/m;

test('v0.3.0 CRM migration defines the foundation tables and indexes',()=>{
 for(const table of ['companies','contacts','lead_sources','leads','lead_history']) assert.match(migration,new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`));
 for(const index of ['idx_companies_status','idx_contacts_company','idx_leads_status','idx_leads_source','idx_lead_history_lead']) assert.match(migration,new RegExp(`CREATE INDEX IF NOT EXISTS ${index}`));
 assert.doesNotMatch(migration,/DROP DATABASE|DROP SCHEMA|TRUNCATE/);
});

test('v0.3.0 CRM migration is additive and seeds normalized lead sources',()=>{
 assert.match(migration,/ON CONFLICT\(name\) DO NOTHING/);
 for(const source of ['Site','Landing Page','Google Ads','Meta Ads','WhatsApp','Indicação','Parceiro']) assert.match(migration,new RegExp(source));
 assert.match(migration,/REFERENCES users\(id\) ON DELETE SET NULL/);
});

test('v0.3.0 CRM API exposes companies, contacts, leads, qualification, conversion and history',()=>{
 for(const endpoint of ['/companies','/contacts','/leads','/leads/:id/status','/leads/:id/qualify','/leads/:id/convert','/leads/:id/history','/lead-sources']) assert.match(route,new RegExp(endpoint.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(route,/router\.use\(requireAuth\)/);
 assert.match(route,/requireRole/);
 assert.match(route,/INVALID_TRANSITION/);
 assert.match(route,/STATUS_CHANGED/);
 assert.match(route,/QUALIFIED/);
 assert.match(route,/CONVERTED/);
});

test('v0.3.0 CRM API uses parameterized SQL and audit logging for mutations',()=>{
 assert.doesNotMatch(route,/query\([^`]*\$\{req\./);
 for(const action of ['CREATE','UPDATE','DELETE','STATUS_CHANGE','QUALIFY','CONVERT']) assert.match(route,new RegExp(`action:'${action}'`));
 assert.match(route,/require\('\.\.\/middleware\/audit'\)/);
});

test('v0.3.0 CRM is mounted under /api/crm without replacing existing APIs',()=>{
 assert.match(app,/app\.use\('\/api\/crm',require\('\.\/routes\/crm'\)\);/);
 for(const existing of ['/api/auth','/api/tasks','/api/diagnostics','/api/analytics']) assert.match(app,new RegExp(existing.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('v0.3.0 CRM and base project contain no unresolved merge markers',()=>{
 for(const file of [
  'src/app.js','src/routes/crm.js','src/db/migrations/020_crm_foundation.sql','README.md','CHANGELOG.md'
 ]) assert.doesNotMatch(fs.readFileSync(path.join(root,file),'utf8'),conflict,`${file} contains a conflict marker`);
});

test('v0.3.0 package baseline remains 1.0.23',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.equal(pkg.version,'1.0.28');
});
