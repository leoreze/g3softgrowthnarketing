-- G3Soft Growth OS v0.5.0
-- Workflow engine: reusable workflow definitions and ordered approval steps.
-- Non-destructive: CREATE TABLE/INDEX only. Existing approval history is preserved.

CREATE TABLE IF NOT EXISTS workflow_definitions (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  entity_type VARCHAR(30) NOT NULL CHECK(entity_type IN ('TASK','CAMPAIGN')),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('DRAFT','ACTIVE','ARCHIVED')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_workflow_active_entity_name
  ON workflow_definitions(entity_type, lower(name))
  WHERE status <> 'ARCHIVED';

CREATE INDEX IF NOT EXISTS idx_workflow_definitions_entity_status
  ON workflow_definitions(entity_type,status,created_at DESC);

CREATE TABLE IF NOT EXISTS workflow_definition_steps (
  id UUID PRIMARY KEY,
  workflow_id UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  step_order INT NOT NULL CHECK(step_order > 0),
  name VARCHAR(120) NOT NULL,
  approver_role VARCHAR(20) CHECK(approver_role IN ('ADMIN','STAKEHOLDER','MANAGER','USER')),
  approver_user_id UUID REFERENCES users(id),
  required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(workflow_id,step_order),
  CHECK (approver_role IS NOT NULL OR approver_user_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_workflow_definition_steps_workflow
  ON workflow_definition_steps(workflow_id,step_order);

-- Default workflows. These are templates only; each approval request receives
-- its own immutable approval_steps snapshot.
INSERT INTO workflow_definitions(id,name,entity_type,description,status)
SELECT gen_random_uuid(),'Task Standard','TASK','Fluxo padrão: revisor responsável seguido de stakeholder.','ACTIVE'
WHERE NOT EXISTS (
  SELECT 1 FROM workflow_definitions WHERE entity_type='TASK' AND lower(name)=lower('Task Standard')
);

INSERT INTO workflow_definitions(id,name,entity_type,description,status)
SELECT gen_random_uuid(),'Campaign Standard','CAMPAIGN','Fluxo padrão de aprovação de campanha antes da ativação.','ACTIVE'
WHERE NOT EXISTS (
  SELECT 1 FROM workflow_definitions WHERE entity_type='CAMPAIGN' AND lower(name)=lower('Campaign Standard')
);

INSERT INTO workflow_definition_steps(id,workflow_id,step_order,name,approver_role,required)
SELECT gen_random_uuid(),w.id,1,'Stakeholder','STAKEHOLDER',TRUE
FROM workflow_definitions w
WHERE w.entity_type='TASK' AND lower(w.name)=lower('Task Standard')
  AND NOT EXISTS (SELECT 1 FROM workflow_definition_steps s WHERE s.workflow_id=w.id);

INSERT INTO workflow_definition_steps(id,workflow_id,step_order,name,approver_role,required)
SELECT gen_random_uuid(),w.id,1,'Stakeholder','STAKEHOLDER',TRUE
FROM workflow_definitions w
WHERE w.entity_type='CAMPAIGN' AND lower(w.name)=lower('Campaign Standard')
  AND NOT EXISTS (SELECT 1 FROM workflow_definition_steps s WHERE s.workflow_id=w.id);

ALTER TABLE approval_requests
  ADD COLUMN IF NOT EXISTS workflow_definition_id UUID REFERENCES workflow_definitions(id);

CREATE INDEX IF NOT EXISTS idx_approval_requests_workflow_definition
  ON approval_requests(workflow_definition_id,requested_at DESC);
