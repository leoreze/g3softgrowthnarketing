-- v1.0.28 — Growth Relationship Center operational foundation
-- Additive/idempotent. No RESET, DROP, TRUNCATE or destructive data operation.

CREATE TABLE IF NOT EXISTS relationship_modules (
  id UUID PRIMARY KEY,
  module_key VARCHAR(80) NOT NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  icon_key VARCHAR(40) NOT NULL DEFAULT 'spark',
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relationship_signals (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  module_key VARCHAR(80) NOT NULL,
  signal_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
  title VARCHAR(220) NOT NULL,
  description TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS relationship_experience_events (
  id UUID PRIMARY KEY,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  score INT CHECK(score BETWEEN 0 AND 10),
  category VARCHAR(30),
  feedback TEXT,
  action_status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relationship_conversations (
  id UUID PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  channel VARCHAR(40) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  subject VARCHAR(220),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sla_due_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_relationship_signals_status ON relationship_signals(status,module_key,severity);
CREATE INDEX IF NOT EXISTS idx_relationship_experience_score ON relationship_experience_events(score,action_status);
CREATE INDEX IF NOT EXISTS idx_relationship_conversations_status ON relationship_conversations(status,priority,sla_due_at);

INSERT INTO relationship_modules(id,module_key,name,description,icon_key,sort_order)
VALUES
(gen_random_uuid(),'SERVICE','Central de Atendimento','Inbox, SLA e histórico de conversas','inbox',1),
(gen_random_uuid(),'INTELLIGENCE','Inteligência Operacional','Sinais de intenção, inatividade e pipeline','pulse',2),
(gen_random_uuid(),'COMMERCIAL_AUTOMATION','Automação Comercial','Lead → MQL → SQL → Demo → Proposta','automation',3),
(gen_random_uuid(),'GROWTH','Fidelidade e Crescimento','Expansão, indicação e reativação','growth',4),
(gen_random_uuid(),'EXPERIENCE','Experiência e NPS','NPS, feedback e ações de experiência','heart',5),
(gen_random_uuid(),'MARKETING_CRM','CRM & Marketing','Segmentação, scoring, campanhas e tracking','target',6),
(gen_random_uuid(),'COMMUNICATION','Comunicação','Distribuição e governança de conteúdo e mensagens','broadcast',7)
ON CONFLICT(module_key) DO UPDATE SET name=EXCLUDED.name,description=EXCLUDED.description,icon_key=EXCLUDED.icon_key,sort_order=EXCLUDED.sort_order,updated_at=NOW();

