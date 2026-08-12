const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');

test('v0.7.3 restores New Task modal and task creation API flow',()=>{
  assert.match(js,/function newTask\(\)/);
  assert.match(js,/api\('\/api\/tasks'/);
  assert.match(js,/id="newTaskPage"/);
  assert.match(js,/id="kanbanNew"/);
});

test('v0.7.3 applies unified premium modal form controls',()=>{
  assert.match(css,/\.premium-form-grid/);
  assert.match(css,/\.modal input:not\(\[type="checkbox"\]\)/);
  assert.match(css,/\.modal select/);
  assert.match(css,/\.modal textarea/);
});

test('v0.7.3 shows loader for every sidebar navigation click',()=>{
  assert.match(js,/\$\$\('\.nav-item'\)\.forEach/);
  assert.match(js,/withPageLoader\(async\(\)=>/);
  assert.match(js,/requestAnimationFrame/);
});


test('v0.7.4 restores Roadmap New Phase modal and API flow',()=>{
  assert.match(js,/function newPhase\(\)/);
  assert.match(js,/id="newPhase"/);
  assert.match(js,/api\('\/api\/phases'/);
  assert.match(js,/id="cancelPhase"/);
});

test('v0.7.4 standardizes modal footer as full-width and right-aligned',()=>{
  assert.match(css,/\.modal \.form-actions\{[^}]*grid-column:1\/-1/);
  assert.match(css,/\.modal \.form-actions[^}]*justify-content:flex-end/);
  assert.match(css,/border-top:1px solid rgba\(255,255,255,.10\)/);
});
