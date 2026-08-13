-- G3Soft Growth Strategy Engine v1.0.24
-- Incremental only. No reset/truncate/drop.

CREATE TABLE IF NOT EXISTS growth_strategy_items (
 id UUID PRIMARY KEY,
 icp VARCHAR(160) NOT NULL,
 segment VARCHAR(180) NOT NULL,
 pain_point TEXT NOT NULL,
 need TEXT,
 product_key VARCHAR(80),
 message TEXT NOT NULL,
 offer TEXT,
 cta VARCHAR(220),
 funnel_stage VARCHAR(40),
 priority VARCHAR(10) NOT NULL DEFAULT 'P1',
 evidence_status VARCHAR(40) NOT NULL DEFAULT 'NEEDS_VALIDATION',
 landing_page_key VARCHAR(160),
 campaign_key VARCHAR(180),
 active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(icp,segment,pain_point,product_key)
);

CREATE INDEX IF NOT EXISTS idx_growth_strategy_active ON growth_strategy_items(active);
CREATE INDEX IF NOT EXISTS idx_growth_strategy_segment ON growth_strategy_items(segment);
CREATE INDEX IF NOT EXISTS idx_growth_strategy_product ON growth_strategy_items(product_key);
CREATE INDEX IF NOT EXISTS idx_growth_strategy_priority ON growth_strategy_items(priority);

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS strategy_item_id UUID REFERENCES growth_strategy_items(id) ON DELETE SET NULL;
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE marketing_landing_pages ADD COLUMN IF NOT EXISTS strategy_ready BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_campaigns_strategy_item ON campaigns(strategy_item_id);

INSERT INTO growth_strategy_items
(id,icp,segment,pain_point,need,product_key,message,offer,cta,funnel_stage,priority,evidence_status,landing_page_key,campaign_key)
VALUES
(gen_random_uuid(),'Pequeno varejo','Loja de roupas','complexidade e falta de controle','simplificar a operação','g3small','Gestão completa sem complicar sua rotina','Diagnóstico','Descobrir minha solução','MOFU','P0','NEEDS_VALIDATION','loja-de-roupas','g3small-loja-de-roupas'),
(gen_random_uuid(),'Pequeno varejo','Loja de conveniências','falta de controle','integrar vendas e operação','g3small','Mais controle para uma operação que não para','Demonstração','Conhecer a G3Soft','BOFU','P0','NEEDS_VALIDATION','loja-de-conveniencias','g3small-conveniencias'),
(gen_random_uuid(),'Varejo','Loja de roupas','estoque e vendas desconectados','controle integrado','g3erp','Venda mais. Controle melhor.','Demonstração','Agendar demonstração','BOFU','P0','NEEDS_VALIDATION','loja-de-roupas','g3erp-loja-de-roupas'),
(gen_random_uuid(),'Varejo','Mercearias e mercados','estoque e vendas','controle operacional','g3small','Controle sua operação sem complicar','Diagnóstico','Conhecer a G3Soft','MOFU','P0','NEEDS_VALIDATION','mercearias-e-mercados','g3small-mercearias'),
(gen_random_uuid(),'Food Service','Bares e restaurantes','lentidão e erros','integrar atendimento, produção e entrega','g3food','Mais agilidade no atendimento. Mais controle na operação.','Demonstração','Conhecer o G3Food','BOFU','P0','NEEDS_VALIDATION','bares-e-restaurantes','g3food-bares-restaurantes'),
(gen_random_uuid(),'Food Service','Padarias','operação e vendas','gestão simplificada','g3small','Simplifique a gestão da sua padaria','Demonstração','Conhecer a solução','BOFU','P1','NEEDS_VALIDATION','padarias','g3small-padarias'),
(gen_random_uuid(),'Food Service','Lanchonetes e docerias','processos desconectados','centralizar operação','g3food','Atendimento, produção e entrega conectados','Diagnóstico','Falar com especialista','MOFU','P1','NEEDS_VALIDATION','lanchonetes-e-docerias','g3food-lanchonetes'),
(gen_random_uuid(),'Varejo','Depósito de bebidas','pedidos, estoque e operação','controle integrado','g3erp','Mais controle para vender e operar melhor','Demonstração','Agendar demonstração','BOFU','P1','NEEDS_VALIDATION','deposito-de-bebidas','g3erp-deposito-bebidas'),
(gen_random_uuid(),'Multilojas','Redes e multilojas','informações fragmentadas','visão consolidada','g3control','Todas as suas lojas. Uma visão integrada.','Diagnóstico estratégico','Avaliar minha operação','MOFU','P0','NEEDS_VALIDATION','multilojas','g3control-multilojas'),
(gen_random_uuid(),'Comercial','Distribuidoras e atacado','pedidos externos','força de vendas integrada','g3pedidos','Sua equipe vende. Sua operação acompanha.','Demonstração','Conhecer o G3Pedidos','BOFU','P0','NEEDS_VALIDATION','g3pedidos','g3pedidos-atacado'),
(gen_random_uuid(),'Pequeno negócio','Pet shops','gestão operacional','integrar vendas e gestão','g3small','Mais controle para o seu negócio crescer','Diagnóstico','Descobrir minha solução','MOFU','P1','NEEDS_VALIDATION','varejo','g3small-petshops'),
(gen_random_uuid(),'Supermercados','Supermercados','complexidade operacional','controle integrado','g3erp','Controle uma operação complexa com mais inteligência','Diagnóstico','Falar com especialista','MOFU','P0','NEEDS_VALIDATION','supermercados','g3erp-supermercados')
ON CONFLICT(icp,segment,pain_point,product_key) DO UPDATE SET
 need=EXCLUDED.need,message=EXCLUDED.message,offer=EXCLUDED.offer,cta=EXCLUDED.cta,
 funnel_stage=EXCLUDED.funnel_stage,priority=EXCLUDED.priority,landing_page_key=EXCLUDED.landing_page_key,
 campaign_key=EXCLUDED.campaign_key,updated_at=NOW();

UPDATE marketing_landing_pages p
SET strategy_ready=TRUE
WHERE p.active=TRUE;
