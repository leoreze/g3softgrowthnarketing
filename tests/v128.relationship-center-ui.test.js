const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.0.28 marketing UUID helper returns the UUID value, never boolean true',()=>{
  const s=read('src/routes/marketing.js');
  assert.match(s,/function uuid\(v\).*\?v:null;/);
});

test('relationship center operational migration is additive',()=>{
  const s=read('src/db/migrations/030_relationship_center_operational.sql');
  for(const t of ['relationship_modules','relationship_signals','relationship_experience_events','relationship_conversations']) assert.match(s,new RegExp(`CREATE TABLE IF NOT EXISTS ${t}`));
  assert.doesNotMatch(s,/^\s*(DROP\s+(TABLE|DATABASE|SCHEMA)|TRUNCATE)/im);
});

test('relationship center API exposes operational endpoints',()=>{
  const s=read('src/routes/marketing.js');
  assert.match(s,/\/relationship-center/);
  assert.match(s,/relationship_modules/);
  assert.match(s,/relationship_playbooks/);
  assert.match(s,/relationship_signals/);
  assert.match(s,/relationship_experience_events/);
  assert.match(s,/relationship_conversations/);
});

test('CRM Growth workspace uses shared light CRM cards and organized content engine',()=>{
  const css=read('public/css/crm-premium.css');
  const ui=read('public/js/crm-premium.js');
  assert.match(css,/\.crm-growth \.crm-growth-card[\s\S]*?background:#fff/);
  assert.match(css,/\.crm-content-assets\{display:grid/);
  assert.match(css,/\.crm-rel-kpis\{display:grid/);
  assert.match(ui,/crm-content-week/);
  assert.match(ui,/crm-playbook-card/);
  assert.match(ui,/crm-relationship-center/);
});

test('Growth workspace copy remains G3Soft-specific',()=>{
  for(const file of ['public/js/crm-premium.js','README.md','CHANGELOG.md']){
    assert.doesNotMatch(read(file),/arquitetura de relacionamento do cliente anterior/i);
  }
});
