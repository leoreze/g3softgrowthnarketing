const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v0.8.2 analytics uses existing approval_requests table',()=>{
  const s=fs.readFileSync(path.join(root,'src/services/analytics.js'),'utf8');
  assert.match(s,/FROM approval_requests a WHERE a\.status='PENDING'/);
  assert.doesNotMatch(s,/FROM approvals a/);
});

test('v0.8.2 package version is centralized',()=>{
  const pkg=require(path.join(root,'package.json'));
  assert.match(pkg.version,/^(?:0\.(8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
});
