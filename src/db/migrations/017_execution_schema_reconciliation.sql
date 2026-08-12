-- G3Soft Growth OS v1.0.14 — execution schema reconciliation.
-- Additive/idempotent repair for databases that have partially-created execution tables.
-- Never drops, truncates or resets production data.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_type VARCHAR(40);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable TEXT;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_status VARCHAR(20);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_submitted_at TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deliverable_submitted_by UUID;
UPDATE tasks SET execution_type='GENERAL' WHERE execution_type IS NULL OR trim(execution_type)='';
UPDATE tasks SET deliverable_status='DRAFT' WHERE deliverable_status IS NULL OR trim(deliverable_status)='';
ALTER TABLE tasks ALTER COLUMN execution_type SET DEFAULT 'GENERAL';
ALTER TABLE tasks ALTER COLUMN execution_type SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN deliverable_status SET DEFAULT 'DRAFT';
ALTER TABLE tasks ALTER COLUMN deliverable_status SET NOT NULL;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_execution_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_execution_type_check CHECK (execution_type IN ('GENERAL','LANDING_PAGE','CONTENT','PAID_MEDIA','SEO','CRM','ANALYTICS','AUTOMATION','SALES'));
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_deliverable_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_deliverable_status_check CHECK (deliverable_status IN ('DRAFT','SUBMITTED','APPROVED','REJECTED'));

