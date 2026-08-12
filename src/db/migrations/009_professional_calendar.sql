-- v0.6.0 — Professional Calendar events. Non-destructive.
CREATE TABLE IF NOT EXISTS calendar_events (
 id UUID PRIMARY KEY,
 campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
 phase_id UUID REFERENCES phases(id) ON DELETE SET NULL,
 task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
 owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
 title VARCHAR(220) NOT NULL,
 description TEXT,
 event_type VARCHAR(30) NOT NULL DEFAULT 'OTHER' CHECK(event_type IN ('MEETING','DEMO','FOLLOW_UP','CAMPAIGN','DEADLINE','OTHER')),
 start_at TIMESTAMPTZ NOT NULL,
 end_at TIMESTAMPTZ,
 all_day BOOLEAN NOT NULL DEFAULT FALSE,
 location VARCHAR(300),
 status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK(status IN ('SCHEDULED','COMPLETED','CANCELLED')),
 created_by UUID REFERENCES users(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 CHECK(end_at IS NULL OR end_at >= start_at),
 CHECK(length(trim(title)) > 0)
);
CREATE INDEX IF NOT EXISTS idx_calendar_events_start_end ON calendar_events(start_at,end_at,status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_owner_start ON calendar_events(owner_id,start_at,status);
CREATE INDEX IF NOT EXISTS idx_calendar_events_campaign_start ON calendar_events(campaign_id,start_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_phase_start ON calendar_events(phase_id,start_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_task ON calendar_events(task_id);
