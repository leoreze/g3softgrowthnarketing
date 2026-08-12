CREATE TABLE IF NOT EXISTS approval_requests (
 id UUID PRIMARY KEY,
 entity VARCHAR(60) NOT NULL,
 entity_id UUID NOT NULL,
 workflow VARCHAR(80) NOT NULL DEFAULT 'TASK_STANDARD',
 status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED','CANCELLED')),
 version INT NOT NULL DEFAULT 1 CHECK(version > 0),
 requested_by UUID REFERENCES users(id),
 requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 resolved_at TIMESTAMPTZ,
 resolved_by UUID REFERENCES users(id),
 resolution_note TEXT
);
CREATE INDEX IF NOT EXISTS idx_approval_requests_entity ON approval_requests(entity,entity_id,requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON approval_requests(status,requested_at DESC);

CREATE TABLE IF NOT EXISTS approval_steps (
 id UUID PRIMARY KEY,
 request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
 step_order INT NOT NULL CHECK(step_order > 0),
 approver_role VARCHAR(20) CHECK(approver_role IN ('ADMIN','STAKEHOLDER','MANAGER','USER')),
 approver_user_id UUID REFERENCES users(id),
 status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','APPROVED','REJECTED','SKIPPED')),
 decision_note TEXT,
 decided_by UUID REFERENCES users(id),
 decided_at TIMESTAMPTZ,
 UNIQUE(request_id,step_order)
);
CREATE INDEX IF NOT EXISTS idx_approval_steps_pending ON approval_steps(status,step_order);

CREATE TABLE IF NOT EXISTS approval_decisions (
 id UUID PRIMARY KEY,
 request_id UUID NOT NULL REFERENCES approval_requests(id) ON DELETE CASCADE,
 step_id UUID NOT NULL REFERENCES approval_steps(id) ON DELETE CASCADE,
 decision VARCHAR(20) NOT NULL CHECK(decision IN ('APPROVED','REJECTED')),
 decided_by UUID REFERENCES users(id),
 comment TEXT,
 entity_version INT NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_approval_decisions_request ON approval_decisions(request_id,created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS uq_open_approval_entity ON approval_requests(entity,entity_id) WHERE status='PENDING';
