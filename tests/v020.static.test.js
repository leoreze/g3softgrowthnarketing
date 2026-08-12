const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('legacy work management manifest and migration remain present',()=>{
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.match(pkg.version,/^(?:0\.(3\.[2-9]|4\.0|5\.0|6\.0|7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
 assert.ok(fs.existsSync(path.join(root,'src/db/migrations/004_work_management.sql')));
 assert.ok(fs.existsSync(path.join(root,'src/routes/work-management.js')));
});

test('work management migration contains core collaboration tables',()=>{
 const sql=fs.readFileSync(path.join(root,'src/db/migrations/004_work_management.sql'),'utf8');
 for(const name of ['task_subtasks','task_comments','tags','task_tags','task_dependencies','task_time_entries','task_attachments']) assert.match(sql,new RegExp(`CREATE TABLE IF NOT EXISTS ${name}`));
});

test('production safety documentation exists and no real database URL is committed',()=>{
 const files=[];
 function walk(dir){for(const item of fs.readdirSync(dir)){if(['node_modules','.git','.env','.env.local','.env.development','.env.production','.env.example'].includes(item))continue;const full=path.join(dir,item);const st=fs.statSync(full);if(st.isDirectory())walk(full);else files.push(full)}}
 walk(root);
 const forbidden=files.filter(f=>!f.endsWith('.zip')).flatMap(f=>{const s=fs.readFileSync(f,'utf8');return /postgres(?:ql)?:\/\/[^\s<]+:[^\s<]+@/.test(s) && !s.includes('localhost:5432') ? [f] : []});
 assert.deepEqual(forbidden,[]);
 const gitignore=fs.readFileSync(path.join(root,'.gitignore'),'utf8');
 assert.match(gitignore,/^\.env\s*$/m);
 assert.ok(fs.existsSync(path.join(root,'docs/DEPLOY-RENDER.md')));
});

test('frontend includes kanban and responsive accessibility hooks',()=>{
 const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
 const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');
 assert.match(js,/dragstart/);assert.match(js,/\/api\/work\/board/);assert.match(js,/data-cal-mode/);
 assert.match(css,/prefers-reduced-motion/);assert.match(css,/grid-template-columns/);
});


test('environment loader and remote database protections remain present',()=>{
 const env=fs.readFileSync(path.join(root,'src/config/env.js'),'utf8');
 const pool=fs.readFileSync(path.join(root,'src/db/pool.js'),'utf8');
 const reset=fs.readFileSync(path.join(root,'src/db/reset.js'),'utf8');
 const seed=fs.readFileSync(path.join(root,'src/db/seed.js'),'utf8');
 assert.match(env,/projectRoot/);
 assert.match(env,/loadEnvFile/);
 assert.match(env,/dotenv\.config/);
 assert.match(env,/new URL\(databaseUrl\)/);
 assert.match(pool,/rejectUnauthorized: false/);
 assert.match(reset,/remote databases/);
 assert.match(seed,/db:seed is blocked in production/);
 assert.doesNotMatch(seed,/disabled for remote databases/);
 assert.ok(fs.existsSync(path.join(root,'src/db/status.js')));
 assert.equal(fs.existsSync(path.join(root,'docker-compose.yml')),false);
});

test('authentication route remains mounted and runtime version is consistent',()=>{
 const app=fs.readFileSync(path.join(root,'src/app.js'),'utf8');
 const auth=fs.readFileSync(path.join(root,'src/routes/auth.js'),'utf8');
 const server=fs.readFileSync(path.join(root,'src/server.js'),'utf8');
 const index=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.equal(pkg.version,require(path.join(root,'package.json')).version);
 assert.match(app,/app\.use\('\/api\/auth',require\('\.\/routes\/auth'\)\)/);
 assert.match(auth,/router\.post\('\/login'/);
 assert.match(server,/require\('\.\.\/package\.json'\)/);
 assert.match(server,/G3Soft Growth OS v\$\{pkg\.version\}/);
 assert.match(app,/version:pkg.version/);
 assert.match(index,new RegExp(`G3Soft Growth OS v${pkg.version.replaceAll('.', '\\.')}`));
});


test('remote admin provisioning and doctor are present',()=>{
 const bootstrap=fs.readFileSync(path.join(root,'src/db/bootstrap.js'),'utf8');
 const doctor=fs.readFileSync(path.join(root,'src/db/doctor.js'),'utf8');
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.match(bootstrap,/BOOTSTRAP_REMOTE_CONFIRM/);
 assert.match(bootstrap,/password.*12|12.*password/s);
 assert.match(doctor,/ADMIN: NOT_PROVISIONED/);
 assert.equal(pkg.scripts['db:doctor'],'node src/db/doctor.js');
});
