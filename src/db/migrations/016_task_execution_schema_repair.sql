-- G3Soft Growth OS v1.0.13 — additive repair for partially-applied execution schema.
-- Safe to run after 014/015 or when schema_migrations recorded a version
-- but one or more execution objects are missing. Never drops or truncates data.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_status VARCHAR(20) NOT NULL DEFAULT 'DRAFT';
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_submitted_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_submitted_by UUID REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_type VARCHAR(40) NOT NULL DEFAULT 'GENERAL';

ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_deliverable_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_deliverable_status_check CHECK (deliverable_status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED'));
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_execution_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_execution_type_check CHECK (execution_type IN ('GENERAL','LANDING_PAGE','CONTENT','PAID_MEDIA','SEO','CRM','ANALYTICS','AUTOMATION','SALES'));

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

CREATE TABLE IF NOT EXISTS task_acceptance_criteria (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(220) NOT NULL,
  description TEXT,
  required BOOLEAN NOT NULL DEFAULT TRUE,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  completed_by UUID REFERENCES users(id),
  completed_at TIMESTAMPTZ,
  position INT NOT NULL DEFAULT 0 CHECK(position >= 0),
  system_key VARCHAR(80),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id,title),
  UNIQUE(task_id,system_key),
  CHECK(length(trim(title)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_task_acceptance_task ON task_acceptance_criteria(task_id, position, created_at);

CREATE TABLE IF NOT EXISTS task_evidence_requirements (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  evidence_type VARCHAR(20) NOT NULL,
  min_count INT NOT NULL DEFAULT 1 CHECK(min_count > 0 AND min_count <= 20),
  label VARCHAR(220) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(task_id,evidence_type),
  CHECK(evidence_type IN ('LINK','NOTE','IMAGE','DOCUMENT')),
  CHECK(length(trim(label)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_task_evidence_requirements_task ON task_evidence_requirements(task_id,evidence_type);

-- Backfill only missing execution metadata. Existing task content is preserved.
UPDATE tasks SET execution_type='GENERAL' WHERE execution_type IS NULL OR execution_type='';

-- Ensure every existing task has the minimum deterministic acceptance model.
INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position,system_key)
SELECT gen_random_uuid(),t.id,'Microtarefas obrigatórias concluídas','Todas as microtarefas necessárias para a execução estão concluídas.',TRUE,0,'MICROTASKS_COMPLETE'
FROM tasks t
WHERE NOT EXISTS (SELECT 1 FROM task_acceptance_criteria c WHERE c.task_id=t.id AND c.system_key='MICROTASKS_COMPLETE');

INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position,system_key)
SELECT gen_random_uuid(),t.id,'Entregável registrado','O resultado efetivamente entregue está documentado na seção Entregável.',TRUE,1,'DELIVERABLE_PRESENT'
FROM tasks t
WHERE NOT EXISTS (SELECT 1 FROM task_acceptance_criteria c WHERE c.task_id=t.id AND c.system_key='DELIVERABLE_PRESENT');

INSERT INTO task_evidence_requirements(id,task_id,evidence_type,min_count,label)
SELECT gen_random_uuid(),t.id,'NOTE',1,'Registro de execução'
FROM tasks t
WHERE NOT EXISTS (SELECT 1 FROM task_evidence_requirements r WHERE r.task_id=t.id AND r.evidence_type='NOTE');
