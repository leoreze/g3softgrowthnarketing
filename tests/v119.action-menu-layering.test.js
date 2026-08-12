const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');

test('v1.0.20 action menus raise their local stacking host when opened',()=>{
  assert.match(app,/action-menu-host-open/);
  assert.match(css,/action-menu-host-open/);
});

test('v1.0.20 content planner action menu has maximum practical z-index layering',()=>{
  assert.match(css,/\.action-menu-wrap\{[^}]*z-index:9999999999999999999999999999/);
  assert.match(css,/\.action-menu\{[^}]*z-index:2147483647/);
  assert.match(css,/\.content-column\.action-menu-host-open/);
  assert.match(css,/\.content-card\.action-menu-host-open/);
});

test('v1.0.20 campaign action menu can escape the campaign panel clipping context',()=>{
  assert.match(css,/\.grid-2>\.panel\.action-menu-host-open\{[^}]*overflow:visible/);
});

test('v1.0.20 action menu click closes and removes host layering state',()=>{
  assert.match(app,/card\.classList\.toggle\('action-menu-host-open',open\)/);
  assert.match(app,/card\.classList\.remove\('action-menu-host-open'\)/);
});

test('v1.0.20 version is 1.0.20',()=>assert.equal(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,'1.0.20'));

test('v1.0.20 frontend still contains no inline style attributes',()=>{
  assert.doesNotMatch(app,/style\s*=/i);
  assert.doesNotMatch(fs.readFileSync(path.join(root,'public/index.html'),'utf8'),/style\s*=/i);
});
