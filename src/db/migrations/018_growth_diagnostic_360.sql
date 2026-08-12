
CREATE TABLE IF NOT EXISTS growth_diagnostics (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name VARCHAR(220) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS'
    CHECK (status IN ('DRAFT','IN_PROGRESS','REVIEW','APPROVED','ARCHIVED')),
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  executive_summary TEXT,
  ai_summary TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id)
);

CREATE TABLE IF NOT EXISTS growth_diagnostic_assessments (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  dimension_key VARCHAR(60) NOT NULL,
  dimension_name VARCHAR(120) NOT NULL,
  criterion_key VARCHAR(100) NOT NULL,
  criterion_name VARCHAR(220) NOT NULL,
  weight NUMERIC(6,2) NOT NULL DEFAULT 1,
  score NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 5),
  status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE'
    CHECK (status IN ('PENDENTE','EM_ANALISE','VALIDADO')),
  evidence TEXT,
  notes TEXT,
  priority VARCHAR(20) NOT NULL DEFAULT 'P2'
    CHECK (priority IN ('P0','P1','P2','P3')),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(diagnostic_id, criterion_key)
);

CREATE TABLE IF NOT EXISTS growth_diagnostic_actions (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  title VARCHAR(300) NOT NULL,
  description TEXT,
  dimension_key VARCHAR(60),
  priority VARCHAR(20) NOT NULL DEFAULT 'P1'
    CHECK (priority IN ('P0','P1','P2','P3')),
  status VARCHAR(30) NOT NULL DEFAULT 'BACKLOG'
    CHECK (status IN ('BACKLOG','EM_EXECUCAO','CONCLUIDA','BLOQUEADA')),
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  source VARCHAR(30) NOT NULL DEFAULT 'DIAGNOSTICO',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_diagnostic_ai_messages (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_diag_assessments_diag
  ON growth_diagnostic_assessments(diagnostic_id);

CREATE INDEX IF NOT EXISTS idx_growth_diag_actions_diag
  ON growth_diagnostic_actions(diagnostic_id);

CREATE INDEX IF NOT EXISTS idx_growth_diag_ai_diag
  ON growth_diagnostic_ai_messages(diagnostic_id, created_at);

CREATE INDEX IF NOT EXISTS idx_growth_diag_assessments_dimension
  ON growth_diagnostic_assessments(diagnostic_id, dimension_key);
