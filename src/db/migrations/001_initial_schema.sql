CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
 id UUID PRIMARY KEY, name VARCHAR(120) NOT NULL, email VARCHAR(180) UNIQUE NOT NULL,
 password_hash TEXT NOT NULL, role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN','STAKEHOLDER','MANAGER','USER')),
 active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS campaigns (
 id UUID PRIMARY KEY, name VARCHAR(180) NOT NULL, description TEXT, status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK(status IN('DRAFT','ACTIVE','PAUSED','COMPLETED')),
 start_date DATE, end_date DATE, created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CHECK(end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE TABLE IF NOT EXISTS phases (
 id UUID PRIMARY KEY, campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE, phase_order INT NOT NULL CHECK(phase_order > 0),
 name VARCHAR(120) NOT NULL, short_name VARCHAR(80) NOT NULL, start_date DATE NOT NULL, end_date DATE NOT NULL,
 objective TEXT, status VARCHAR(20) NOT NULL DEFAULT 'PLANNED' CHECK(status IN('PLANNED','ACTIVE','COMPLETED','PAUSED')),
 color VARCHAR(20) NOT NULL DEFAULT '#FF8A00', created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(campaign_id,phase_order), CHECK(end_date >= start_date)
);
CREATE TABLE IF NOT EXISTS tasks (
 id UUID PRIMARY KEY, phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE, title VARCHAR(220) NOT NULL, description TEXT,
 status VARCHAR(30) NOT NULL DEFAULT 'BACKLOG' CHECK(status IN('BACKLOG','IN_PROGRESS','PENDING_APPROVAL','APPROVED','REJECTED','DONE','BLOCKED')),
 priority VARCHAR(15) NOT NULL DEFAULT 'MEDIUM' CHECK(priority IN('LOW','MEDIUM','HIGH','CRITICAL')),
 assignee_id UUID REFERENCES users(id), reviewer_id UUID REFERENCES users(id), due_date DATE, approval_note TEXT, rejection_note TEXT,
 created_by UUID REFERENCES users(id), created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS audit_logs (
 id UUID PRIMARY KEY, user_id UUID REFERENCES users(id), action VARCHAR(40) NOT NULL, entity VARCHAR(60) NOT NULL, entity_id UUID,
 before_data JSONB, after_data JSONB, ip INET, user_agent TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_phases_campaign ON phases(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tasks_phase ON tasks(phase_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity,entity_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id,created_at DESC);
