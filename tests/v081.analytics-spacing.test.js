import fs from 'node:fs';
import assert from 'node:assert/strict';

const css = fs.readFileSync('public/css/app.css', 'utf8');
const app = fs.readFileSync('public/js/app.js', 'utf8');

assert.match(css, /\.analytics-channels\{margin-top:20px\}/);
assert.match(app, /<section class="panel analytics-channels">/);
console.log('v0.8.1 analytics channels spacing PASS');
