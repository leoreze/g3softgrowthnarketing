-- v0.4.0 — Intelligent Calendar indexes. No destructive changes.
CREATE INDEX IF NOT EXISTS idx_tasks_calendar_due_assignee ON tasks(due_date, assignee_id, status);
CREATE INDEX IF NOT EXISTS idx_tasks_calendar_due_priority ON tasks(due_date, priority, status);
CREATE INDEX IF NOT EXISTS idx_tasks_calendar_phase_due ON tasks(phase_id, due_date, status);
CREATE INDEX IF NOT EXISTS idx_tasks_calendar_active_due ON tasks(due_date) WHERE status NOT IN ('DONE','APPROVED');
