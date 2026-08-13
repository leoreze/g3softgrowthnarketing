-- G3Soft Growth OS v1.0.25 — Strategy Foundation
-- Incremental / non-destructive migration.

CREATE TABLE IF NOT EXISTS strategies (
 id UUID PRIMARY KEY,
 name VARCHAR(220) NOT NULL,
 slug VARCHAR(220) NOT NULL UNIQUE,
 description TEXT,
 phase VARCHAR(80) NOT NULL DEFAULT 'FUNDACAO',
 status VARCHAR(40) NOT NULL DEFAULT 'DRAFT'
   CHECK(status IN ('DRAFT','IN_REVIEW','PENDING_APPROVAL','APPROVED','ACTIVE','OPTIMIZING','ARCHIVED','REJECTED')),
 version VARCHAR(40) NOT NULL DEFAULT '1.0',
 owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
 reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
 approved_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS strategy_message_house (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL UNIQUE REFERENCES strategies(id) ON DELETE CASCADE,
 positioning TEXT,
 promise TEXT,
 commercial_message TEXT,
 campaign_message TEXT,
 big_idea TEXT,
 value_proposition TEXT,
 tone_of_voice TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS strategy_value_pillars (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
 name VARCHAR(100) NOT NULL,
 promise TEXT NOT NULL,
 sort_order INTEGER NOT NULL DEFAULT 0,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 UNIQUE(strategy_id,name)
);

CREATE TABLE IF NOT EXISTS icps (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
 name VARCHAR(160) NOT NULL,
 description TEXT,
 company_size VARCHAR(120),
 decision_maker VARCHAR(160),
 business_context TEXT,
 pain_points TEXT,
 needs TEXT,
 objectives TEXT,
 objections TEXT,
 preferred_channel VARCHAR(120),
 status VARCHAR(40) NOT NULL DEFAULT 'DRAFT'
   CHECK(status IN ('DRAFT','VALIDATING','VALIDATED','ARCHIVED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(strategy_id,name)
);

CREATE TABLE IF NOT EXISTS segments (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
 name VARCHAR(180) NOT NULL,
 slug VARCHAR(180) NOT NULL,
 description TEXT,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(strategy_id,slug)
);

CREATE TABLE IF NOT EXISTS products (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
 key VARCHAR(80) NOT NULL,
 name VARCHAR(120) NOT NULL,
 description TEXT,
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(strategy_id,key)
);

CREATE TABLE IF NOT EXISTS proofs (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
 type VARCHAR(40) NOT NULL,
 claim TEXT NOT NULL,
 evidence TEXT,
 source TEXT,
 status VARCHAR(40) NOT NULL DEFAULT 'PENDING_VALIDATION'
   CHECK(status IN ('PENDING_VALIDATION','VALIDATING','VALIDATED','REJECTED','ARCHIVED')),
 validation_required BOOLEAN NOT NULL DEFAULT TRUE,
 validated_by UUID REFERENCES users(id) ON DELETE SET NULL,
 validated_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS message_matrix (
 id UUID PRIMARY KEY,
 strategy_id UUID NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
 icp_id UUID REFERENCES icps(id) ON DELETE SET NULL,
 segment_id UUID REFERENCES segments(id) ON DELETE SET NULL,
 product_id UUID REFERENCES products(id) ON DELETE SET NULL,
 funnel_stage VARCHAR(40) NOT NULL DEFAULT 'MOFU',
 pain TEXT NOT NULL,
 need TEXT,
 objective TEXT,
 objection TEXT,
 message TEXT NOT NULL,
 benefit TEXT,
 proof_id UUID REFERENCES proofs(id) ON DELETE SET NULL,
 offer TEXT,
 cta VARCHAR(240),
 channel VARCHAR(40),
 landing_page_id UUID REFERENCES marketing_landing_pages(id) ON DELETE SET NULL,
 campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
 status VARCHAR(40) NOT NULL DEFAULT 'HYPOTHESIS'
   CHECK(status IN ('DRAFT','HYPOTHESIS','VALIDATING','VALIDATED','APPROVED','ARCHIVED')),
 confidence NUMERIC(5,2),
 owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
 reviewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
 approved_at TIMESTAMPTZ,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategy_status ON strategies(status);
CREATE INDEX IF NOT EXISTS idx_icps_strategy ON icps(strategy_id,status);
CREATE INDEX IF NOT EXISTS idx_segments_strategy ON segments(strategy_id,active);
CREATE INDEX IF NOT EXISTS idx_products_strategy ON products(strategy_id,active);
CREATE INDEX IF NOT EXISTS idx_proofs_strategy ON proofs(strategy_id,status);
CREATE INDEX IF NOT EXISTS idx_matrix_strategy ON message_matrix(strategy_id,status);
CREATE INDEX IF NOT EXISTS idx_matrix_segment ON message_matrix(segment_id);
CREATE INDEX IF NOT EXISTS idx_matrix_product ON message_matrix(product_id);

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS message_matrix_id UUID REFERENCES message_matrix(id) ON DELETE SET NULL;
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL;
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS message_matrix_id UUID REFERENCES message_matrix(id) ON DELETE SET NULL;
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'PUBLISHED'
  CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED'));
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS draft_config JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_campaign_strategy ON campaigns(strategy_id);
CREATE INDEX IF NOT EXISTS idx_campaign_matrix ON campaigns(message_matrix_id);
CREATE INDEX IF NOT EXISTS idx_lp_strategy ON marketing_landing_pages(strategy_id);
CREATE INDEX IF NOT EXISTS idx_lp_matrix ON marketing_landing_pages(message_matrix_id);

-- Canonical strategy record
INSERT INTO strategies(id,name,slug,description,phase,status,version)
SELECT gen_random_uuid(),
 'Estratégia de Posicionamento e Mensagens — G3Soft',
 'g3soft-posicionamento-mensagens',
 'Fundação estratégica que conecta posicionamento, ICP, segmentos, produtos, mensagens, provas, campanhas, Landing Pages, CRM e KPIs.',
 'FUNDACAO','ACTIVE','1.0'
WHERE NOT EXISTS (SELECT 1 FROM strategies WHERE slug='g3soft-posicionamento-mensagens');

INSERT INTO strategy_message_house(id,strategy_id,positioning,promise,commercial_message,campaign_message,big_idea,value_proposition,tone_of_voice)
SELECT gen_random_uuid(),s.id,
 'A G3Soft transforma tecnologia de gestão em inteligência prática para simplificar a operação e sustentar o crescimento.',
 'Mais controle. Mais eficiência. Mais visão sobre o seu negócio.',
 'Tecnologia que simplifica a gestão.',
 'Sua operação sob controle. Seu negócio pronto para crescer.',
 'Menos complexidade. Mais clareza para decidir e crescer.',
 'Conectamos operação, dados e execução para transformar informação em decisão e resultado.',
 'Claro, confiante, humano, direto, consultivo e orientado a resultado.'
FROM strategies s
WHERE s.slug='g3soft-posicionamento-mensagens'
AND NOT EXISTS (SELECT 1 FROM strategy_message_house h WHERE h.strategy_id=s.id);

INSERT INTO strategy_value_pillars(id,strategy_id,name,promise,sort_order)
SELECT gen_random_uuid(),s.id,v.name,v.promise,v.sort_order
FROM strategies s
CROSS JOIN (VALUES
 ('Controle','Saiba o que acontece na sua operação',1),
 ('Integração','Conecte processos e informações',2),
 ('Simplicidade','Torne a gestão mais fácil',3),
 ('Especialização','Solução adequada ao segmento',4),
 ('Crescimento','Melhores informações para melhores decisões',5)
) v(name,promise,sort_order)
WHERE s.slug='g3soft-posicionamento-mensagens'
ON CONFLICT(strategy_id,name) DO NOTHING;

INSERT INTO icps(id,strategy_id,name,description,status)
SELECT gen_random_uuid(),s.id,v.name,v.description,'VALIDATING'
FROM strategies s
CROSS JOIN (VALUES
 ('Pequeno varejo','Empresas menores que precisam organizar a operação sem aumentar complexidade.'),
 ('Varejo estruturado','Operações de varejo que precisam de integração, controle e visão.'),
 ('Multilojas','Redes, franquias e operações com múltiplas unidades.'),
 ('Food Service','Restaurantes e operações de alimentação que precisam de agilidade e controle.'),
 ('Empresas com vendedores externos','Operações comerciais que precisam conectar vendas e execução.')
) v(name,description)
WHERE s.slug='g3soft-posicionamento-mensagens'
ON CONFLICT(strategy_id,name) DO NOTHING;

INSERT INTO segments(id,strategy_id,name,slug)
SELECT gen_random_uuid(),s.id,v.name,v.slug
FROM strategies s
CROSS JOIN (VALUES
 ('Loja de roupas','loja-de-roupas'),
 ('Loja de conveniências','loja-de-conveniencias'),
 ('Depósito de bebidas','deposito-de-bebidas'),
 ('Bares e restaurantes','bares-e-restaurantes'),
 ('Padarias','padarias'),
 ('Lanchonetes e docerias','lanchonetes-e-docerias'),
 ('Mercearias e mercados','mercearias-e-mercados'),
 ('Supermercados','supermercados'),
 ('Multilojas','multilojas'),
 ('Pet shops','pet-shops')
) v(name,slug)
WHERE s.slug='g3soft-posicionamento-mensagens'
ON CONFLICT(strategy_id,slug) DO NOTHING;

INSERT INTO products(id,strategy_id,key,name)
SELECT gen_random_uuid(),s.id,v.key,v.name
FROM strategies s
CROSS JOIN (VALUES
 ('g3erp','G3ERP'),('g3control','G3Control'),('g3food','G3Food'),('g3pedidos','G3Pedidos'),('g3small','G3Small')
) v(key,name)
WHERE s.slug='g3soft-posicionamento-mensagens'
ON CONFLICT(strategy_id,key) DO NOTHING;

-- Claims stay gated until evidence is validated.
INSERT INTO proofs(id,strategy_id,type,claim,evidence,status,validation_required)
SELECT gen_random_uuid(),s.id,v.type,v.claim,v.evidence,'PENDING_VALIDATION',TRUE
FROM strategies s
CROSS JOIN (VALUES
 ('INSTITUTIONAL','+10 anos','Validar em fonte institucional/comercial antes de publicar.'),
 ('CUSTOMER','+700 clientes','Validar em base comercial autorizada antes de publicar.'),
 ('TECHNICAL','Segurança e nuvem','Validar arquitetura, certificações e políticas aplicáveis.')
) v(type,claim,evidence)
WHERE s.slug='g3soft-posicionamento-mensagens'
AND NOT EXISTS (SELECT 1 FROM proofs p WHERE p.strategy_id=s.id AND p.claim=v.claim);

-- Build the canonical message matrix from the existing strategy items.
INSERT INTO message_matrix
(id,strategy_id,icp_id,segment_id,product_id,funnel_stage,pain,need,message,offer,cta,channel,status,confidence,landing_page_id)
SELECT
 gen_random_uuid(),s.id,i.id,sg.id,pr.id,
 COALESCE(g.funnel_stage,'MOFU'),g.pain_point,g.need,g.message,g.offer,g.cta,NULL,
 CASE WHEN g.evidence_status='VALIDATED' THEN 'VALIDATED' ELSE 'HYPOTHESIS' END,
 NULL,p.id
FROM growth_strategy_items g
JOIN strategies s ON s.slug='g3soft-posicionamento-mensagens'
LEFT JOIN icps i ON i.strategy_id=s.id AND i.name=g.icp
LEFT JOIN segments sg ON sg.strategy_id=s.id AND sg.slug=g.landing_page_key
LEFT JOIN products pr ON pr.strategy_id=s.id AND pr.key=g.product_key
LEFT JOIN marketing_landing_pages p ON p.key=g.landing_page_key
WHERE NOT EXISTS (
 SELECT 1 FROM message_matrix m
 WHERE m.strategy_id=s.id AND COALESCE(m.icp_id,'00000000-0000-0000-0000-000000000000')=COALESCE(i.id,'00000000-0000-0000-0000-000000000000')
 AND COALESCE(m.segment_id,'00000000-0000-0000-0000-000000000000')=COALESCE(sg.id,'00000000-0000-0000-0000-000000000000')
 AND COALESCE(m.product_id,'00000000-0000-0000-0000-000000000000')=COALESCE(pr.id,'00000000-0000-0000-0000-000000000000')
 AND m.pain=g.pain_point
);

UPDATE marketing_landing_pages p
SET strategy_id=s.id,status='PUBLISHED'
FROM strategies s
WHERE s.slug='g3soft-posicionamento-mensagens'
AND p.active=TRUE;

UPDATE campaigns c
SET strategy_id=s.id
FROM strategies s
WHERE s.slug='g3soft-posicionamento-mensagens'
AND c.strategy_id IS NULL
AND c.name ILIKE '%G3%';
