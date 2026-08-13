-- v1.0.23 — Growth Attribution + CRM Acquisition + WhatsApp readiness.
-- Non-destructive. Adds attribution/touchpoint/link/message infrastructure to CRM.

ALTER TABLE leads ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS tracking_link_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page_key VARCHAR(160);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS landing_page_path VARCHAR(500);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS referrer_url TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS gclid VARCHAR(180);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fbclid VARCHAR(180);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS msclkid VARCHAR(180);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS ttclid VARCHAR(180);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor_id VARCHAR(120);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id VARCHAR(120);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS first_touch_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_touch_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS attribution JSONB NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_tracking_link ON leads(tracking_link_id);
CREATE INDEX IF NOT EXISTS idx_leads_landing_key ON leads(landing_page_key);
CREATE INDEX IF NOT EXISTS idx_leads_visitor ON leads(visitor_id);
CREATE INDEX IF NOT EXISTS idx_leads_session ON leads(session_id);
CREATE INDEX IF NOT EXISTS idx_leads_gclid ON leads(gclid);

CREATE TABLE IF NOT EXISTS marketing_landing_pages (
 id UUID PRIMARY KEY,
 key VARCHAR(160) NOT NULL UNIQUE,
 name VARCHAR(220) NOT NULL,
 path VARCHAR(500) NOT NULL UNIQUE,
 type VARCHAR(30) NOT NULL DEFAULT 'LANDING' CHECK(type IN ('SITE','PRODUCT','SEGMENT','TOOL','OTHER')),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_tracking_links (
 id UUID PRIMARY KEY,
 code VARCHAR(32) NOT NULL UNIQUE,
 name VARCHAR(220) NOT NULL,
 landing_page_id UUID REFERENCES marketing_landing_pages(id) ON DELETE SET NULL,
 campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
 channel VARCHAR(40) NOT NULL DEFAULT 'ORGANIC',
 source VARCHAR(120),
 medium VARCHAR(120),
 campaign VARCHAR(180),
 term VARCHAR(180),
 content VARCHAR(180),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 clicks INTEGER NOT NULL DEFAULT 0 CHECK(clicks >= 0),
 created_by UUID REFERENCES users(id) ON DELETE SET NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tracking_links_campaign ON marketing_tracking_links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_landing ON marketing_tracking_links(landing_page_id);
CREATE INDEX IF NOT EXISTS idx_tracking_links_active ON marketing_tracking_links(active);

ALTER TABLE leads ADD CONSTRAINT fk_leads_tracking_link
  FOREIGN KEY (tracking_link_id) REFERENCES marketing_tracking_links(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS marketing_touchpoints (
 id UUID PRIMARY KEY,
 lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
 visitor_id VARCHAR(120),
 session_id VARCHAR(120),
 event_type VARCHAR(40) NOT NULL CHECK(event_type IN ('PAGE_VIEW','CTA_CLICK','FORM_VIEW','FORM_START','FORM_SUBMIT','WHATSAPP_CLICK','LINK_CLICK')),
 landing_page_key VARCHAR(160),
 landing_page_path VARCHAR(500),
 referrer_url TEXT,
 source VARCHAR(120),
 medium VARCHAR(120),
 campaign VARCHAR(180),
 term VARCHAR(180),
 content VARCHAR(180),
 channel VARCHAR(40),
 tracking_link_id UUID REFERENCES marketing_tracking_links(id) ON DELETE SET NULL,
 campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
 gclid VARCHAR(180),
 fbclid VARCHAR(180),
 msclkid VARCHAR(180),
 ttclid VARCHAR(180),
 metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
 ip_hash VARCHAR(128),
 user_agent TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_touchpoints_lead_time ON marketing_touchpoints(lead_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchpoints_visitor_time ON marketing_touchpoints(visitor_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchpoints_campaign ON marketing_touchpoints(campaign_id,created_at DESC);
CREATE INDEX IF NOT EXISTS idx_touchpoints_landing ON marketing_touchpoints(landing_page_key,created_at DESC);

CREATE TABLE IF NOT EXISTS whatsapp_templates (
 id UUID PRIMARY KEY,
 name VARCHAR(120) NOT NULL UNIQUE,
 provider_template_name VARCHAR(160),
 language_code VARCHAR(20) NOT NULL DEFAULT 'pt_BR',
 category VARCHAR(30) NOT NULL DEFAULT 'MARKETING' CHECK(category IN ('MARKETING','UTILITY','AUTHENTICATION')),
 body TEXT NOT NULL,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_automations (
 id UUID PRIMARY KEY,
 name VARCHAR(180) NOT NULL UNIQUE,
 trigger_event VARCHAR(40) NOT NULL CHECK(trigger_event IN ('LEAD_CREATED','LEAD_MQL','LEAD_SQL','LEAD_DEMO','LEAD_WON','LEAD_LOST','WHATSAPP_CLICK')),
 channel VARCHAR(30) NOT NULL CHECK(channel IN ('WHATSAPP','INTERNAL')),
 template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
 delay_minutes INTEGER NOT NULL DEFAULT 0 CHECK(delay_minutes >= 0 AND delay_minutes <= 43200),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS marketing_message_queue (
 id UUID PRIMARY KEY,
 lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
 automation_id UUID REFERENCES marketing_automations(id) ON DELETE SET NULL,
 template_id UUID REFERENCES whatsapp_templates(id) ON DELETE SET NULL,
 channel VARCHAR(30) NOT NULL CHECK(channel IN ('WHATSAPP','INTERNAL')),
 destination VARCHAR(180),
 payload JSONB NOT NULL DEFAULT '{}'::jsonb,
 scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 sent_at TIMESTAMPTZ,
 status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING','SENDING','SENT','FAILED','CANCELLED')),
 attempts INTEGER NOT NULL DEFAULT 0,
 last_error TEXT,
 provider_message_id VARCHAR(220),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_message_queue_due ON marketing_message_queue(status,scheduled_at);
CREATE INDEX IF NOT EXISTS idx_message_queue_lead ON marketing_message_queue(lead_id,created_at DESC);

INSERT INTO marketing_landing_pages(id,key,name,path,type) VALUES
(gen_random_uuid(),'g3soft-site','Site principal','/g3soft','SITE'),
(gen_random_uuid(),'g3erp','G3ERP','/g3erp','PRODUCT'),
(gen_random_uuid(),'g3control','G3Control','/g3control','PRODUCT'),
(gen_random_uuid(),'g3food','G3Food','/g3food','PRODUCT'),
(gen_random_uuid(),'g3pedidos','G3Pedidos','/g3pedidos','PRODUCT'),
(gen_random_uuid(),'g3small','G3Small','/g3small','PRODUCT'),
(gen_random_uuid(),'varejo','Varejo','/segmentos/varejo','SEGMENT'),
(gen_random_uuid(),'supermercados','Supermercados','/segmentos/supermercados','SEGMENT'),
(gen_random_uuid(),'restaurantes','Restaurantes','/segmentos/restaurantes','SEGMENT'),
(gen_random_uuid(),'lojas','Lojas','/segmentos/lojas','SEGMENT'),
(gen_random_uuid(),'conveniencias','Conveniências','/segmentos/conveniencias','SEGMENT'),
(gen_random_uuid(),'multilojas','Multilojas','/segmentos/multilojas','SEGMENT'),
(gen_random_uuid(),'loja-de-roupas','Loja de roupas','/segmentos/loja-de-roupas','SEGMENT'),
(gen_random_uuid(),'loja-de-conveniencias','Loja de conveniências','/segmentos/loja-de-conveniencias','SEGMENT'),
(gen_random_uuid(),'deposito-de-bebidas','Depósito de bebidas','/segmentos/deposito-de-bebidas','SEGMENT'),
(gen_random_uuid(),'bares-e-restaurantes','Bares e restaurantes','/segmentos/bares-e-restaurantes','SEGMENT'),
(gen_random_uuid(),'padarias','Padarias','/segmentos/padarias','SEGMENT'),
(gen_random_uuid(),'lanchonetes-e-docerias','Lanchonetes e docerias','/segmentos/lanchonetes-e-docerias','SEGMENT'),
(gen_random_uuid(),'mercearias-e-mercados','Mercearias e mercados','/segmentos/mercearias-e-mercados','SEGMENT'),
(gen_random_uuid(),'descubra-seu-g3','Descubra seu G3','/descubra-seu-g3','TOOL'),
(gen_random_uuid(),'calculadora-de-perdas','Calculadora de perdas','/calculadora-de-perdas','TOOL')
ON CONFLICT(key) DO NOTHING;

INSERT INTO whatsapp_templates(id,name,provider_template_name,language_code,category,body) VALUES
(gen_random_uuid(),'lead_welcome','G3SOFT_LEAD_WELCOME','pt_BR','MARKETING','Olá {{1}}! Aqui é da G3Soft. Recebemos seu interesse em {{2}}. Posso entender rapidamente seu cenário e indicar o próximo passo?'),
(gen_random_uuid(),'mql_followup','G3SOFT_MQL_FOLLOWUP','pt_BR','MARKETING','Olá {{1}}! Seu diagnóstico G3Soft avançou. Queremos mostrar como {{2}} pode ajudar sua operação. Qual o melhor horário para conversarmos?'),
(gen_random_uuid(),'demo_confirmation','G3SOFT_DEMO_CONFIRMATION','pt_BR','UTILITY','Olá {{1}}! Sua conversa com a G3Soft está encaminhada. Se precisar, responda por aqui e nossa equipe ajuda você.'),
(gen_random_uuid(),'lead_nurture','G3SOFT_LEAD_NURTURE','pt_BR','MARKETING','Olá {{1}}! Passando para não deixar sua oportunidade de lado. Se ainda fizer sentido melhorar {{2}}, podemos retomar de onde paramos.')
ON CONFLICT(name) DO NOTHING;

INSERT INTO marketing_automations(id,name,trigger_event,channel,template_id,delay_minutes) 
SELECT gen_random_uuid(),'Boas-vindas novo lead','LEAD_CREATED','WHATSAPP',t.id,0 FROM whatsapp_templates t WHERE t.name='lead_welcome'
ON CONFLICT(name) DO NOTHING;
INSERT INTO marketing_automations(id,name,trigger_event,channel,template_id,delay_minutes)
SELECT gen_random_uuid(),'Follow-up MQL','LEAD_MQL','WHATSAPP',t.id,60 FROM whatsapp_templates t WHERE t.name='mql_followup'
ON CONFLICT(name) DO NOTHING;
INSERT INTO marketing_automations(id,name,trigger_event,channel,template_id,delay_minutes)
SELECT gen_random_uuid(),'Confirmação de demonstração','LEAD_DEMO','WHATSAPP',t.id,0 FROM whatsapp_templates t WHERE t.name='demo_confirmation'
ON CONFLICT(name) DO NOTHING;
INSERT INTO marketing_automations(id,name,trigger_event,channel,template_id,delay_minutes)
SELECT gen_random_uuid(),'Nutrição de oportunidade','LEAD_LOST','WHATSAPP',t.id,1440 FROM whatsapp_templates t WHERE t.name='lead_nurture'
ON CONFLICT(name) DO NOTHING;
