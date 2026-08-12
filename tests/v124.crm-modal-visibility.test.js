const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const html = fs.readFileSync('public/index.html', 'utf8');
const css = fs.readFileSync('public/css/crm-premium.css', 'utf8');
const js = fs.readFileSync('public/js/crm-premium.js', 'utf8');

test('CRM modal is a single closed dialog and hidden until opened', () => {
  const matches = html.match(/<dialog[^>]*id="crmModal"[^>]*>/g) || [];
  assert.equal(matches.length, 1);
  assert.match(css, /#crmModal\.crm-modal:not\(\[open\]\)\s*\{[^}]*display:\s*none\s*!important/s);
  assert.match(css, /#crmModal\.crm-modal\[open\]\s*\{/);
});

test('CRM modal open flow closes an existing instance before showModal', () => {
  assert.match(js, /if\(m\.open\)m\.close\(\)/);
  assert.match(js, /m\.showModal\(\)/);
});
