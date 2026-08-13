const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const crm=fs.readFileSync(path.join(root,'public/js/crm-premium.js'),'utf8');
const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');

test('Global page loader is present and exposed',()=>{
  assert.match(html,/id="pageLoader"[^>]*class="page-loader"/);
  assert.match(app,/window\.G3PageLoader=\{show:showPageLoader,hide:hidePageLoader,run:withPageLoader\}/);
  assert.match(app,/function withPageLoader\(task,message='Carregando\.\.\.',minDuration=420\)/);
});

test('Main application page navigation uses loader',()=>{
  assert.match(app,/\$\$\('\[data-view-action\]'\)\.forEach\(b=>b\.onclick=async\(\)=>\{/);
  assert.match(app,/withPageLoader\(async\(\)=>\{state\.view=b\.dataset\.viewAction;render\(\)/);
  assert.match(app,/Abrindo \$\{label\|\|'página'\}\.\.\./);
});

test('CRM tabs and view modes use the global loader',()=>{
  assert.match(crm,/document\.querySelectorAll\('\[data-crm-tab\]'\)\.forEach\(b=>b\.onclick=async\(\)=>\{/);
  assert.match(crm,/runLoader\(async\(\)=>\{state\.tab=next;state\.mode='table';await render\(\)/);
  assert.match(crm,/document\.querySelectorAll\('\[data-crm-mode\]'\)\.forEach\(b=>b\.onclick=async\(\)=>\{/);
});

test('Growth & Marketing submenus use the global loader',()=>{
  assert.match(crm,/document\.querySelectorAll\('\[data-strategy-section\]'\)\.forEach\(b=>b\.onclick=async\(\)=>\{/);
  assert.match(crm,/state\.marketing\.section=b\.dataset\.strategySection;await renderMarketingOnly\(\)/);
  assert.match(crm,/Abrindo \$\{label\}\.\.\./);
});

test('CRM internal company-to-contact navigation uses loader',()=>{
  assert.match(crm,/data-company-id[\s\S]*?runLoader\(async\(\)=>\{state\.tab='contacts';state\.search='';await render\(\)/);
});
