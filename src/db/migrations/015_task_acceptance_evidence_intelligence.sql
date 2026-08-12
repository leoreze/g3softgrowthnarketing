-- G3Soft Growth OS v1.0.6 — Execution Evidence & Approval Intelligence
-- Additive/idempotent. Formalizes acceptance criteria, evidence requirements and approval readiness.
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS execution_type VARCHAR(40) NOT NULL DEFAULT 'GENERAL';
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_execution_type_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_execution_type_check CHECK (execution_type IN ('GENERAL','LANDING_PAGE','CONTENT','PAID_MEDIA','SEO','CRM','ANALYTICS','AUTOMATION','SALES'));

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

-- Classify existing roadmap tasks without deleting or rewriting their content.
UPDATE tasks SET execution_type=CASE
  WHEN lower(title) ~ '(landing|formul[aá]rio|cta)' THEN 'LANDING_PAGE'
  WHEN lower(title) ~ '(conte[uú]do|youtube|reels|shorts|case|editorial)' THEN 'CONTENT'
  WHEN lower(title) ~ '(google ads|meta ads|campanha|retargeting|m[ií]dia paga)' THEN 'PAID_MEDIA'
  WHEN lower(title) ~ '(seo|search|org[aâ]nico)' THEN 'SEO'
  WHEN lower(title) ~ '(crm|lead|pipeline|processo comercial|vendas|sales)' THEN 'CRM'
  WHEN lower(title) ~ '(analytics|dashboard|cac|cpl|roas|m[eé]trica|kpi)' THEN 'ANALYTICS'
  WHEN lower(title) ~ '(automa[cç][aã]o|whatsapp|e-mail|email|nutri[cç][aã]o|ia para)' THEN 'AUTOMATION'
  WHEN lower(title) ~ '(oferta|precifica[cç][aã]o|indica[cç][aã]o)' THEN 'SALES'
  ELSE 'GENERAL'
END
WHERE execution_type='GENERAL';

-- Existing tasks receive a formal baseline acceptance model. Existing microtasks remain untouched.
INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position,system_key)
SELECT gen_random_uuid(),t.id,'Microtarefas obrigatórias concluídas','Todas as microtarefas necessárias para a execução estão concluídas.',TRUE,0,'MICROTASKS_COMPLETE'
FROM tasks t
WHERE NOT EXISTS (SELECT 1 FROM task_acceptance_criteria c WHERE c.task_id=t.id AND c.title='Microtarefas obrigatórias concluídas');

INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position,system_key)
SELECT gen_random_uuid(),t.id,'Entregável registrado','O resultado efetivamente entregue está documentado na seção Entregável.',TRUE,1,'DELIVERABLE_PRESENT'
FROM tasks t
WHERE NOT EXISTS (SELECT 1 FROM task_acceptance_criteria c WHERE c.task_id=t.id AND c.title='Entregável registrado');

INSERT INTO task_evidence_requirements(id,task_id,evidence_type,min_count,label)
SELECT gen_random_uuid(),t.id,'NOTE',1,'Registro de execução'
FROM tasks t
WHERE NOT EXISTS (SELECT 1 FROM task_evidence_requirements r WHERE r.task_id=t.id AND r.evidence_type='NOTE');

-- Type-specific minimum evidence is additive to the baseline NOTE requirement.
INSERT INTO task_evidence_requirements(id,task_id,evidence_type,min_count,label)
SELECT gen_random_uuid(),t.id,x.evidence_type,x.min_count,x.label
FROM tasks t
CROSS JOIN LATERAL (VALUES
  ('LANDING_PAGE','LINK',1,'URL publicada'),('LANDING_PAGE','IMAGE',1,'Screenshot da execução'),
  ('CONTENT','IMAGE',1,'Criativo final'),('CONTENT','DOCUMENT',1,'Material ou publicação'),
  ('PAID_MEDIA','IMAGE',1,'Screenshot da plataforma'),('PAID_MEDIA','LINK',1,'Campanha ou destino'),
  ('SEO','LINK',1,'Página auditada'),('SEO','DOCUMENT',1,'Relatório ou checklist SEO'),
  ('CRM','IMAGE',1,'Screenshot do CRM'),('CRM','NOTE',1,'Registro do teste ponta a ponta'),
  ('ANALYTICS','IMAGE',1,'Dashboard validado'),('ANALYTICS','DOCUMENT',1,'Plano de mensuração'),
  ('AUTOMATION','IMAGE',1,'Screenshot do fluxo'),('AUTOMATION','NOTE',1,'Resultado do teste'),
  ('SALES','NOTE',1,'Registro comercial'),('SALES','DOCUMENT',1,'Material ou proposta')
) AS x(task_type,evidence_type,min_count,label)
WHERE t.execution_type=x.task_type
  AND NOT EXISTS (SELECT 1 FROM task_evidence_requirements r WHERE r.task_id=t.id AND r.evidence_type=x.evidence_type);
