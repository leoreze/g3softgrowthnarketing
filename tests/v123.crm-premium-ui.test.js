const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const crm=fs.readFileSync(path.join(root,'public/js/crm-premium.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/crm-premium.css'),'utf8');

test('v1.0.22 CRM premium navigation and assets are integrated',()=>{
  assert.match(html,/data-view="crm"/);
  assert.match(html,/crm-premium\.css/);
  assert.match(html,/crm-premium\.js/);
  assert.match(app,/crm:'CRM'/);
  assert.match(app,/window\.G3CRM\?\.render/);
});

test('CRM premium UI exposes leads, companies, contacts and Kanban modes',()=>{
  assert.match(crm,/data-crm-tab="leads"/);
  assert.match(crm,/data-crm-tab="companies"/);
  assert.match(crm,/data-crm-tab="contacts"/);
  assert.match(crm,/data-crm-mode="kanban"/);
  assert.match(crm,/\/api\/crm\/leads/);
  assert.match(crm,/\/api\/crm\/companies/);
  assert.match(crm,/\/api\/crm\/contacts/);
});

test('CRM premium UI is CSP-safe without inline style or script tags',()=>{
  assert.doesNotMatch(html,/<script(?![^>]*src=)/i);
  assert.doesNotMatch(html,/\sstyle\s*=/i);
  assert.doesNotMatch(crm,/\sstyle\s*=/i);
});

test('CRM premium visual system contains responsive layouts and G3Soft orange accent',()=>{
  assert.match(css,/--crm-orange:#f36b21/);
  assert.match(css,/@media\(max-width:1100px\)/);
  assert.match(css,/@media\(max-width:720px\)/);
  assert.match(css,/crm-hero/);
  assert.match(css,/crm-kanban/);
});
