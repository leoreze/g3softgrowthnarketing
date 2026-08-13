-- v1.0.26 — Growth Calendar + Traffic Plan + Relationship Center
-- Additive / idempotent. No reset or destructive operations.

CREATE TABLE IF NOT EXISTS growth_channel_plans (
  id UUID PRIMARY KEY,
  channel_key VARCHAR(40) NOT NULL UNIQUE,
  channel_name VARCHAR(100) NOT NULL,
  traffic_type VARCHAR(30) NOT NULL CHECK (traffic_type IN ('ORGANIC','PAID','OWNED','RELATIONSHIP')),
  role TEXT NOT NULL,
  cadence VARCHAR(120) NOT NULL,
  primary_goal VARCHAR(180) NOT NULL,
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
  status VARCHAR(30) NOT NULL DEFAULT 'READY' CHECK(status IN ('DRAFT','READY','ACTIVE','ARCHIVED')),
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
  status VARCHAR(30) NOT NULL DEFAULT 'PLANNED' CHECK(status IN ('PLANNED','IN_PROGRESS','REVIEW','APPROVED','SCHEDULED','PUBLISHED','BLOCKED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(month_no,week_no)
);
CREATE INDEX IF NOT EXISTS idx_growth_calendar_dates ON growth_calendar_items(start_date,end_date);
CREATE INDEX IF NOT EXISTS idx_growth_calendar_campaign ON growth_calendar_items(campaign_key);

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

INSERT INTO growth_channel_plans(id,channel_key,channel_name,traffic_type,role,cadence,primary_goal,kpis,content_formats)
VALUES
(gen_random_uuid(),'SEO','SEO / Conteúdo orgânico','ORGANIC','Capturar demanda e construir autoridade','1 artigo/semana + otimização contínua','Demanda qualificada e descoberta','["organic_sessions","rankings","leads","conversions"]','["BLOG","LP","GUIDE"]'),
(gen_random_uuid(),'INSTAGRAM','Instagram','ORGANIC','Alcance, identificação, prova e relacionamento','4 posts/reels + stories diários','Alcance e geração de intenção','["reach","engagement","profile_clicks","leads"]','["REELS","CAROUSEL","STORIES"]'),
(gen_random_uuid(),'FACEBOOK','Facebook','ORGANIC','Distribuição, comunidade e remarketing','3 posts/semana','Distribuição e consideração','["reach","engagement","clicks","leads"]','["POST","VIDEO","CAROUSEL"]'),
(gen_random_uuid(),'LINKEDIN','LinkedIn','ORGANIC','Autoridade B2B e geração de demanda','3 posts/semana','Autoridade e leads B2B','["impressions","engagement","profile_views","leads"]','["TEXT","CAROUSEL","VIDEO","CASE"]'),
(gen_random_uuid(),'YOUTUBE','YouTube','ORGANIC','Educação profunda e prova de produto','1 vídeo longo/mês + 2 Shorts/semana','Autoridade e intenção','["views","watch_time","subscribers","leads"]','["VIDEO","SHORTS","DEMO"]'),
(gen_random_uuid(),'GOOGLE_ADS','Google Ads','PAID','Capturar intenção de compra','Always-on + testes quinzenais','Leads de alta intenção','["impressions","clicks","cpc","cpl","sql","cac"]','["SEARCH","REMARKETING"]'),
(gen_random_uuid(),'META_ADS','Meta Ads','PAID','Criar demanda, educar e recuperar intenção','Always-on + testes semanais','Demanda e remarketing','["reach","ctr","cpl","mql","sql","roas"]','["REELS","VIDEO","CAROUSEL","STORY"]'),
(gen_random_uuid(),'EMAIL','E-mail','RELATIONSHIP','Nutrição, follow-up e recuperação','1 newsletter/semana + automações','Avançar leads e oportunidades','["delivery","open","click","reply","conversion"]','["NEWSLETTER","NURTURE","FOLLOWUP"]'),
(gen_random_uuid(),'WHATSAPP','WhatsApp','RELATIONSHIP','Resposta rápida, qualificação e follow-up','Eventos + follow-ups com consentimento','Conversão e velocidade comercial','["response_time","reply_rate","meetings","conversion"]','["UTILITY","FOLLOWUP","REMINDER"]'),
(gen_random_uuid(),'CRM','CRM','RELATIONSHIP','Segmentar, pontuar e ativar o funil','Contínuo / event-driven','MQL → SQL → Demo → Venda','["mql","sql","demo","win_rate","revenue"]','["SEGMENTATION","SCORING","TASKS"]'),
(gen_random_uuid(),'SITE','Site / Landing Pages','OWNED','Converter tráfego em intenção identificável','Otimização contínua + 1 LP prioritária/mês','Conversão','["sessions","cvr","leads","cpl"]','["LANDING","CTA","DIAGNOSTIC"]')
ON CONFLICT(channel_key) DO UPDATE SET channel_name=EXCLUDED.channel_name,traffic_type=EXCLUDED.traffic_type,role=EXCLUDED.role,cadence=EXCLUDED.cadence,primary_goal=EXCLUDED.primary_goal,kpis=EXCLUDED.kpis,content_formats=EXCLUDED.content_formats,updated_at=NOW();

INSERT INTO growth_campaign_blueprints(id,campaign_key,name,month_no,objective,funnel_stage,audience,pain,message,offer,cta,landing_page_key,channels,organic_plan,paid_plan,relationship_plan,content_mix)
VALUES
(gen_random_uuid(),'M01-POSICIONAMENTO','Mês 1 • G3Soft — Tecnologia que simplifica a gestão',1,'Fixar posicionamento e criar demanda inicial','TOFU','Gestores e decisores de PMEs','Gestão fragmentada e excesso de complexidade','Tecnologia que simplifica a gestão. Mais controle, eficiência e visão.','Guia de gestão + diagnóstico','Conhecer a G3Soft','g3soft','["SEO","INSTAGRAM","LINKEDIN","YOUTUBE","META_ADS","EMAIL"]','{"blog":4,"reels":4,"linkedin":12,"youtube_shorts":8}','{"meta":"video+carousel prospecting","google":"brand+generic low-intent"}','{"email":2,"whatsapp":"lead-confirmation"}','{"hero":1,"reels":4,"carousels":4,"articles":4,"videos":1}'),
(gen_random_uuid(),'M02-G3ERP-VAREJO','Mês 2 • G3ERP para Varejo',2,'Capturar intenção de compra no varejo','BOFU','Lojas, mercados e operações de varejo','Estoque, vendas e gestão desconectados','Venda mais. Controle melhor.','Demonstração personalizada','Agendar demonstração','g3erp','["SEO","GOOGLE_ADS","META_ADS","INSTAGRAM","LINKEDIN","WHATSAPP"]','{"blog":4,"reels":4,"case":2}','{"google":"search by product+segment","meta":"pain+proof remarketing"}','{"whatsapp":"demo-followup","email":"nurture-3-step"}','{"landing_pages":1,"reels":6,"carousels":4,"search_ads":6}'),
(gen_random_uuid(),'M03-G3FOOD','Mês 3 • G3Food — Food Service',3,'Gerar demanda e demos em alimentação','BOFU','Restaurantes, bares, padarias e lanchonetes','Lentidão, erros e operação desconectada','Mais agilidade no atendimento. Mais controle na operação.','Demonstração','Conhecer o G3Food','g3food','["SEO","GOOGLE_ADS","META_ADS","INSTAGRAM","YOUTUBE"]','{"blog":4,"reels":6,"youtube_shorts":8}','{"google":"restaurant software search","meta":"pain+demo video"}','{"whatsapp":"demo-followup"}','{"reels":8,"videos":1,"articles":4,"carousels":4}'),
(gen_random_uuid(),'M04-G3SMALL','Mês 4 • G3Small — Pequenos negócios',4,'Aumentar consideração em PMEs','MOFU','Pequenas empresas e operações simples','Sistemas complexos demais para a realidade da empresa','Uma gestão completa sem complicar sua rotina.','Diagnóstico da operação','Descobrir minha solução','g3small','["SEO","META_ADS","INSTAGRAM","FACEBOOK","EMAIL"]','{"blog":4,"reels":4,"stories":"daily"}','{"meta":"lead generation+remarketing"}','{"email":"nurture-5-step","whatsapp":"diagnostic-followup"}','{"reels":6,"carousels":6,"articles":4}'),
(gen_random_uuid(),'M05-G3PEDIDOS','Mês 5 • G3Pedidos — Vendas externas',5,'Gerar oportunidades em distribuidores e atacado','BOFU','Distribuidores, atacado e equipes externas','Baixa produtividade e pedidos desconectados','Sua equipe vende. Sua operação acompanha.','Demonstração','Conhecer o G3Pedidos','g3pedidos','["LINKEDIN","GOOGLE_ADS","META_ADS","YOUTUBE","EMAIL"]','{"linkedin":12,"articles":4,"video":2}','{"google":"sales force+distribution search","meta":"video+lead gen"}','{"email":"sales-team-nurture","whatsapp":"demo-followup"}','{"linkedin":12,"videos":2,"articles":4,"carousels":4}'),
(gen_random_uuid(),'M06-G3CONTROL','Mês 6 • G3Control — Multilojas',6,'Gerar pipeline de multilojas','BOFU','Redes e empresas com múltiplas unidades','Informações fragmentadas entre lojas','Todas as suas lojas. Uma visão integrada.','Diagnóstico estratégico','Avaliar minha operação','multilojas','["LINKEDIN","GOOGLE_ADS","META_ADS","YOUTUBE","EMAIL"]','{"linkedin":12,"case":2,"articles":4}','{"google":"multistore management search","meta":"case+remarketing"}','{"email":"executive-nurture","whatsapp":"diagnostic-followup"}','{"case":2,"videos":2,"articles":4,"linkedin":12}')
ON CONFLICT(campaign_key) DO UPDATE SET name=EXCLUDED.name,objective=EXCLUDED.objective,funnel_stage=EXCLUDED.funnel_stage,audience=EXCLUDED.audience,pain=EXCLUDED.pain,message=EXCLUDED.message,offer=EXCLUDED.offer,cta=EXCLUDED.cta,landing_page_key=EXCLUDED.landing_page_key,channels=EXCLUDED.channels,organic_plan=EXCLUDED.organic_plan,paid_plan=EXCLUDED.paid_plan,relationship_plan=EXCLUDED.relationship_plan,content_mix=EXCLUDED.content_mix,updated_at=NOW();

INSERT INTO relationship_playbooks(id,key,name,module,trigger_type,objective,channel,steps,guardrails)
VALUES
(gen_random_uuid(),'NEW_LEAD','Novo lead — resposta imediata','Central de Atendimento','LEAD_CREATED','Responder, registrar origem e criar próximo passo','WHATSAPP','["Confirmar recebimento","Registrar origem/campanha/LP","Criar tarefa comercial","Enviar CTA adequado"]','["Consentimento quando marketing","Idempotência","Não duplicar contato"]'),
(gen_random_uuid(),'MQL_TO_SQL','MQL → SQL','Automação Comercial','LEAD_SCORE_THRESHOLD','Acelerar leads com intenção','CRM','["Atualizar score","Criar tarefa","Notificar responsável","Sequência de follow-up"]','["SLA comercial","Opt-out","Sem spam"]'),
(gen_random_uuid(),'DEMO_FOLLOWUP','Pós-demo','Automação Comercial','DEMO_COMPLETED','Remover objeções e avançar proposta','WHATSAPP','["D+1 resumo","D+3 objeções","D+7 próximo passo"]','["Consentimento","Parar sequência quando houver resposta"]'),
(gen_random_uuid(),'PROPOSAL_FOLLOWUP','Pós-proposta','Fidelidade e Crescimento','PROPOSAL_CREATED','Aumentar avanço de propostas','CRM','["D+1 confirmar recebimento","D+3 dúvida","D+7 decisão","Escalar para responsável"]','["Respeitar status do negócio","Não enviar após WON/LOST"]'),
(gen_random_uuid(),'DORMANT_LEAD','Lead parado','Inteligência Operacional','NO_ACTIVITY','Recuperar oportunidade sem atividade','EMAIL','["Detectar inatividade","Criar tarefa","Enviar conteúdo contextual","Encerrar ou reativar"]','["Janela configurável","Não insistir após opt-out"]'),
(gen_random_uuid(),'NPS_EXPERIENCE','Experiência e NPS','Experiência e NPS','CUSTOMER_MILESTONE','Medir satisfação e gerar insight','EMAIL','["Solicitar NPS","Classificar detrator/neutro/promotor","Criar ação","Registrar evidência"]','["Consentimento","Não manipular resposta"]'),
(gen_random_uuid(),'EXPANSION','Expansão e indicação','Fidelidade e Crescimento','CUSTOMER_SIGNAL','Criar expansão e indicação','CRM','["Detectar fit de expansão","Criar oportunidade","Solicitar indicação quando adequado"]','["Somente clientes elegíveis","Sem abordagem agressiva"]'),
(gen_random_uuid(),'CONTENT_PUBLISH','Publicação de conteúdo','Comunicação','CONTENT_APPROVED','Publicar e distribuir conteúdo aprovado','MULTI','["Agendar","Publicar","Registrar URL","Criar distribuição/remarketing"]','["Somente APPROVED","Versionar copy"]')
ON CONFLICT(key) DO UPDATE SET name=EXCLUDED.name,module=EXCLUDED.module,trigger_type=EXCLUDED.trigger_type,objective=EXCLUDED.objective,channel=EXCLUDED.channel,steps=EXCLUDED.steps,guardrails=EXCLUDED.guardrails,updated_at=NOW();

-- Six-month weekly skeleton: dates start on the Monday of the week containing 2026-08-17.
INSERT INTO growth_calendar_items(id,month_no,week_no,start_date,end_date,theme,campaign_key,funnel_stage,primary_objective,offer,cta,channels,deliverables)
VALUES
(gen_random_uuid(),1,1,'2026-08-17','2026-08-23','Posicionamento: Tecnologia que simplifica a gestão.','M01-POSICIONAMENTO','TOFU','Apresentar a tese central da G3Soft','Guia de gestão','Conhecer a G3Soft','["SEO","INSTAGRAM","LINKEDIN","META_ADS"]','{"instagram":"reel+carousel","linkedin":"authority","seo":"article","meta":"video"}'),
(gen_random_uuid(),1,2,'2026-08-24','2026-08-30','Dor: gestão fragmentada e excesso de complexidade.','M01-POSICIONAMENTO','TOFU','Criar identificação com a dor','Conteúdo educativo','Conhecer a G3Soft','["INSTAGRAM","FACEBOOK","LINKEDIN","YOUTUBE"]','{"reels":4,"shorts":2,"linkedin":3,"article":1}'),
(gen_random_uuid(),1,3,'2026-08-31','2026-09-06','Pilares: controle, integração e simplicidade.','M01-POSICIONAMENTO','MOFU','Levar para consideração','Diagnóstico','Descobrir minha solução','["SEO","INSTAGRAM","EMAIL","META_ADS"]','{"article":1,"reels":4,"email":1,"remarketing":"active"}'),
(gen_random_uuid(),1,4,'2026-09-07','2026-09-13','Descubra seu G3: diagnóstico interativo.','M01-POSICIONAMENTO','MOFU','Gerar primeiros leads','Diagnóstico','Descobrir minha solução','["SITE","META_ADS","INSTAGRAM","WHATSAPP"]','{"diagnostic":"active","reels":4,"stories":"daily"}'),
(gen_random_uuid(),2,5,'2026-09-14','2026-09-20','G3ERP: estoque + vendas para varejo.','M02-G3ERP-VAREJO','BOFU','Capturar intenção','Demonstração','Agendar demonstração','["GOOGLE_ADS","SEO","INSTAGRAM"]','{"lp":"g3erp","search":"active","reels":4}'),
(gen_random_uuid(),2,6,'2026-09-21','2026-09-27','Loja de roupas: vender mais e controlar melhor.','M02-G3ERP-VAREJO','BOFU','Atacar segmento prioritário','Demonstração','Agendar demonstração','["GOOGLE_ADS","META_ADS","INSTAGRAM","LINKEDIN"]','{"lp":"loja-de-roupas","search":"active","carousel":2,"reels":4}'),
(gen_random_uuid(),2,7,'2026-09-28','2026-10-04','Mercearias e mercados: operação sob controle.','M02-G3ERP-VAREJO','MOFU','Gerar consideração','Diagnóstico','Descobrir minha solução','["SEO","META_ADS","FACEBOOK","EMAIL"]','{"article":1,"reels":4,"email":1}'),
(gen_random_uuid(),2,8,'2026-10-05','2026-10-11','Remarketing G3ERP + recuperação de intenção.','M02-G3ERP-VAREJO','BOFU','Recuperar visitantes e leads','Demonstração','Retomar minha avaliação','["META_ADS","GOOGLE_ADS","WHATSAPP","EMAIL"]','{"remarketing":"active","followup":"active"}'),
(gen_random_uuid(),3,9,'2026-10-12','2026-10-18','G3Food: velocidade no atendimento.','M03-G3FOOD','BOFU','Gerar demanda Food Service','Demonstração','Conhecer o G3Food','["GOOGLE_ADS","INSTAGRAM","YOUTUBE"]','{"video":1,"reels":6,"search":"active"}'),
(gen_random_uuid(),3,10,'2026-10-19','2026-10-25','Restaurantes e bares: operação conectada.','M03-G3FOOD','BOFU','Converter segmento','Demonstração','Agendar demonstração','["GOOGLE_ADS","META_ADS","INSTAGRAM","FACEBOOK"]','{"lp":"bares-restaurantes","reels":6,"carousel":2}'),
(gen_random_uuid(),3,11,'2026-10-26','2026-11-01','Padarias e lanchonetes: simplicidade operacional.','M03-G3FOOD','MOFU','Criar identificação','Diagnóstico','Descobrir minha solução','["SEO","INSTAGRAM","FACEBOOK","EMAIL"]','{"article":1,"reels":4,"email":1}'),
(gen_random_uuid(),3,12,'2026-11-02','2026-11-08','Pós-demo e prova: dúvidas e próximos passos.','M03-G3FOOD','SQL','Acelerar oportunidades','Avaliação comercial','Falar com especialista','["CRM","WHATSAPP","EMAIL"]','{"followup":"D+1,D+3,D+7","sales":"active"}'),
(gen_random_uuid(),4,13,'2026-11-09','2026-11-15','G3Small: gestão sem complicação.','M04-G3SMALL','MOFU','Atrair pequenas empresas','Diagnóstico','Descobrir minha solução','["META_ADS","INSTAGRAM","FACEBOOK","SEO"]','{"reels":6,"article":1,"leadgen":"active"}'),
(gen_random_uuid(),4,14,'2026-11-16','2026-11-22','Hora de trocar planilha: sinais de maturidade.','M04-G3SMALL','TOFU','Criar consciência','Guia','Conhecer a G3Soft','["SEO","LINKEDIN","INSTAGRAM","YOUTUBE"]','{"article":1,"shorts":2,"reels":4}'),
(gen_random_uuid(),4,15,'2026-11-23','2026-11-29','Diagnóstico: qual solução combina com sua operação?','M04-G3SMALL','MOFU','Gerar leads','Diagnóstico','Quero conhecer minha solução','["SITE","META_ADS","WHATSAPP","EMAIL"]','{"diagnostic":"active","email":1,"reels":4}'),
(gen_random_uuid(),4,16,'2026-11-30','2026-12-06','Remarketing + recuperação de formulários.','M04-G3SMALL','BOFU','Recuperar intenção','Diagnóstico','Retomar minha avaliação','["META_ADS","GOOGLE_ADS","EMAIL","WHATSAPP"]','{"remarketing":"active","recovery":"active"}'),
(gen_random_uuid(),5,17,'2026-12-07','2026-12-13','G3Pedidos: força de vendas em campo.','M05-G3PEDIDOS','BOFU','Gerar demanda atacado/distribuição','Demonstração','Conhecer o G3Pedidos','["LINKEDIN","GOOGLE_ADS","YOUTUBE"]','{"linkedin":3,"video":1,"search":"active"}'),
(gen_random_uuid(),5,18,'2026-12-14','2026-12-20','Distribuidores: pedidos externos conectados.','M05-G3PEDIDOS','BOFU','Converter segmento','Demonstração','Agendar demonstração','["LINKEDIN","META_ADS","EMAIL","WHATSAPP"]','{"case":1,"linkedin":3,"email":1}'),
(gen_random_uuid(),5,19,'2026-12-21','2026-12-27','Conteúdo executivo: produtividade comercial.','M05-G3PEDIDOS','TOFU','Construir autoridade','Guia','Conhecer a G3Soft','["LINKEDIN","YOUTUBE","SEO"]','{"article":1,"shorts":2,"linkedin":3}'),
(gen_random_uuid(),5,20,'2026-12-28','2027-01-03','Reativação de pipeline e oportunidades.','M05-G3PEDIDOS','SQL','Recuperar pipeline','Avaliação comercial','Falar com especialista','["CRM","EMAIL","WHATSAPP","LINKEDIN"]','{"reactivation":"active","sales":"active"}'),
(gen_random_uuid(),6,21,'2027-01-04','2027-01-10','G3Control: visão de todas as lojas.','M06-G3CONTROL','BOFU','Gerar pipeline multilojas','Diagnóstico estratégico','Avaliar minha operação','["LINKEDIN","GOOGLE_ADS","META_ADS"]','{"lp":"multilojas","search":"active","linkedin":3}'),
(gen_random_uuid(),6,22,'2027-01-11','2027-01-17','Multilojas: decisão baseada em visão consolidada.','M06-G3CONTROL','MOFU','Educar decisores','Diagnóstico','Avaliar minha operação','["LINKEDIN","YOUTUBE","SEO","EMAIL"]','{"article":1,"video":1,"linkedin":3,"email":1}'),
(gen_random_uuid(),6,23,'2027-01-18','2027-01-24','Case/prova de gestão integrada.','M06-G3CONTROL','BOFU','Construir prova','Demonstração','Agendar demonstração','["LINKEDIN","META_ADS","YOUTUBE","EMAIL"]','{"case":1,"video":1,"remarketing":"active"}'),
(gen_random_uuid(),6,24,'2027-01-25','2027-01-31','Descubra seu G3: recomendação personalizada.','M06-G3CONTROL','MOFU','Gerar leads qualificados','Diagnóstico','Quero conhecer minha solução','["SITE","META_ADS","INSTAGRAM","WHATSAPP"]','{"diagnostic":"active","reels":6,"stories":"daily"}'),
(gen_random_uuid(),6,25,'2027-02-01','2027-02-07','Retomada de oportunidades e proposta de valor.','M06-G3CONTROL','SQL','Acelerar pipeline','Avaliação comercial','Falar com especialista','["CRM","WHATSAPP","EMAIL","REMARKETING"]','{"followup":"active","remarketing":"active"}'),
(gen_random_uuid(),6,26,'2027-02-08','2027-02-14','Otimização: vencedores dos 6 meses.','M06-G3CONTROL','OPTIMIZATION','Consolidar aprendizados e decidir próxima escala','Diagnóstico executivo','Avaliar minha operação','["CRM","SEO","GOOGLE_ADS","META_ADS","LINKEDIN"]','{"report":"6-month","winner-analysis":true,"next-roadmap":"draft"}')
ON CONFLICT(month_no,week_no) DO UPDATE SET theme=EXCLUDED.theme,campaign_key=EXCLUDED.campaign_key,funnel_stage=EXCLUDED.funnel_stage,primary_objective=EXCLUDED.primary_objective,offer=EXCLUDED.offer,cta=EXCLUDED.cta,channels=EXCLUDED.channels,deliverables=EXCLUDED.deliverables,updated_at=NOW();
