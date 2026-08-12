const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'..');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');

test('v1.0.4 bindFilters tolerates task views without dueFilter',()=>{
  assert.match(app,/const search=\$\('#searchFilter'\);if\(search\)search\.oninput/);
  assert.match(app,/const clear=\$\('#clearFilters'\);if\(clear\)clear\.onclick/);
  assert.match(app,/const due=\$\('#dueFilter'\);if\(due\)due\.onchange=applyFilters/);
});

test('v1.0.4 keeps Task Execution Center open action wired',()=>{
  assert.match(app,/data-open-task/);
  assert.match(app,/taskDetails\(b\.dataset\.openTask\)/);
  assert.match(app,/api\(`\/api\/tasks\/\$\{id\}\/details`/);
});
