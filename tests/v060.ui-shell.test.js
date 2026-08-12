const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v0.6.0 page loader and navigation shell are present',()=>{
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');
  assert.match(html,/id="pageLoader"/);
  assert.match(html,/page-loader-card/);
  assert.match(js,/showPageLoader/);
  assert.match(js,/withPageLoader/);
  assert.match(js,/Autenticando e preparando seu workspace/);
  assert.match(js,/Abrindo /);
  assert.match(css,/\.sidebar\{[^}]*position:fixed/);
  assert.match(css,/\.sidebar \.nav\{overflow-y:auto/);
  assert.match(css,/\.page-loader\.show/);
  assert.match(css,/::-webkit-scrollbar/);
  assert.match(css,/scrollbar-color/);
});

test('v0.6.0 frontend keeps CSP-safe styling',()=>{
  const files=[path.join(root,'public/index.html'),path.join(root,'public/js/app.js')];
  for(const file of files){
    const s=fs.readFileSync(file,'utf8');
    assert.doesNotMatch(s,/style\\s*=/i);
    assert.doesNotMatch(s,/\\.style\\s*\\./);
  }
});
