const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const data=fs.readFileSync('public/landing/landing-data.js','utf8');
const landing=fs.readFileSync('public/landing/index.html','utf8');
const main=fs.readFileSync('public/g3soft/index.html','utf8');
const server=fs.readFileSync('src/app.js','utf8');
const css=fs.readFileSync('public/landing/landing.css','utf8');
const mainCss=fs.readFileSync('public/g3soft/css/styles.css','utf8');
const engine=fs.readFileSync('public/landing/landing-engine.js','utf8');
const segments=['loja-de-roupas','loja-de-conveniencias','deposito-de-bebidas','bares-e-restaurantes','padarias','lanchonetes-e-docerias','mercearias-e-mercados'];

test('new segment landing configurations exist',()=>segments.forEach(s=>assert.match(data,new RegExp(`['"]?${s.replace(/-/g,'\\-')}['"]?:\\{type:'segment'`))));
test('landing header exposes solutions and segments separately plus main-site button',()=>{
  assert.match(landing,/Soluções/); assert.match(landing,/Segmentos/); assert.match(landing,/href="\/g3soft"/);
  for(const s of segments) assert.match(landing,new RegExp(`/segmentos/${s}`));
  for(const p of ['g3erp','g3control','g3food','g3pedidos','g3small']) assert.match(landing,new RegExp(`href="/${p}"`));
});
test('institutional header separates solutions and segments',()=>{
  assert.match(main,/class="nav-dropdown"/); assert.match(main,/Soluções/); assert.match(main,/Segmentos/);
  for(const s of segments) assert.match(main,new RegExp(`/segmentos/${s}`));
});
test('canonical nested segment routes are supported',()=>{
  for(const s of segments) assert.ok(server.includes('/segmentos/'+s) || server.includes(s), 'route missing: '+s);
  assert.match(engine,/routeKey=path\.startsWith\('segmentos\/'\)/);
});
test('landing navigation has responsive dropdown styles',()=>{
  assert.match(css,/\.lp-nav-dropdown/); assert.match(css,/\.lp-nav\.open/); assert.match(mainCss,/\.nav-menu/);
});
