-- G3Soft Growth OS v1.0.1 — 180-day roadmap planning data
-- Additive/idempotent. Safe for production because it does not drop or reset data.
DO $$
DECLARE
  v_campaign_id UUID; v_admin UUID; v_manager UUID; v_stakeholder UUID; v_phase_id UUID; v_task_id UUID;
BEGIN
  SELECT id INTO v_campaign_id FROM campaigns WHERE name='G3Soft Growth Marketing 180 Dias' LIMIT 1;
  SELECT id INTO v_admin FROM users WHERE role='ADMIN' AND active=TRUE ORDER BY created_at LIMIT 1;
  SELECT id INTO v_manager FROM users WHERE role='MANAGER' AND active=TRUE ORDER BY created_at LIMIT 1;
  SELECT id INTO v_stakeholder FROM users WHERE role='STAKEHOLDER' AND active=TRUE ORDER BY created_at LIMIT 1;
  IF v_campaign_id IS NULL THEN RAISE EXCEPTION 'Campaign G3Soft Growth Marketing 180 Dias not found'; END IF;
  IF v_admin IS NULL OR v_manager IS NULL OR v_stakeholder IS NULL THEN RAISE EXCEPTION 'ADMIN, MANAGER and STAKEHOLDER users are required'; END IF;
  INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES(gen_random_uuid(),v_campaign_id,1,'Fundação','0–30 DIAS','2026-08-17','2026-09-15','Construir a base sólida para o crescimento.','#168BFF','PLANNED') ON CONFLICT(campaign_id,phase_order) DO NOTHING;
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=1;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Auditoria completa do site, SEO, anúncios e CRM' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Auditoria completa do site, SEO, anúncios e CRM','Atividade principal da fase Fundação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-08-17',0) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear site, páginas, formulários e conversões atuais',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear site, páginas, formulários e conversões atuais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Auditar SEO técnico, on-page e indexação',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Auditar SEO técnico, on-page e indexação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Inventariar campanhas, anúncios, públicos e investimentos',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Inventariar campanhas, anúncios, públicos e investimentos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Auditar CRM, fontes de leads e integrações existentes',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Auditar CRM, fontes de leads e integrações existentes');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Consolidar gaps, riscos e prioridades em diagnóstico executivo',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Consolidar gaps, riscos e prioridades em diagnóstico executivo');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Definição de ICP e personas' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Definição de ICP e personas','Atividade principal da fase Fundação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-08-23',1) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir segmentos prioritários e critérios de fit',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir segmentos prioritários e critérios de fit');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear decisores, influenciadores e usuários',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear decisores, influenciadores e usuários');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Documentar dores, necessidades, objeções e gatilhos',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Documentar dores, necessidades, objeções e gatilhos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir sinais de intenção e critérios de qualificação',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir sinais de intenção e critérios de qualificação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Validar ICP e personas com stakeholders',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Validar ICP e personas com stakeholders');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Estratégia de posicionamento e mensagens' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Estratégia de posicionamento e mensagens','Atividade principal da fase Fundação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-08-29',2) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir proposta de valor principal',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir proposta de valor principal');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir diferenciais competitivos e provas',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir diferenciais competitivos e provas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar mensagens por ICP e estágio do funil',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar mensagens por ICP e estágio do funil');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir argumentos para site, anúncios e vendas',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir argumentos para site, anúncios e vendas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Documentar guia de mensagens e tom comercial',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Documentar guia de mensagens e tom comercial');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Estruturação de analytics e dashboard' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Estruturação de analytics e dashboard','Atividade principal da fase Fundação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-09-03',3) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear funil de aquisição até receita',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear funil de aquisição até receita');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir eventos e conversões prioritárias',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir eventos e conversões prioritárias');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir nomenclatura e UTMs',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir nomenclatura e UTMs');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear KPIs, dimensões e fontes de dados',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear KPIs, dimensões e fontes de dados');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Validar dashboard executivo e rotina de leitura',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Validar dashboard executivo e rotina de leitura');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Implementação do CRM e integrações' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Implementação do CRM e integrações','Atividade principal da fase Fundação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-09-09',4) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir campos e etapas comerciais',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir campos e etapas comerciais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Padronizar cadastro de empresas, contatos e leads',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Padronizar cadastro de empresas, contatos e leads');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Configurar fontes e origem dos leads',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Configurar fontes e origem dos leads');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear integrações e responsabilidades',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear integrações e responsabilidades');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Executar teste ponta a ponta do fluxo comercial',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Executar teste ponta a ponta do fluxo comercial');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Plano de conteúdo e calendário editorial' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Plano de conteúdo e calendário editorial','Atividade principal da fase Fundação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-09-15',5) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir pilares editoriais',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir pilares editoriais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear temas por ICP e intenção',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear temas por ICP e intenção');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar matriz de formatos e canais',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar matriz de formatos e canais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Planejar calendário dos primeiros 30 dias',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Planejar calendário dos primeiros 30 dias');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir fluxo de produção, revisão e aprovação',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir fluxo de produção, revisão e aprovação');
  INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES(gen_random_uuid(),v_campaign_id,2,'Conversão','31–60 DIAS','2026-09-16','2026-10-15','Transformar tráfego em oportunidades.','#72C92B','PLANNED') ON CONFLICT(campaign_id,phase_order) DO NOTHING;
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=2;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Criação das primeiras landing pages' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Criação das primeiras landing pages','Atividade principal da fase Conversão. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-09-16',0) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir oferta e objetivo de cada landing page',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir oferta e objetivo de cada landing page');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar estrutura de headline, benefícios e prova',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar estrutura de headline, benefícios e prova');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Implementar formulário e CTA principal',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Implementar formulário e CTA principal');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Configurar tracking de conversão',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Configurar tracking de conversão');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Publicar e validar experiência mobile',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Publicar e validar experiência mobile');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Otimização de formulários e CTAs' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Otimização de formulários e CTAs','Atividade principal da fase Conversão. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-09-22',1) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear formulários atuais e pontos de abandono',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear formulários atuais e pontos de abandono');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Reduzir campos sem comprometer qualificação',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Reduzir campos sem comprometer qualificação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Padronizar microcopy e estados de erro',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Padronizar microcopy e estados de erro');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar CTAs por intenção e estágio',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar CTAs por intenção e estágio');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Instrumentar eventos de clique e envio',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Instrumentar eventos de clique e envio');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Implementação de WhatsApp integrado ao CRM' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Implementação de WhatsApp integrado ao CRM','Atividade principal da fase Conversão. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-09-28',2) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir pontos de entrada para WhatsApp',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir pontos de entrada para WhatsApp');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear identificação do lead e origem',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear identificação do lead e origem');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Registrar conversas e oportunidades no CRM',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Registrar conversas e oportunidades no CRM');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar handoff entre marketing e comercial',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar handoff entre marketing e comercial');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Testar fluxo completo de entrada até follow-up',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Testar fluxo completo de entrada até follow-up');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Fluxos de nutrição iniciais por e-mail e WhatsApp' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Fluxos de nutrição iniciais por e-mail e WhatsApp','Atividade principal da fase Conversão. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-10-03',3) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir segmentos de nutrição',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir segmentos de nutrição');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar sequência de boas-vindas',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar sequência de boas-vindas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar sequência de educação e prova',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar sequência de educação e prova');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar gatilho de intenção para vendas',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar gatilho de intenção para vendas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mensurar abertura, resposta, clique e avanço',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mensurar abertura, resposta, clique e avanço');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Campanhas Google Ads de alta intenção' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Campanhas Google Ads de alta intenção','Atividade principal da fase Conversão. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-10-09',4) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear palavras-chave de alta intenção',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear palavras-chave de alta intenção');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar grupos e mensagens por intenção',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar grupos e mensagens por intenção');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Configurar conversões e UTMs',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Configurar conversões e UTMs');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Publicar campanhas e validar tracking',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Publicar campanhas e validar tracking');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar rotina de otimização de termos e anúncios',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar rotina de otimização de termos e anúncios');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='A/B tests e otimizações contínuas' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'A/B tests e otimizações contínuas','Atividade principal da fase Conversão. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','MEDIUM',v_manager,v_stakeholder,v_admin,'2026-10-15',5) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Selecionar hipóteses de maior impacto',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Selecionar hipóteses de maior impacto');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir métrica primária e janela do teste',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir métrica primária e janela do teste');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar variações de páginas e CTAs',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar variações de páginas e CTAs');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Executar teste controlado',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Executar teste controlado');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Registrar resultado e decidir próxima iteração',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Registrar resultado e decidir próxima iteração');
  INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES(gen_random_uuid(),v_campaign_id,3,'Aquisição','61–90 DIAS','2026-10-16','2026-11-14','Aumentar o volume de leads qualificados.','#FFB000','PLANNED') ON CONFLICT(campaign_id,phase_order) DO NOTHING;
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=3;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Escala de campanhas Google Ads' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Escala de campanhas Google Ads','Atividade principal da fase Aquisição. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-10-16',0) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Identificar campanhas e grupos vencedores',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Identificar campanhas e grupos vencedores');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Redistribuir orçamento para intenção comprovada',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Redistribuir orçamento para intenção comprovada');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Expandir palavras e variações vencedoras',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Expandir palavras e variações vencedoras');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Ajustar lances e negativos',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Ajustar lances e negativos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Monitorar CAC, CPL e qualidade dos leads',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Monitorar CAC, CPL e qualidade dos leads');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Campanhas Meta Ads' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Campanhas Meta Ads','Atividade principal da fase Aquisição. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-10-23',1) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir públicos por estágio do funil',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir públicos por estágio do funil');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar criativos de descoberta e dor',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar criativos de descoberta e dor');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar anúncios de prova e conversão',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar anúncios de prova e conversão');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Configurar eventos e UTMs',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Configurar eventos e UTMs');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Rodar ciclos de teste e otimização',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Rodar ciclos de teste e otimização');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='SEO on-page e conteúdo estratégico' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'SEO on-page e conteúdo estratégico','Atividade principal da fase Aquisição. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-10-30',2) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Priorizar páginas e palavras-chave',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Priorizar páginas e palavras-chave');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Corrigir títulos, headings e links internos',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Corrigir títulos, headings e links internos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar clusters de conteúdo',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar clusters de conteúdo');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Publicar conteúdos orientados à intenção',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Publicar conteúdos orientados à intenção');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Monitorar indexação e evolução orgânica',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Monitorar indexação e evolução orgânica');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='YouTube: vídeos e cases' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'YouTube: vídeos e cases','Atividade principal da fase Aquisição. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','MEDIUM',v_manager,v_stakeholder,v_admin,'2026-11-07',3) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir pautas de vídeos por intenção',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir pautas de vídeos por intenção');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Roteirizar vídeos de demonstração',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Roteirizar vídeos de demonstração');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Produzir cases e provas',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Produzir cases e provas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Publicar com SEO e CTA',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Publicar com SEO e CTA');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Conectar vídeos ao funil e às landing pages',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Conectar vídeos ao funil e às landing pages');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Retargeting avançado e públicos semelhantes' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Retargeting avançado e públicos semelhantes','Atividade principal da fase Aquisição. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-11-14',4) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear públicos de visitantes e engajados',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear públicos de visitantes e engajados');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar janelas de retargeting',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar janelas de retargeting');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar públicos semelhantes quando houver volume',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar públicos semelhantes quando houver volume');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar mensagens por estágio de consciência',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar mensagens por estágio de consciência');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir incrementalidade e frequência',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir incrementalidade e frequência');
  INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES(gen_random_uuid(),v_campaign_id,4,'Otimização','91–120 DIAS','2026-11-15','2026-12-14','Transformar dados em eficiência e previsibilidade.','#A14DCC','PLANNED') ON CONFLICT(campaign_id,phase_order) DO NOTHING;
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=4;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Otimização de campanhas e segmentações' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Otimização de campanhas e segmentações','Atividade principal da fase Otimização. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-11-15',0) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Comparar performance por campanha, público e canal',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Comparar performance por campanha, público e canal');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Identificar desperdícios e gargalos',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Identificar desperdícios e gargalos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Revisar segmentações e exclusões',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Revisar segmentações e exclusões');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Realocar orçamento para eficiência',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Realocar orçamento para eficiência');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Documentar decisões e hipóteses',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Documentar decisões e hipóteses');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Lead scoring e qualificação automática' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Lead scoring e qualificação automática','Atividade principal da fase Otimização. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-11-21',1) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir atributos firmográficos e comportamentais',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir atributos firmográficos e comportamentais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar matriz de pontuação',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar matriz de pontuação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir MQL e SQL',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir MQL e SQL');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Automatizar mudança de estágio',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Automatizar mudança de estágio');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Validar qualidade dos leads com vendas',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Validar qualidade dos leads com vendas');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Análise de CAC, CPL, ROAS e conversões' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Análise de CAC, CPL, ROAS e conversões','Atividade principal da fase Otimização. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-11-27',2) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Consolidar investimento por canal',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Consolidar investimento por canal');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Calcular CPL e CAC por período',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Calcular CPL e CAC por período');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Calcular ROAS por campanha',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Calcular ROAS por campanha');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear conversões por etapa',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear conversões por etapa');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar rotina executiva de análise',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar rotina executiva de análise');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Ajustes em funis e ofertas' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Ajustes em funis e ofertas','Atividade principal da fase Otimização. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-12-02',3) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Identificar maior queda do funil',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Identificar maior queda do funil');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Revisar oferta e proposta de valor',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Revisar oferta e proposta de valor');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Testar prova, garantia e CTA',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Testar prova, garantia e CTA');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Otimizar handoffs marketing-vendas',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Otimizar handoffs marketing-vendas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir impacto sobre conversão',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir impacto sobre conversão');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Dashboards avançados e relatórios executivos' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Dashboards avançados e relatórios executivos','Atividade principal da fase Otimização. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-12-08',4) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir painéis por função',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir painéis por função');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar visão executiva semanal',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar visão executiva semanal');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar visão comercial do funil',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar visão comercial do funil');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar visão de mídia e conteúdo',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar visão de mídia e conteúdo');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Padronizar relatório e reunião de performance',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Padronizar relatório e reunião de performance');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Otimização de conteúdo e SEO técnico' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Otimização de conteúdo e SEO técnico','Atividade principal da fase Otimização. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','MEDIUM',v_manager,v_stakeholder,v_admin,'2026-12-14',5) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Auditar conteúdos com baixa performance',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Auditar conteúdos com baixa performance');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Atualizar conteúdos prioritários',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Atualizar conteúdos prioritários');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Corrigir links e estrutura técnica',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Corrigir links e estrutura técnica');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Melhorar Core Web Vitals quando aplicável',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Melhorar Core Web Vitals quando aplicável');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar backlog contínuo de SEO',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar backlog contínuo de SEO');
  INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES(gen_random_uuid(),v_campaign_id,5,'Automação','121–150 DIAS','2026-12-15','2027-01-13','Automatizar processos e aumentar eficiência comercial.','#1689A8','PLANNED') ON CONFLICT(campaign_id,phase_order) DO NOTHING;
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=5;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Fluxos de automação avançados' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Fluxos de automação avançados','Atividade principal da fase Automação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2026-12-15',0) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear gatilhos de alto volume',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear gatilhos de alto volume');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir condições e ações',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir condições e ações');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Automatizar distribuição de tarefas',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Automatizar distribuição de tarefas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Automatizar follow-ups e alertas',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Automatizar follow-ups e alertas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Monitorar falhas e exceções',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Monitorar falhas e exceções');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Sequências de nutrição inteligente' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Sequências de nutrição inteligente','Atividade principal da fase Automação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-12-21',1) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Segmentar por intenção e comportamento',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Segmentar por intenção e comportamento');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar sequências por estágio',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar sequências por estágio');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir gatilhos de avanço',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir gatilhos de avanço');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar regras de pausa e saída',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar regras de pausa e saída');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir avanço para oportunidade',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir avanço para oportunidade');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Recuperação de leads perdidos' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Recuperação de leads perdidos','Atividade principal da fase Automação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2026-12-27',2) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Classificar motivos de perda',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Classificar motivos de perda');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar públicos de recuperação',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar públicos de recuperação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar sequência de reativação',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar sequência de reativação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir gatilho de retorno ao comercial',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir gatilho de retorno ao comercial');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir taxa de recuperação',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir taxa de recuperação');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Integrações completas CRM + WhatsApp + E-mail' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Integrações completas CRM + WhatsApp + E-mail','Atividade principal da fase Automação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2027-01-01',3) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear eventos entre sistemas',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear eventos entre sistemas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Padronizar IDs e origem',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Padronizar IDs e origem');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Sincronizar mudanças de estágio',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Sincronizar mudanças de estágio');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Automatizar mensagens transacionais',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Automatizar mensagens transacionais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar monitoramento de falhas',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar monitoramento de falhas');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='IA para previsões e insights' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'IA para previsões e insights','Atividade principal da fase Automação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2027-01-07',4) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir indicadores para previsão',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir indicadores para previsão');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Preparar dados históricos',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Preparar dados históricos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar sinais de risco e oportunidade',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar sinais de risco e oportunidade');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Gerar recomendações para gestão',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Gerar recomendações para gestão');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Validar insights contra resultados reais',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Validar insights contra resultados reais');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Padronização de processo comercial' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Padronização de processo comercial','Atividade principal da fase Automação. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2027-01-13',5) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Documentar etapas e critérios',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Documentar etapas e critérios');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Padronizar handoffs',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Padronizar handoffs');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar checklists comerciais',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar checklists comerciais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir SLAs e responsabilidades',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir SLAs e responsabilidades');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Auditar aderência ao processo',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Auditar aderência ao processo');
  INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES(gen_random_uuid(),v_campaign_id,6,'Escala','151–180 DIAS','2027-01-14','2027-02-12','Escalar o que funciona e acelerar o crescimento.','#D92B52','PLANNED') ON CONFLICT(campaign_id,phase_order) DO NOTHING;
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=6;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Escala de campanhas Top Performers' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Escala de campanhas Top Performers','Atividade principal da fase Escala. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','CRITICAL',v_manager,v_stakeholder,v_admin,'2027-01-14',0) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Selecionar campanhas vencedoras',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Selecionar campanhas vencedoras');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir teto de escala por canal',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir teto de escala por canal');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Aumentar investimento progressivamente',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Aumentar investimento progressivamente');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Monitorar CAC e qualidade',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Monitorar CAC e qualidade');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar playbook de escala',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar playbook de escala');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Expansão de conteúdos e autoridade' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Expansão de conteúdos e autoridade','Atividade principal da fase Escala. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2027-01-20',1) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Mapear temas e formatos vencedores',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Mapear temas e formatos vencedores');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Aumentar cadência de produção',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Aumentar cadência de produção');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Expandir cases e provas sociais',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Expandir cases e provas sociais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Distribuir conteúdo em múltiplos canais',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Distribuir conteúdo em múltiplos canais');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir contribuição para demanda',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir contribuição para demanda');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Novos segmentos e regiões' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Novos segmentos e regiões','Atividade principal da fase Escala. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2027-01-26',2) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Selecionar segmentos adjacentes',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Selecionar segmentos adjacentes');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Validar potencial por dados',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Validar potencial por dados');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Adaptar mensagens e ofertas',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Adaptar mensagens e ofertas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Testar regiões prioritárias',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Testar regiões prioritárias');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Decidir expansão com critérios de CAC e conversão',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Decidir expansão com critérios de CAC e conversão');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Otimização de ofertas e precificação' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Otimização de ofertas e precificação','Atividade principal da fase Escala. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2027-01-31',3) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Analisar elasticidade e conversão',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Analisar elasticidade e conversão');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Testar pacotes e ofertas',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Testar pacotes e ofertas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Avaliar percepção de valor',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Avaliar percepção de valor');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir margem e CAC',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir margem e CAC');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Consolidar oferta vencedora',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Consolidar oferta vencedora');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Programa de indicação e prova social ativa' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Programa de indicação e prova social ativa','Atividade principal da fase Escala. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','MEDIUM',v_manager,v_stakeholder,v_admin,'2027-02-06',4) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir mecânica de indicação',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir mecânica de indicação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar incentivos e regras',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar incentivos e regras');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Estruturar coleta de depoimentos',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Estruturar coleta de depoimentos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Automatizar pedidos de indicação',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Automatizar pedidos de indicação');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Medir leads e vendas por indicação',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Medir leads e vendas por indicação');
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Planejamento para expansão contínua' LIMIT 1;
  IF v_task_id IS NULL THEN
    INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position) VALUES(gen_random_uuid(),v_phase_id,'Planejamento para expansão contínua','Atividade principal da fase Escala. Planejamento derivado do Roadmap de 180 Dias.','BACKLOG','HIGH',v_manager,v_stakeholder,v_admin,'2027-02-12',5) RETURNING id INTO v_task_id;
  END IF;
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Consolidar aprendizados dos 180 dias',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Consolidar aprendizados dos 180 dias');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Priorizar próximos investimentos',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Priorizar próximos investimentos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Atualizar roadmap e metas',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Atualizar roadmap e metas');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir novos experimentos',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir novos experimentos');
  INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Criar ciclo mensal de melhoria contínua',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Criar ciclo mensal de melhoria contínua');
  SELECT id INTO v_phase_id FROM phases WHERE campaign_id=v_campaign_id AND phase_order=1;
  SELECT id INTO v_task_id FROM tasks WHERE phase_id=v_phase_id AND title='Implementação de tracking e eventos' LIMIT 1;
  IF v_task_id IS NOT NULL THEN
    INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Definir eventos e parâmetros de tracking',FALSE,0,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Definir eventos e parâmetros de tracking');
    INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Implementar eventos de conversão prioritários',FALSE,1,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Implementar eventos de conversão prioritários');
    INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Validar UTMs e origem de tráfego',FALSE,2,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Validar UTMs e origem de tráfego');
    INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Executar testes ponta a ponta',FALSE,3,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Executar testes ponta a ponta');
    INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by) SELECT gen_random_uuid(),v_task_id,'Documentar o plano de mensuração',FALSE,4,v_manager WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=v_task_id AND title='Documentar o plano de mensuração');
  END IF;

  FOR v_phase_id IN SELECT id FROM phases WHERE campaign_id=v_campaign_id ORDER BY phase_order LOOP
    INSERT INTO calendar_events(id,campaign_id,phase_id,owner_id,title,description,event_type,start_at,end_at,location,status,created_by)
    SELECT gen_random_uuid(),v_campaign_id,v_phase_id,v_manager,
      'Marco — ' || p.name,
      'Início operacional da fase ' || p.name || ': ' || p.objective,
      'CAMPAIGN',
      (p.start_date::text || 'T13:00:00Z')::timestamptz,
      (p.start_date::text || 'T13:30:00Z')::timestamptz,
      'Growth OS','SCHEDULED',v_admin
    FROM phases p
    WHERE p.id=v_phase_id
      AND NOT EXISTS (SELECT 1 FROM calendar_events e WHERE e.title='Marco — ' || p.name AND e.start_at=(p.start_date::text || 'T13:00:00Z')::timestamptz);
    INSERT INTO calendar_events(id,campaign_id,phase_id,owner_id,title,description,event_type,start_at,end_at,location,status,created_by)
    SELECT gen_random_uuid(),v_campaign_id,v_phase_id,v_stakeholder,
      'Checkpoint — ' || p.name,
      'Checkpoint de encerramento da fase ' || p.name || '. Validar entregas, indicadores e próximos ajustes.',
      'DEADLINE',
      (p.end_date::text || 'T16:00:00Z')::timestamptz,
      (p.end_date::text || 'T16:30:00Z')::timestamptz,
      'Growth OS','SCHEDULED',v_admin
    FROM phases p
    WHERE p.id=v_phase_id
      AND NOT EXISTS (SELECT 1 FROM calendar_events e WHERE e.title='Checkpoint — ' || p.name AND e.start_at=(p.end_date::text || 'T16:00:00Z')::timestamptz);
  END LOOP;

  -- Keep the campaign channel catalog aligned with the roadmap's acquisition,
  -- content and commercial activities. Budgets remain zero until real investments are defined.
  INSERT INTO campaign_channels(id,campaign_id,channel,budget_cents)
  SELECT gen_random_uuid(),v_campaign_id,x.channel,0
  FROM (VALUES ('SEO'),('GOOGLE_ADS'),('META_ADS'),('YOUTUBE'),('LINKEDIN'),('EMAIL'),('WHATSAPP'),('ORGANIC'),('REFERRAL'),('PARTNERSHIP')) AS x(channel)
  WHERE NOT EXISTS (SELECT 1 FROM campaign_channels cc WHERE cc.campaign_id=v_campaign_id AND cc.channel=x.channel);

  UPDATE campaigns SET objective=COALESCE(NULLIF(objective,''),'Executar o roadmap de Growth Marketing em 180 dias, conectando estratégia, aquisição, conteúdo, comercial, automação e escala.'), target_segment=COALESCE(NULLIF(target_segment,''),'B2B — empresas que precisam estruturar aquisição, conversão e operação comercial com dados.'), updated_at=NOW() WHERE id=v_campaign_id;
END $$;
