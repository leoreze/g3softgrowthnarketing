const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v0.4.0 intelligent calendar migration adds non-destructive indexes',()=>{
  const sql=fs.readFileSync(path.join(root,'src/db/migrations/007_calendar_intelligence.sql'),'utf8');
  assert.match(sql,/CREATE INDEX IF NOT EXISTS idx_tasks_calendar_due_assignee/);
  assert.match(sql,/idx_tasks_calendar_due_priority/);
  assert.doesNotMatch(sql,/DROP TABLE|TRUNCATE|DROP DATABASE/i);
});

test('v0.4.0 calendar exposes filtered events, summary, reschedule and conflicts',()=>{
  const route=fs.readFileSync(path.join(root,'src/routes/calendar.js'),'utf8');
  assert.match(route,/router\.get\('\/'/);
  assert.match(route,/router\.get\('\/summary'/);
  assert.match(route,/router\.patch\('\/:id\/reschedule'/);
  assert.match(route,/router\.get\('\/:id\/conflicts'/);
  assert.match(route,/phase_id/);
  assert.match(route,/assignee_id/);
  assert.match(route,/priority/);
  assert.match(route,/overdue/);
});

test('v0.4.0 frontend supports month, week, day, agenda, filters and drag-drop rescheduling',()=>{
  const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  assert.match(js,/data-cal-mode="agenda"/);
  assert.match(js,/renderCalendarDay/);
  assert.match(js,/renderCalendarAgenda/);
  assert.match(js,/data-drop-date/);
  assert.match(js,/\/api\/calendar\/.*reschedule/);
  assert.match(js,/calOverdue/);
  assert.match(js,/calPhase/);
  assert.match(js,/calAssignee/);
});

test('v0.4.0 version is centralized',()=>{
  const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
  assert.match(pkg.version,/^(?:0\.(5\.0|6\.0|7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)$/);
  const release=fs.readFileSync(path.join(root,'docs/RELEASE-0.4.0.md'),'utf8');
  assert.match(release,/G3Soft Growth OS v0\.4\.0/);
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.match(html,/G3Soft Growth OS v(?:0\.(?:7\.[0-9]+|8\.[0-9]+|9\.0)|1\.0\.[0-9]+)/);
});
