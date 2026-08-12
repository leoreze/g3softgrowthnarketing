const test=require('node:test');const assert=require('node:assert/strict');
const fs=require('fs');const path=require('path');
test('project structure exists',()=>{for(const p of ['src/app.js','src/server.js','src/db/migrate.js','src/db/migrations/001_initial_schema.sql','public/index.html','public/css/app.css','public/js/app.js','render.yaml','.env.example'])assert.equal(fs.existsSync(path.join(__dirname,'..',p)),true,p)});
test('production reset guard exists',()=>assert.match(fs.readFileSync(path.join(__dirname,'../src/db/reset.js'),'utf8'),/disabled in production/));
test('security baseline is present',()=>{const app=fs.readFileSync(path.join(__dirname,'../src/app.js'),'utf8');assert.match(app,/helmet/);assert.match(app,/httpOnly:true/);assert.match(app,/secure:env\.isProduction/);assert.match(app,/limit:240/)});
test('workflow states are constrained',()=>{const sql=fs.readFileSync(path.join(__dirname,'../src/db/migrations/001_initial_schema.sql'),'utf8');for(const state of ['BACKLOG','IN_PROGRESS','PENDING_APPROVAL','APPROVED','REJECTED','DONE','BLOCKED'])assert.match(sql,new RegExp(state))});
