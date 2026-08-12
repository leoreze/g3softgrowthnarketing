const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v0.6.0 professional calendar migration is additive and indexed',()=>{
 const sql=fs.readFileSync(path.join(root,'src/db/migrations/009_professional_calendar.sql'),'utf8');
 assert.match(sql,/CREATE TABLE IF NOT EXISTS calendar_events/);
 assert.match(sql,/CREATE INDEX IF NOT EXISTS idx_calendar_events_start_end/);
 assert.doesNotMatch(sql,/DROP DATABASE|DROP SCHEMA|TRUNCATE|DROP TABLE/i);
});

test('v0.6.0 calendar events API enforces server-side roles and audit',()=>{
 const route=fs.readFileSync(path.join(root,'src/routes/calendar-events.js'),'utf8');
 assert.match(route,/requireRole\('ADMIN','MANAGER'\)/);
 assert.match(route,/calendar_event/);
 assert.match(route,/dateTime/);
 assert.match(route,/oneOf/);
 assert.match(route,/await audit/);
});

test('v0.6.0 professional calendar frontend supports native events, filters and rescheduling',()=>{
 const js=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
 assert.match(js,/calendarEvents/);
 assert.match(js,/\/api\/calendar-events/);
 assert.match(js,/MEETING/);
 assert.match(js,/data-new-event-date/);
 assert.match(js,/data-calendar-kind/);
 assert.match(js,/renderCalendarMonth/);
 assert.match(js,/renderCalendarWeek/);
 assert.match(js,/renderCalendarDay/);
 assert.match(js,/renderCalendarAgenda/);
});

test('v0.6.0 calendar route keeps existing task filters without duplicated phase predicate',()=>{
 const route=fs.readFileSync(path.join(root,'src/routes/calendar.js'),'utf8');
 const matches=route.match(/t\.phase_id=\$\{values\.length\}/g)||[];
 assert.equal(matches.length,0);
 assert.match(route,/phase_id/);
 assert.match(route,/router\.patch\('\/:id\/reschedule'/);
});
