const test = require('node:test');
const assert = require('node:assert/strict');
const { roadmap } = require('../src/db/seed-roadmap');

test('v1.0.1 roadmap seed contains the six 180-day phases', () => {
  assert.equal(roadmap.length, 6);
  assert.deepEqual(roadmap.map(p => p.name), ['Fundação','Conversão','Aquisição','Otimização','Automação','Escala']);
});

test('v1.0.1 roadmap seed converts principal activities into microtasks', () => {
  const activities = roadmap.flatMap(p => p.activities);
  assert.equal(activities.length, 35);
  for (const [, , microtasks] of activities) {
    assert.ok(Array.isArray(microtasks));
    assert.ok(microtasks.length >= 4);
  }
  const microtaskTotal = activities.reduce((n, [, , microtasks]) => n + microtasks.length, 0);
  assert.equal(microtaskTotal, 175);
});

test('v1.0.1 roadmap seed preserves 180-day phase objectives and dates', () => {
  assert.equal(roadmap[0].start, '2026-08-17');
  assert.equal(roadmap[0].end, '2026-09-15');
  assert.equal(roadmap[5].start, '2027-01-14');
  assert.equal(roadmap[5].end, '2027-02-12');
  assert.match(roadmap[0].objective, /base sólida/i);
  assert.match(roadmap[5].objective, /Escalar/i);
});

test('v1.0.1 production roadmap migration is additive and append-only', () => {
  const fs = require('fs');
  const path = require('path');
  const root = path.resolve(__dirname, '..');
  const migration = fs.readFileSync(path.join(root, 'src/db/migrations/012_roadmap_180_days.sql'), 'utf8');
  assert.match(migration, /DO \$\$/);
  assert.match(migration, /task_subtasks/);
  assert.match(migration, /ON CONFLICT\(campaign_id,phase_order\)/);
  assert.doesNotMatch(migration, /DROP\s+(TABLE|SCHEMA|DATABASE)/i);
  const migrations=fs.readdirSync(path.join(root,'src/db/migrations')).filter(f => f.endsWith('.sql')).sort(); assert.ok(migrations.includes('013_task_execution_deliverables.sql')); assert.equal(migrations.at(-1), '020_crm_foundation.sql'); assert.ok(migrations.includes('014_task_execution_center.sql'));
});
