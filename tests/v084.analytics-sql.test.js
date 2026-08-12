const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');

test('v0.8.4 analytics daily activity query uses a safe alias',()=>{
  const src=fs.readFileSync(path.join(process.cwd(),'src/services/analytics.js'),'utf8');
  assert.match(src,/AS activity_date/);
  assert.doesNotMatch(src,/::date\s+day[,\s]/);
});

test('v0.8.4 package version is centralized',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(process.cwd(),'package.json'),'utf8'));
  assert.match(pkg.version,/^(?:0\.(8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
});