CREATE TABLE IF NOT EXISTS task_acceptance_criteria (
 id UUID PRIMARY KEY, task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, title VARCHAR(220) NOT NULL,
 description TEXT, required BOOLEAN NOT NULL DEFAULT TRUE, is_complete BOOLEAN NOT NULL DEFAULT FALSE,
 completed_by UUID REFERENCES users(id), completed_at TIMESTAMPTZ, position INT NOT NULL DEFAULT 0, system_key VARCHAR(80),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS required BOOLEAN;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS is_complete BOOLEAN;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS completed_by UUID;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS position INT;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS system_key VARCHAR(80);
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
ALTER TABLE task_acceptance_criteria ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ;
UPDATE task_acceptance_criteria SET required=TRUE WHERE required IS NULL;
UPDATE task_acceptance_criteria SET is_complete=FALSE WHERE is_complete IS NULL;
UPDATE task_acceptance_criteria SET position=0 WHERE position IS NULL;
UPDATE task_acceptance_criteria SET created_at=NOW() WHERE created_at IS NULL;
UPDATE task_acceptance_criteria SET updated_at=NOW() WHERE updated_at IS NULL;
ALTER TABLE task_acceptance_criteria ALTER COLUMN required SET DEFAULT TRUE;
ALTER TABLE task_acceptance_criteria ALTER COLUMN required SET NOT NULL;
ALTER TABLE task_acceptance_criteria ALTER COLUMN is_complete SET DEFAULT FALSE;
ALTER TABLE task_acceptance_criteria ALTER COLUMN is_complete SET NOT NULL;
ALTER TABLE task_acceptance_criteria ALTER COLUMN position SET DEFAULT 0;
ALTER TABLE task_acceptance_criteria ALTER COLUMN position SET NOT NULL;
ALTER TABLE task_acceptance_criteria ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE task_acceptance_criteria ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE task_acceptance_criteria ALTER COLUMN updated_at SET DEFAULT NOW();
ALTER TABLE task_acceptance_criteria ALTER COLUMN updated_at SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_acceptance_task ON task_acceptance_criteria(task_id, position, created_at);

CREATE TABLE IF NOT EXISTS task_evidence (
 id UUID PRIMARY KEY, task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, user_id UUID REFERENCES users(id),
 evidence_type VARCHAR(20) NOT NULL DEFAULT 'LINK', title VARCHAR(220) NOT NULL, url TEXT, description TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS user_id UUID;
ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS evidence_type VARCHAR(20);
ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS title VARCHAR(220);
ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE task_evidence ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
UPDATE task_evidence SET evidence_type='LINK' WHERE evidence_type IS NULL OR trim(evidence_type)='';
UPDATE task_evidence SET title='Evidência' WHERE title IS NULL OR trim(title)='';
UPDATE task_evidence SET created_at=NOW() WHERE created_at IS NULL;
ALTER TABLE task_evidence ALTER COLUMN evidence_type SET DEFAULT 'LINK';
ALTER TABLE task_evidence ALTER COLUMN evidence_type SET NOT NULL;
ALTER TABLE task_evidence ALTER COLUMN title SET NOT NULL;
ALTER TABLE task_evidence ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE task_evidence ALTER COLUMN created_at SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_evidence_task ON task_evidence(task_id, created_at DESC);

CREATE TABLE IF NOT EXISTS task_evidence_requirements (
 id UUID PRIMARY KEY, task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE, evidence_type VARCHAR(20) NOT NULL,
 min_count INT NOT NULL DEFAULT 1, label VARCHAR(220) NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE task_evidence_requirements ADD COLUMN IF NOT EXISTS evidence_type VARCHAR(20);
ALTER TABLE task_evidence_requirements ADD COLUMN IF NOT EXISTS min_count INT;
ALTER TABLE task_evidence_requirements ADD COLUMN IF NOT EXISTS label VARCHAR(220);
ALTER TABLE task_evidence_requirements ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;
UPDATE task_evidence_requirements SET evidence_type='NOTE' WHERE evidence_type IS NULL OR trim(evidence_type)='';
UPDATE task_evidence_requirements SET min_count=1 WHERE min_count IS NULL OR min_count<1;
UPDATE task_evidence_requirements SET label='Registro de execução' WHERE label IS NULL OR trim(label)='';
UPDATE task_evidence_requirements SET created_at=NOW() WHERE created_at IS NULL;
ALTER TABLE task_evidence_requirements ALTER COLUMN evidence_type SET NOT NULL;
ALTER TABLE task_evidence_requirements ALTER COLUMN min_count SET DEFAULT 1;
ALTER TABLE task_evidence_requirements ALTER COLUMN min_count SET NOT NULL;
ALTER TABLE task_evidence_requirements ALTER COLUMN label SET NOT NULL;
ALTER TABLE task_evidence_requirements ALTER COLUMN created_at SET DEFAULT NOW();
ALTER TABLE task_evidence_requirements ALTER COLUMN created_at SET NOT NULL;
CREATE INDEX IF NOT EXISTS idx_task_evidence_requirements_task ON task_evidence_requirements(task_id,evidence_type);

-- Ensure every task has the deterministic baseline required by Approval Readiness.
INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position,system_key)
SELECT gen_random_uuid(),t.id,'Microtarefas obrigatórias concluídas','Todas as microtarefas necessárias para a execução estão concluídas.',TRUE,0,'MICROTASKS_COMPLETE'
FROM tasks t WHERE NOT EXISTS (SELECT 1 FROM task_acceptance_criteria c WHERE c.task_id=t.id AND c.system_key='MICROTASKS_COMPLETE');
INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position,system_key)
SELECT gen_random_uuid(),t.id,'Entregável registrado','O resultado efetivamente entregue está documentado na seção Entregável.',TRUE,1,'DELIVERABLE_PRESENT'
FROM tasks t WHERE NOT EXISTS (SELECT 1 FROM task_acceptance_criteria c WHERE c.task_id=t.id AND c.system_key='DELIVERABLE_PRESENT');
INSERT INTO task_evidence_requirements(id,task_id,evidence_type,min_count,label)
SELECT gen_random_uuid(),t.id,'NOTE',1,'Registro de execução'
FROM tasks t WHERE NOT EXISTS (SELECT 1 FROM task_evidence_requirements r WHERE r.task_id=t.id AND r.evidence_type='NOTE');
