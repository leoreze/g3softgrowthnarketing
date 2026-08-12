CREATE TABLE IF NOT EXISTS companies (
 id UUID PRIMARY KEY,
 legal_name VARCHAR(220),
 trade_name VARCHAR(180) NOT NULL,
 document_number VARCHAR(30),
 industry VARCHAR(120),
 company_size VARCHAR(30),
 store_count INTEGER CHECK(store_count IS NULL OR (store_count >= 0 AND store_count <= 100000)),
 website TEXT,
 phone VARCHAR(40),
 whatsapp VARCHAR(40),
 email VARCHAR(180),
 address_line VARCHAR(220),
 city VARCHAR(120),
 state VARCHAR(2),
 postal_code VARCHAR(12),
 notes TEXT,
 status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE','PROSPECT','CUSTOMER')),
 owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contacts (
 id UUID PRIMARY KEY,
 company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
 name VARCHAR(180) NOT NULL,
 job_title VARCHAR(120),
 email VARCHAR(180),
 phone VARCHAR(40),
 whatsapp VARCHAR(40),
 role_type VARCHAR(30) CHECK(role_type IN ('DECISION_MAKER','INFLUENCER','USER','FINANCIAL','TECHNICAL','OTHER')),
 status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE','INACTIVE')),
 notes TEXT,
 owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_sources (
 id UUID PRIMARY KEY,
 name VARCHAR(120) NOT NULL UNIQUE,
 type VARCHAR(40) NOT NULL CHECK(type IN ('WEBSITE','LANDING_PAGE','GOOGLE_ORGANIC','GOOGLE_ADS','META_ADS','INSTAGRAM','FACEBOOK','LINKEDIN','YOUTUBE','WHATSAPP','REFERRAL','PARTNER','EVENT','OTHER')),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
 id UUID PRIMARY KEY,
 company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
 contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
 source_id UUID REFERENCES lead_sources(id) ON DELETE SET NULL,
 name VARCHAR(180) NOT NULL,
 email VARCHAR(180),
 phone VARCHAR(40),
 whatsapp VARCHAR(40),
 product_interest VARCHAR(80),
 segment VARCHAR(100),
 status VARCHAR(30) NOT NULL DEFAULT 'NEW' CHECK(status IN ('NEW','QUALIFICATION','MQL','SQL','DEMO','WON','LOST','NURTURE')),
 score INTEGER NOT NULL DEFAULT 0 CHECK(score >= 0 AND score <= 100),
 lost_reason VARCHAR(180),
 landing_page_url TEXT,
 utm_source VARCHAR(120),
 utm_medium VARCHAR(120),
 utm_campaign VARCHAR(180),
 utm_term VARCHAR(180),
 utm_content VARCHAR(180),
 notes TEXT,
 owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_history (
 id UUID PRIMARY KEY,
 lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
 event_type VARCHAR(50) NOT NULL,
 from_status VARCHAR(30),
 to_status VARCHAR(30),
 description TEXT,
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_owner ON companies(owner_id);
CREATE INDEX IF NOT EXISTS idx_companies_trade_name ON companies(trade_name);
CREATE INDEX IF NOT EXISTS idx_contacts_company ON contacts(company_id);
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_company ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_contact ON leads(contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source_id);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_whatsapp ON leads(whatsapp);
CREATE INDEX IF NOT EXISTS idx_lead_history_lead ON lead_history(lead_id,created_at DESC);

INSERT INTO lead_sources(id,name,type) VALUES
(gen_random_uuid(),'Site','WEBSITE'),
(gen_random_uuid(),'Landing Page','LANDING_PAGE'),
(gen_random_uuid(),'Google Orgânico','GOOGLE_ORGANIC'),
(gen_random_uuid(),'Google Ads','GOOGLE_ADS'),
(gen_random_uuid(),'Meta Ads','META_ADS'),
(gen_random_uuid(),'Instagram','INSTAGRAM'),
(gen_random_uuid(),'Facebook','FACEBOOK'),
(gen_random_uuid(),'LinkedIn','LINKEDIN'),
(gen_random_uuid(),'YouTube','YOUTUBE'),
(gen_random_uuid(),'WhatsApp','WHATSAPP'),
(gen_random_uuid(),'Indicação','REFERRAL'),
(gen_random_uuid(),'Parceiro','PARTNER'),
(gen_random_uuid(),'Evento','EVENT'),
(gen_random_uuid(),'Outro','OTHER')
ON CONFLICT(name) DO NOTHING;
