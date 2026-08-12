const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');

test('v1.0.15 task details evidence query joins the evidence user alias', () => {
  const s = fs.readFileSync(path.join(root, 'src/routes/tasks.js'), 'utf8');
  assert.match(s, /SELECT e\.\*,u\.name user_name FROM task_evidence e LEFT JOIN users u ON u\.id=e\.user_id/);
});

test('v1.0.15 task details no longer references an unbound evidence user alias', () => {
  const s = fs.readFileSync(path.join(root, 'src/routes/tasks.js'), 'utf8');
  assert.doesNotMatch(s, /SELECT e\.\*,u\.name user_name FROM task_evidence e WHERE e\.task_id=/);
});
