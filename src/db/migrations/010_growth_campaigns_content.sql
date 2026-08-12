-- v0.7.0 — Growth Campaigns + Content Planner. Non-destructive.
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS objective TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS budget_cents BIGINT NOT NULL DEFAULT 0 CHECK (budget_cents >= 0);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS target_segment VARCHAR(160);
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS landing_page_url VARCHAR(500);

CREATE TABLE IF NOT EXISTS campaign_channels (
 id UUID PRIMARY KEY, campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
 channel VARCHAR(30) NOT NULL CHECK(channel IN ('SEO','GOOGLE_ADS','META_ADS','YOUTUBE','LINKEDIN','EMAIL','WHATSAPP','ORGANIC','REFERRAL','PARTNERSHIP')),
 budget_cents BIGINT NOT NULL DEFAULT 0 CHECK(budget_cents >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(campaign_id,channel)
);
CREATE INDEX IF NOT EXISTS idx_campaign_channels_campaign ON campaign_channels(campaign_id);

CREATE TABLE IF NOT EXISTS content_items (
 id UUID PRIMARY KEY, campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL, phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
 task_id UUID REFERENCES tasks(id) ON DELETE SET NULL, calendar_event_id UUID REFERENCES calendar_events(id) ON DELETE SET NULL,
 title VARCHAR(220) NOT NULL, format VARCHAR(30) NOT NULL CHECK(format IN ('BLOG','INSTAGRAM','FACEBOOK','LINKEDIN','YOUTUBE','REELS','SHORTS','EMAIL','WHATSAPP')),
 channel VARCHAR(30) NOT NULL CHECK(channel IN ('SEO','GOOGLE_ADS','META_ADS','YOUTUBE','LINKEDIN','EMAIL','WHATSAPP','ORGANIC','REFERRAL','PARTNERSHIP')),
 status VARCHAR(30) NOT NULL DEFAULT 'IDEA' CHECK(status IN ('IDEA','BRIEF','PRODUCTION','REVIEW','PENDING_APPROVAL','APPROVED','SCHEDULED','PUBLISHED','REJECTED')),
 copy TEXT, cta VARCHAR(300), scheduled_at TIMESTAMPTZ, owner_id UUID REFERENCES users(id) ON DELETE SET NULL, created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(length(trim(title)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_content_campaign_status ON content_items(campaign_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_phase ON content_items(phase_id,status);
CREATE INDEX IF NOT EXISTS idx_content_calendar ON content_items(calendar_event_id);
CREATE INDEX IF NOT EXISTS idx_content_schedule ON content_items(scheduled_at,status);

ALTER TABLE workflow_definitions DROP CONSTRAINT IF EXISTS workflow_definitions_entity_type_check;
ALTER TABLE workflow_definitions ADD CONSTRAINT workflow_definitions_entity_type_check CHECK(entity_type IN ('TASK','CAMPAIGN','CONTENT'));

INSERT INTO workflow_definitions(id,name,entity_type,description,status)
SELECT gen_random_uuid(),'Content Standard','CONTENT','Fluxo padrão: produção, revisão e aprovação de conteúdo.','ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM workflow_definitions WHERE entity_type='CONTENT' AND lower(name)=lower('Content Standard'));
INSERT INTO workflow_definition_steps(id,workflow_id,step_order,name,approver_role,required)
SELECT gen_random_uuid(),w.id,1,'Stakeholder','STAKEHOLDER',TRUE FROM workflow_definitions w
WHERE w.entity_type='CONTENT' AND lower(w.name)=lower('Content Standard')
AND NOT EXISTS (SELECT 1 FROM workflow_definition_steps s WHERE s.workflow_id=w.id);

ALTER TABLE calendar_events ADD COLUMN IF NOT EXISTS content_id UUID REFERENCES content_items(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_calendar_events_content ON calendar_events(content_id);
