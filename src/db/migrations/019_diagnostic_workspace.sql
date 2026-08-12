ALTER TABLE growth_diagnostics
  DROP CONSTRAINT IF EXISTS growth_diagnostics_campaign_id_key;

ALTER TABLE growth_diagnostics
  ALTER COLUMN campaign_id DROP NOT NULL;

ALTER TABLE growth_diagnostics
  ADD COLUMN IF NOT EXISTS analysis_type VARCHAR(40) NOT NULL DEFAULT 'COMPLETO',
  ADD COLUMN IF NOT EXISTS period_start DATE,
  ADD COLUMN IF NOT EXISTS period_end DATE,
  ADD COLUMN IF NOT EXISTS objective TEXT,
  ADD COLUMN IF NOT EXISTS confidence_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS snapshot_locked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS growth_diagnostic_sources (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  source_type VARCHAR(40) NOT NULL CHECK (source_type IN ('WEBSITE','PAGE','LANDING_PAGE','SOCIAL','GOOGLE_BUSINESS','SEO','GOOGLE_ADS','META_ADS','LINKEDIN_ADS','YOUTUBE','CRM','ANALYTICS','COMPETITOR','PRODUCT','ICP','PERSONA','OTHER')),
  name VARCHAR(220) NOT NULL,
  url TEXT,
  objective TEXT,
  audience TEXT,
  platform VARCHAR(80),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_diagnostic_metrics (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  source_id UUID REFERENCES growth_diagnostic_sources(id) ON DELETE SET NULL,
  metric_key VARCHAR(100) NOT NULL,
  metric_name VARCHAR(180) NOT NULL,
  value_numeric NUMERIC(18,4),
  value_text TEXT,
  unit VARCHAR(40),
  period_start DATE,
  period_end DATE,
  evidence_id UUID,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_diagnostic_evidences (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES growth_diagnostic_assessments(id) ON DELETE SET NULL,
  source_id UUID REFERENCES growth_diagnostic_sources(id) ON DELETE SET NULL,
  evidence_type VARCHAR(30) NOT NULL DEFAULT 'URL' CHECK (evidence_type IN ('URL','SCREENSHOT','PDF','CSV','XLSX','DOCUMENT','NOTE')),
  title VARCHAR(220) NOT NULL,
  url TEXT,
  description TEXT,
  captured_at TIMESTAMPTZ,
  validated BOOLEAN NOT NULL DEFAULT FALSE,
  validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  validated_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE growth_diagnostic_metrics
  ADD CONSTRAINT fk_growth_metric_evidence FOREIGN KEY (evidence_id) REFERENCES growth_diagnostic_evidences(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS growth_diagnostic_reviews (
  id UUID PRIMARY KEY,
  diagnostic_id UUID NOT NULL REFERENCES growth_diagnostics(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE','APROVADO','DEVOLVIDO')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_diag_sources_diag ON growth_diagnostic_sources(diagnostic_id, source_type);
CREATE INDEX IF NOT EXISTS idx_growth_diag_metrics_diag ON growth_diagnostic_metrics(diagnostic_id, metric_key);
CREATE INDEX IF NOT EXISTS idx_growth_diag_evidence_diag ON growth_diagnostic_evidences(diagnostic_id, validated);
CREATE INDEX IF NOT EXISTS idx_growth_diag_reviews_diag ON growth_diagnostic_reviews(diagnostic_id, created_at DESC);
