const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v0.8.3 analytics resolves tasks through phases because tasks has no campaign_id',()=>{
  const s=fs.readFileSync(path.join(root,'src/services/analytics.js'),'utf8');
  assert.match(s,/LEFT JOIN phases p ON p\.campaign_id=c\.id/);
  assert.match(s,/LEFT JOIN tasks t ON t\.phase_id=p\.id/);
  assert.doesNotMatch(s,/LEFT JOIN tasks t ON t\.campaign_id=c\.id/);
});

test('v0.8.3 responsive shell removes hidden sidebar grid space below desktop breakpoint',()=>{
  const s=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');
  assert.match(s,/@media\(min-width:700px\) and \(max-width:1099px\)\{[^}]*\.app-shell\{grid-template-columns:1fr\}/);
  assert.match(s,/@media\(min-width:700px\) and \(max-width:1099px\).*?\.sidebar\{position:fixed/s);
  assert.match(s,/@media\(min-width:1100px\)\{\.app-shell\{grid-template-columns:280px 1fr/);
});

test('v0.8.3 package version is centralized',()=>{
  const pkg=require(path.join(root,'package.json'));
  assert.match(pkg.version,/^(?:0\.(8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
});
