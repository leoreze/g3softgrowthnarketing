-- v0.9.0 — Automation + Notifications. Additive and idempotent.
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(40) NOT NULL CHECK(trigger_type IN ('TASK_DUE','APPROVAL_PENDING','CONTENT_SCHEDULED','CAMPAIGN_START','TASK_OVERDUE')),
  action_type VARCHAR(40) NOT NULL CHECK(action_type IN ('IN_APP_NOTIFICATION')),
  conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK(length(trim(name)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_automation_rules_active ON automation_rules(is_active,trigger_type);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(40) NOT NULL CHECK(type IN ('AUTOMATION','APPROVAL','TASK','CONTENT','SYSTEM')),
  title VARCHAR(220) NOT NULL,
  message TEXT NOT NULL,
  entity_type VARCHAR(40),
  entity_id UUID,
  action_url VARCHAR(500),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, type, entity_type, entity_id, title)
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id,read_at,created_at DESC);

CREATE TABLE IF NOT EXISTS automation_runs (
  id UUID PRIMARY KEY,
  rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  trigger_key VARCHAR(220) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK(status IN ('SUCCESS','SKIPPED','FAILED')),
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rule_id,trigger_key)
);
CREATE INDEX IF NOT EXISTS idx_automation_runs_rule_ran ON automation_runs(rule_id,ran_at DESC);

INSERT INTO automation_rules(id,name,description,trigger_type,action_type,conditions,action_config)
SELECT gen_random_uuid(),'Aprovação pendente','Notifica o responsável quando uma aprovação permanece pendente.','APPROVAL_PENDING','IN_APP_NOTIFICATION','{}','{"recipient":"REQUESTED_BY","title":"Aprovação pendente"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM automation_rules WHERE lower(name)=lower('Aprovação pendente'));
INSERT INTO automation_rules(id,name,description,trigger_type,action_type,conditions,action_config)
SELECT gen_random_uuid(),'Tarefa vencendo','Notifica o responsável sobre tarefas com prazo hoje.','TASK_DUE','IN_APP_NOTIFICATION','{}','{"recipient":"ASSIGNEE","title":"Tarefa com prazo hoje"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM automation_rules WHERE lower(name)=lower('Tarefa vencendo'));
