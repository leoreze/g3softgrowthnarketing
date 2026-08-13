const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');

const repair=fs.readFileSync(path.join(root,'src/db/migrations/028_growth_calendar_relationship_repair.sql'),'utf8');
const engine=fs.readFileSync(path.join(root,'src/db/migrations/029_content_engine_6_months.sql'),'utf8');
const route=fs.readFileSync(path.join(root,'src/routes/marketing.js'),'utf8');
const ui=fs.readFileSync(path.join(root,'public/js/crm-premium.js'),'utf8');
const index=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
const g3=fs.readFileSync(path.join(root,'public/g3soft/index.html'),'utf8');
const landing=fs.readFileSync(path.join(root,'public/landing/index.html'),'utf8');

test('relationship playbooks repair is idempotent and non-destructive',()=>{
  assert.match(repair,/CREATE TABLE IF NOT EXISTS relationship_playbooks/);
  assert.doesNotMatch(repair,/DROP TABLE|TRUNCATE|DROP DATABASE/i);
});

test('content engine defines 26 weeks x 11 channels',()=>{
  assert.match(engine,/CREATE TABLE IF NOT EXISTS growth_content_assets/);
  assert.match(engine,/CHECK\(week_no BETWEEN 1 AND 26\)/);
  assert.match(engine,/UNIQUE\(week_no,channel_key\)/);
  for(const c of ['SEO','INSTAGRAM','FACEBOOK','LINKEDIN','YOUTUBE','GOOGLE_ADS','META_ADS','EMAIL','WHATSAPP','CRM','SITE']) assert.match(engine,new RegExp(`'${c}'`));
  assert.equal((engine.match(/INSERT INTO growth_content_assets/g)||[]).length,286);
});

test('content engine API and CRM UI are wired',()=>{
  assert.match(route,/\/content-engine/);
  assert.match(route,/growth_content_assets/);
  assert.match(route,/\/content-engine\/:id\/status/);
  assert.match(ui,/data-strategy-section="contentengine"/);
  assert.match(ui,/contentEngineView/);
  assert.match(ui,/api\('\/api\/crm\/marketing\/content-engine'\)/);
  assert.doesNotMatch(ui,/state\.marketing\.growth=growth\.data;\s*}/);
});

test('all public entry points use the supplied favicon',()=>{
  for(const html of [index,g3,landing]){
    assert.match(html,/href="\/favicon-32\.png"/);
    assert.match(html,/href="\/apple-touch-icon\.png"/);
  }
  for(const f of ['favicon-32.png','icon-192.png','icon-512.png']) assert.ok(fs.existsSync(path.join(root,'public',f)));
});
