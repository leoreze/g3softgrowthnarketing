const test=require('node:test');const assert=require('node:assert/strict');const fs=require('fs');const path=require('path');
const root=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('v1.0.0 production hardening is versioned and documented',()=>{const pkg=require(path.join(root,'package.json'));assert.match(pkg.version,/^1\.0\.[0-9]+$/);assert.match(read('CHANGELOG.md'),/1\.0\.[0-9]+/);assert.match(read('docs/SECURITY.md'),/production/i)});
test('v1.0.0 security headers and request correlation are enabled',()=>{const s=read('src/app.js');assert.match(s,/helmet/);assert.match(s,/hsts/);assert.match(s,/X-Request-ID/);assert.match(s,/Cache-Control/);assert.match(s,/frameAncestors/);assert.match(s,/formAction/)});
test('v1.0.0 production session hardening is enabled',()=>{const s=read('src/app.js');assert.match(s,/__Host-g3sid/);assert.match(s,/createTableIfMissing:!env\.isProduction/);assert.match(s,/httpOnly:true/);assert.match(s,/sameSite:'lax'/);assert.match(s,/secure:env\.isProduction/)});
test('v1.0.0 automation is schema-aware',()=>{const s=read('src/server.js');assert.match(s,/to_regclass\('public\.automation_rules'\)/);assert.match(s,/scheduler disabled/);assert.match(s,/pool\.end/)});
test('v1.0.0 readiness endpoint validates production dependencies',()=>{const s=read('src/app.js');assert.match(s,/\/api\/ready/);assert.match(s,/schema_migrations/);assert.match(s,/automation_rules/);assert.match(s,/notifications/)});
test('v1.0.0 migration history remains append-only',()=>{const files=fs.readdirSync(path.join(root,'src/db/migrations')).filter(f=>f.endsWith('.sql')).sort();assert.ok(files.indexOf('011_automation_notifications.sql')>=0);assert.equal(files.at(-1),'017_execution_schema_reconciliation.sql');assert.equal(files.length,17);assert.ok(files.includes('014_task_execution_center.sql'));assert.ok(files.includes('013_task_execution_deliverables.sql'))});
test('v1.0.0 unsafe API requests enforce allowed origin when supplied',()=>{const s=read('src/app.js');assert.match(s,/unsafeMethods/);assert.match(s,/ORIGIN_FORBIDDEN/);});
