import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync('public/js/app.js', 'utf8');

test('v0.7.4 navigation loader applies to every sidebar item', () => {
  assert.match(app, /\.nav-item.*forEach/);
  assert.match(app, /withPageLoader\(async\(\)=>/);
  assert.match(app, /showPageLoader\(message\)/);
  assert.match(app, /minDuration=420/);
});

test('v0.7.4 page loader remains CSP-safe and uses the shared loader element', () => {
  assert.match(app, /#pageLoader/);
  assert.doesNotMatch(app, /style\s*=/);
});
