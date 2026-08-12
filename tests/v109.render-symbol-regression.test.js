const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const js = fs.readFileSync(path.join(__dirname, '..', 'public', 'js', 'app.js'), 'utf8');

test('v1.0.9 render dispatcher has every referenced renderer', () => {
  for (const fn of ['renderOverview','renderPhases','renderKanban','renderTasks','renderCalendar','renderApprovals','renderWorkflows','renderCampaigns','renderContent','renderAnalytics','renderAutomations']) {
    assert.match(js, new RegExp('function\\s+' + fn + '\\s*\\('));
  }
});

test('v1.0.9 restores shared functions required by rendered views', () => {
  for (const fn of ['calendarEvent','calendarControls','calendarRange','calendarTitle','allCalendarItems','itemsForDate','newCalendarEvent','openContentModal','newAutomation']) {
    assert.match(js, new RegExp('function\\s+' + fn + '\\s*\\('));
  }
});
