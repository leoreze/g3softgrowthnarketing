CREATE TABLE IF NOT EXISTS task_subtasks (
 id UUID PRIMARY KEY,
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 title VARCHAR(220) NOT NULL,
 is_done BOOLEAN NOT NULL DEFAULT FALSE,
 position INT NOT NULL DEFAULT 0 CHECK(position >= 0),
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_subtasks_task ON task_subtasks(task_id, position, created_at);

CREATE TABLE IF NOT EXISTS task_comments (
 id UUID PRIMARY KEY,
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id),
 body TEXT NOT NULL CHECK(length(trim(body)) > 0 AND length(body) <= 4000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id, created_at DESC);

CREATE TABLE IF NOT EXISTS tags (
 id UUID PRIMARY KEY,
 name VARCHAR(60) UNIQUE NOT NULL,
 color VARCHAR(20) NOT NULL DEFAULT '#FF8A00',
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS task_tags (
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
 PRIMARY KEY(task_id, tag_id)
);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id, task_id);

CREATE TABLE IF NOT EXISTS task_dependencies (
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 depends_on_task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 PRIMARY KEY(task_id, depends_on_task_id),
 CHECK(task_id <> depends_on_task_id)
);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_source ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_target ON task_dependencies(depends_on_task_id);

CREATE TABLE IF NOT EXISTS task_time_entries (
 id UUID PRIMARY KEY,
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id),
 hours NUMERIC(8,2) NOT NULL CHECK(hours > 0 AND hours <= 24),
 note VARCHAR(500),
 logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_time_entries_task ON task_time_entries(task_id, logged_at DESC);

CREATE TABLE IF NOT EXISTS task_attachments (
 id UUID PRIMARY KEY,
 task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
 user_id UUID REFERENCES users(id),
 name VARCHAR(220) NOT NULL,
 url TEXT NOT NULL CHECK(length(url) <= 2000),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id, created_at DESC);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS estimated_hours NUMERIC(8,2) CHECK(estimated_hours IS NULL OR estimated_hours >= 0);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS blocked_reason VARCHAR(1000);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(phase_id, status, position, due_date);
