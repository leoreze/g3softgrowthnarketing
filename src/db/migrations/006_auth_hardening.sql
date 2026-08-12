-- v0.3.1 authentication hardening: normalized lookup and operational login metadata.
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON users (LOWER(email));
