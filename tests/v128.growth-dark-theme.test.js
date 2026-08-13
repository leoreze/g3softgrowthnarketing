const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const css=fs.readFileSync(path.join(root,'public/css/crm-premium.css'),'utf8');

test('Growth workspace uses dark CRM surfaces',()=>{
  assert.match(css,/\.crm-growth \.crm-growth-card[\s\S]*?background:#101216!important/);
  assert.match(css,/\.crm-growth \.crm-strategy-nav[\s\S]*?background:#0D0F13!important/);
  assert.match(css,/\.crm-growth \.crm-strategy-nav button\.active[\s\S]*?color:#FFAA45!important/);
});

test('Growth typography has sufficient dark-theme contrast tokens',()=>{
  assert.match(css,/\.crm-growth h1,[\s\S]*?color:#F5F5F5!important/);
  assert.match(css,/\.crm-growth p\{color:#A4A7AE!important\}/);
  assert.match(css,/\.crm-growth \.crm-panel-kicker\{[\s\S]*?color:#858A94!important/);
});

test('Growth inputs and controls match dark CRM system',()=>{
  assert.match(css,/\.crm-growth input,[\s\S]*?background:#0D0F13!important/);
  assert.match(css,/\.crm-growth \.btn-secondary[\s\S]*?background:#171A20!important/);
  assert.match(css,/\.crm-growth \.btn-primary[\s\S]*?linear-gradient\(135deg,#FF8A00,#FF9E2F\)!important/);
});

test('Content Engine and Relationship Center are covered by dark theme',()=>{
  assert.match(css,/\.crm-growth \.crm-content-engine-hero[\s\S]*?background:/);
  assert.match(css,/\.crm-growth \.crm-content-asset[\s\S]*?background:#101216!important/);
  assert.match(css,/\.crm-growth \.crm-rel-hero[\s\S]*?background:/);
  assert.match(css,/\.crm-growth \.crm-playbook-card[\s\S]*?background:#101216!important/);
});
