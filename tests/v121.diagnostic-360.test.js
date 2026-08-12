
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.21 diagnostic 360 has ten weighted growth dimensions',()=>{
  const s=fs.readFileSync(path.join(root,'src/services/diagnostic360.js'),'utf8');
  for(const token of ['MARCA_PRESENCA','SITE_CRO','SEO','CONTEUDO_SOCIAL','MIDIA_PAGA','CRM_LEADS','ANALYTICS_TRACKING','AUTOMACAO','COMERCIAL','DADOS_GOVERNANCA']) assert.match(s,new RegExp(token));
  assert.match(s,/overall/);
  assert.match(s,/maturity/);
});

test('v1.0.21 exposes diagnostic API and AI endpoints server-side',()=>{
  const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
  const route=fs.readFileSync(path.join(root,'src/routes/diagnostics.js'),'utf8');
  assert.match(app,/\/api\/diagnostics/);
  assert.match(route,/\/ai\/analyze/);
  assert.match(route,/\/ai\/chat/);
  assert.match(route,/OPENAI_API_KEY/);
});

test('v1.0.21 diagnostic persistence migration is additive and non-destructive',()=>{
  const s=fs.readFileSync(path.join(root,'src/db/migrations/018_growth_diagnostic_360.sql'),'utf8');
  assert.match(s,/CREATE TABLE IF NOT EXISTS growth_diagnostics/);
  assert.match(s,/CREATE TABLE IF NOT EXISTS growth_diagnostic_assessments/);
  assert.match(s,/CREATE TABLE IF NOT EXISTS growth_diagnostic_actions/);
  assert.doesNotMatch(s,/DROP TABLE|DROP DATABASE|TRUNCATE|DROP SCHEMA/);
});

test('v1.0.21 diagnostic UI is present in Portuguese Brazil',()=>{
  const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  for(const token of ['Diagnóstico 360','Analisar com IA','Conversar com IA','Score por dimensão','Evidências e critérios']) assert.match(js,new RegExp(token));
  assert.match(html,/Diagnóstico 360/);
});

test('v1.0.21 keeps OpenAI key server-side',()=>{
  const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  assert.doesNotMatch(js,/OPENAI_API_KEY|api\.openai\.com/);
});


test('v1.0.21 diagnostic loader binds the diagnostics response before render',()=>{
  const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  assert.match(js,/const \[c,p,t,d,b,u,a,w,ct,co,an,no,au,dg\]=await Promise\.all/);
  assert.match(js,/state\.diagnostic=dg\.data/);
});
