const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

const approvals = fs.readFileSync('src/routes/approvals.js', 'utf8');
const workflows = fs.readFileSync('src/routes/workflows.js', 'utf8');

test('v0.7.2 approval/workflow JSON aggregations keep deterministic step ordering', () => {
  assert.match(approvals, /json_agg\(json_build_object\([\s\S]*?\) ORDER BY x\.step_order\)/);
  assert.match(workflows, /json_agg\(json_build_object\([\s\S]*?\) ORDER BY x\.step_order\)/);
  assert.doesNotMatch(approvals, /\)\) FROM approval_steps s WHERE s\.request_id=ar\.id ORDER BY s\.step_order/);
  assert.doesNotMatch(workflows, /\)\) FROM workflow_definition_steps s WHERE s\.workflow_id=w\.id ORDER BY s\.step_order/);
});
