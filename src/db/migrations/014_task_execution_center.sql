-- G3Soft Growth OS v1.0.3 — Task Execution Center
-- Additive/idempotent. Extends task execution with evidence, deliverable state and collaboration.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_submitted_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_submitted_by UUID REFERENCES users(id);
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_deliverable_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_deliverable_status_check CHECK (deliverable_status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED'));

CREATE TABLE IF NOT EXISTS task_evidence (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  evidence_type VARCHAR(20) NOT NULL DEFAULT 'LINK',
  title VARCHAR(220) NOT NULL,
  url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (evidence_type IN ('LINK','NOTE','IMAGE','DOCUMENT')),
  CHECK (length(trim(title)) > 0),
  CHECK (url IS NULL OR length(url) <= 2000)
);
CREATE INDEX IF NOT EXISTS idx_task_evidence_task ON task_evidence(task_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tasks_deliverable_status ON tasks(deliverable_status, updated_at DESC);
