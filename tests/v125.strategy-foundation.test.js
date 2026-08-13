const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.0.25 strategy foundation migration is additive and complete',()=>{
 const s=read('src/db/migrations/023_strategy_foundation.sql');
 for(const token of ['strategies','strategy_message_house','strategy_value_pillars','icps','segments','products','proofs','message_matrix','strategy_id','message_matrix_id']) assert.match(s,new RegExp(token));
 assert.doesNotMatch(s,/DROP\s+(TABLE|SCHEMA|DATABASE)/i);
 assert.doesNotMatch(s,/TRUNCATE\s+/i);
});

test('v1.0.25 strategy API exposes foundation and matrix execution',()=>{
 const s=read('src/routes/marketing.js');
 assert.match(s,/\/strategy\/foundation/);
 assert.match(s,/\/strategy\/matrix\/campaign-draft/);
 assert.match(s,/\/strategy\/matrix\/lp-draft/);
 assert.match(s,/message_matrix/);
 assert.match(s,/strategies/);
});

test('v1.0.25 Growth & Marketing exposes strategy workspace',()=>{
 const s=read('public/js/crm-premium.js');
 for(const token of ['Message House','ICPs & Segmentos','Matriz de Mensagens','Provas','Landing Pages','data-matrix-campaign','data-matrix-lp']) assert.match(s,new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));
 assert.match(s,/\/api\/crm\/marketing\/strategy\/foundation/);
 assert.doesNotMatch(s,/\$\{marketingView\(\)\}/);
});

test('v1.0.25 strategy-to-execution links campaigns and LP drafts',()=>{
 const s=read('src/routes/marketing.js');
 assert.match(s,/UPDATE message_matrix SET campaign_id/);
 assert.match(s,/INSERT INTO marketing_landing_pages/);
 assert.match(s,/message_matrix_id/);
});

test('v1.0.25 package is versioned',()=>{
 const pkg=require(path.join(root,'package.json'));
 assert.equal(pkg.version,'1.0.28');
 assert.match(read('CHANGELOG.md'),/1\.0\.25/);
});
