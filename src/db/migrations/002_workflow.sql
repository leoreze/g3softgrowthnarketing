CREATE TABLE IF NOT EXISTS task_status_history (
 id UUID PRIMARY KEY, task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, changed_by UUID REFERENCES users(id), from_status VARCHAR(30), to_status VARCHAR(30) NOT NULL, note TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_status_history_task ON task_status_history(task_id,created_at DESC);
