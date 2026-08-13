-- v1.0.27 repair: Growth Calendar / Relationship Center
-- Safe/idempotent. Does not drop or reset data.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS growth_channel_plans (
  id UUID PRIMARY KEY,
  channel_key VARCHAR(60) NOT NULL UNIQUE,
  channel_name VARCHAR(180) NOT NULL,
  traffic_type VARCHAR(30) NOT NULL,
  role TEXT NOT NULL,
  cadence VARCHAR(180) NOT NULL,
  primary_goal TEXT NOT NULL,
  kpis JSONB NOT NULL DEFAULT '[]'::jsonb,
  content_formats JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_campaign_blueprints (
  id UUID PRIMARY KEY,
  campaign_key VARCHAR(120) NOT NULL UNIQUE,
  name VARCHAR(220) NOT NULL,
  month_no INT NOT NULL CHECK(month_no BETWEEN 1 AND 6),
  objective TEXT NOT NULL,
  funnel_stage VARCHAR(40) NOT NULL,
  audience TEXT NOT NULL,
  pain TEXT NOT NULL,
  message TEXT NOT NULL,
  offer TEXT NOT NULL,
  cta VARCHAR(220) NOT NULL,
  landing_page_key VARCHAR(160),
  channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  organic_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  paid_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  relationship_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_mix JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'READY',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS growth_calendar_items (
  id UUID PRIMARY KEY,
  month_no INT NOT NULL CHECK(month_no BETWEEN 1 AND 6),
  week_no INT NOT NULL CHECK(week_no BETWEEN 1 AND 26),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  theme VARCHAR(220) NOT NULL,
  campaign_key VARCHAR(120),
  funnel_stage VARCHAR(40) NOT NULL,
  primary_objective TEXT NOT NULL,
  offer VARCHAR(220),
  cta VARCHAR(220),
  channels JSONB NOT NULL DEFAULT '[]'::jsonb,
  deliverables JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(month_no,week_no)
);

CREATE TABLE IF NOT EXISTS relationship_playbooks (
  id UUID PRIMARY KEY,
  key VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  module VARCHAR(80) NOT NULL,
  trigger_type VARCHAR(80) NOT NULL,
  objective TEXT NOT NULL,
  channel VARCHAR(40) NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  guardrails JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_calendar_dates ON growth_calendar_items(start_date,end_date);
CREATE INDEX IF NOT EXISTS idx_growth_calendar_campaign ON growth_calendar_items(campaign_key);
