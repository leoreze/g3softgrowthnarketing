const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=process.cwd();
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.0.23 growth revenue engine has attribution migration',()=>{
 const sql=read('src/db/migrations/021_growth_attribution_whatsapp.sql');
 for(const token of ['marketing_landing_pages','marketing_tracking_links','marketing_touchpoints','whatsapp_templates','marketing_automations','marketing_message_queue','ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id'])assert.match(sql,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
});

test('public marketing capture and tracking routes are wired',()=>{
 const app=read('src/app.js'); const route=read('src/routes/marketing.js'); const service=read('src/services/marketing.js');
 assert.match(app,/\/api\/public\/marketing/); assert.match(app,/\/api\/crm\/marketing/); assert.match(app,/marketing_tracking_links/);
 assert.match(route,/publicRouter\.post\('\/leads'/); assert.match(route,/admin\.post\('\/links\/bulk'/); assert.match(route,/admin\.get\('\/overview'/);
 assert.match(service,/utm_source/); assert.match(service,/gclid/); assert.match(service,/marketing_touchpoints/); assert.match(service,/marketing_message_queue/);
});

test('landing and institutional forms use the CRM public endpoint',()=>{
 assert.match(read('public/landing/landing-engine.js'),/\/api\/public\/marketing\/leads/);
 assert.match(read('public/landing/landing-engine.js'),/g3_link/);
 assert.match(read('public/g3soft/js/app.js'),/\/api\/public\/marketing\/leads/);
});

test('CRM exposes Growth & Marketing workspace',()=>{
 const js=read('public/js/crm-premium.js'); const css=read('public/css/crm-premium.css');
 assert.match(js,/data-crm-tab="marketing"/); assert.match(js,/\/api\/crm\/marketing\/links\/bulk/); assert.match(js,/\/api\/crm\/marketing\/overview/); assert.match(css,/crm-growth/);
});

test('whatsapp environment contract is documented',()=>{
 const env=read('.env.example');
 for(const key of ['WHATSAPP_CLOUD_TOKEN','WHATSAPP_PHONE_NUMBER_ID','WHATSAPP_API_VERSION','WHATSAPP_SALES_NUMBER'])assert.match(env,new RegExp(key));
});
