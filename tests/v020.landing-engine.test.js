const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('Landing Page Engine v0.2.0 exposes all 13 landing routes in the server',()=>{
  const server=fs.readFileSync(path.join(root,'src','app.js'),'utf8');
  for(const slug of ['g3erp','g3control','g3food','g3pedidos','g3small','varejo','supermercados','restaurantes','lojas','conveniencias','multilojas','descubra-seu-g3','calculadora-de-perdas']){
    assert.match(server,new RegExp(slug.replaceAll('-','\\-')));
  }
});

test('Landing Page Engine v0.2.0 contains shared engine, data and responsive styles',()=>{
  const dir=path.join(root,'public','landing');
  for(const file of ['index.html','landing.css','landing-data.js','landing-engine.js']) assert.ok(fs.existsSync(path.join(dir,file)),`missing ${file}`);
  const engine=fs.readFileSync(path.join(dir,'landing-engine.js'),'utf8');
  const data=fs.readFileSync(path.join(dir,'landing-data.js'),'utf8');
  const css=fs.readFileSync(path.join(dir,'landing.css'),'utf8');
  assert.match(engine,/G3_LANDING_DATA/);
  assert.match(engine,/page_view/);
  assert.match(engine,/cta_click/);
  assert.match(engine,/form_submit/);
  assert.match(engine,/diagnostic_complete/);
  assert.match(engine,/calculator_complete/);
  assert.match(data,/g3erp/);
  assert.match(data,/g3control/);
  assert.match(data,/g3food/);
  assert.match(data,/g3pedidos/);
  assert.match(data,/g3small/);
  assert.match(data,/multilojas/);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/@media\(max-width:560px\)/);
});

test('Landing Page Engine v0.2.0 keeps frontend CSP-safe without inline style attributes',()=>{
  const files=[];
  const walk=d=>{for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())walk(p);else if(/\.(html|js)$/.test(e.name))files.push(p)}};
  walk(path.join(root,'public'));
  const offenders=[];
  for(const file of files){const text=fs.readFileSync(file,'utf8');if(/\bstyle\s*=\s*["']/i.test(text))offenders.push(path.relative(root,file));}
  assert.deepEqual(offenders,[]);
});
