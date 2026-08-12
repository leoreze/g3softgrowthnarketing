const crypto = require('crypto');
const id = () => crypto.randomUUID();
const {inferExecutionType,ensureTaskAcceptance}=require('../services/task-acceptance');

const roadmap = [
  {
    name: 'Fundação', short: '0–30 DIAS', start: '2026-08-17', end: '2026-09-15', objective: 'Construir a base sólida para o crescimento.', color: '#168BFF',
    activities: [
      ['Auditoria completa do site, SEO, anúncios e CRM', 'CRITICAL', ['Mapear site, páginas, formulários e conversões atuais','Auditar SEO técnico, on-page e indexação','Inventariar campanhas, anúncios, públicos e investimentos','Auditar CRM, fontes de leads e integrações existentes','Consolidar gaps, riscos e prioridades em diagnóstico executivo']],
      ['Definição de ICP e personas', 'HIGH', ['Definir segmentos prioritários e critérios de fit','Mapear decisores, influenciadores e usuários','Documentar dores, necessidades, objeções e gatilhos','Definir sinais de intenção e critérios de qualificação','Validar ICP e personas com stakeholders']],
      ['Estratégia de posicionamento e mensagens', 'HIGH', ['Definir proposta de valor principal','Definir diferenciais competitivos e provas','Criar mensagens por ICP e estágio do funil','Definir argumentos para site, anúncios e vendas','Documentar guia de mensagens e tom comercial']],
      ['Estruturação de analytics e dashboard', 'HIGH', ['Mapear funil de aquisição até receita','Definir eventos e conversões prioritárias','Definir nomenclatura e UTMs','Mapear KPIs, dimensões e fontes de dados','Validar dashboard executivo e rotina de leitura']],
      ['Implementação do CRM e integrações', 'CRITICAL', ['Definir campos e etapas comerciais','Padronizar cadastro de empresas, contatos e leads','Configurar fontes e origem dos leads','Mapear integrações e responsabilidades','Executar teste ponta a ponta do fluxo comercial']],
      ['Plano de conteúdo e calendário editorial', 'HIGH', ['Definir pilares editoriais','Mapear temas por ICP e intenção','Criar matriz de formatos e canais','Planejar calendário dos primeiros 30 dias','Definir fluxo de produção, revisão e aprovação']]
    ]
  },
  {
    name: 'Conversão', short: '31–60 DIAS', start: '2026-09-16', end: '2026-10-15', objective: 'Transformar tráfego em oportunidades.', color: '#72C92B',
    activities: [
      ['Criação das primeiras landing pages', 'CRITICAL', ['Definir oferta e objetivo de cada landing page','Criar estrutura de headline, benefícios e prova','Implementar formulário e CTA principal','Configurar tracking de conversão','Publicar e validar experiência mobile']],
      ['Otimização de formulários e CTAs', 'HIGH', ['Mapear formulários atuais e pontos de abandono','Reduzir campos sem comprometer qualificação','Padronizar microcopy e estados de erro','Criar CTAs por intenção e estágio','Instrumentar eventos de clique e envio']],
      ['Implementação de WhatsApp integrado ao CRM', 'CRITICAL', ['Definir pontos de entrada para WhatsApp','Mapear identificação do lead e origem','Registrar conversas e oportunidades no CRM','Criar handoff entre marketing e comercial','Testar fluxo completo de entrada até follow-up']],
      ['Fluxos de nutrição iniciais por e-mail e WhatsApp', 'HIGH', ['Definir segmentos de nutrição','Criar sequência de boas-vindas','Criar sequência de educação e prova','Criar gatilho de intenção para vendas','Mensurar abertura, resposta, clique e avanço']],
      ['Campanhas Google Ads de alta intenção', 'HIGH', ['Mapear palavras-chave de alta intenção','Criar grupos e mensagens por intenção','Configurar conversões e UTMs','Publicar campanhas e validar tracking','Criar rotina de otimização de termos e anúncios']],
      ['A/B tests e otimizações contínuas', 'MEDIUM', ['Selecionar hipóteses de maior impacto','Definir métrica primária e janela do teste','Criar variações de páginas e CTAs','Executar teste controlado','Registrar resultado e decidir próxima iteração']]
    ]
  },
  {
    name: 'Aquisição', short: '61–90 DIAS', start: '2026-10-16', end: '2026-11-14', objective: 'Aumentar o volume de leads qualificados.', color: '#FFB000',
    activities: [
      ['Escala de campanhas Google Ads', 'CRITICAL', ['Identificar campanhas e grupos vencedores','Redistribuir orçamento para intenção comprovada','Expandir palavras e variações vencedoras','Ajustar lances e negativos','Monitorar CAC, CPL e qualidade dos leads']],
      ['Campanhas Meta Ads', 'HIGH', ['Definir públicos por estágio do funil','Criar criativos de descoberta e dor','Criar anúncios de prova e conversão','Configurar eventos e UTMs','Rodar ciclos de teste e otimização']],
      ['SEO on-page e conteúdo estratégico', 'HIGH', ['Priorizar páginas e palavras-chave','Corrigir títulos, headings e links internos','Criar clusters de conteúdo','Publicar conteúdos orientados à intenção','Monitorar indexação e evolução orgânica']],
      ['YouTube: vídeos e cases', 'MEDIUM', ['Definir pautas de vídeos por intenção','Roteirizar vídeos de demonstração','Produzir cases e provas','Publicar com SEO e CTA','Conectar vídeos ao funil e às landing pages']],
      ['Retargeting avançado e públicos semelhantes', 'HIGH', ['Mapear públicos de visitantes e engajados','Criar janelas de retargeting','Criar públicos semelhantes quando houver volume','Criar mensagens por estágio de consciência','Medir incrementalidade e frequência']]
    ]
  },
  {
    name: 'Otimização', short: '91–120 DIAS', start: '2026-11-15', end: '2026-12-14', objective: 'Transformar dados em eficiência e previsibilidade.', color: '#A14DCC',
    activities: [
      ['Otimização de campanhas e segmentações', 'HIGH', ['Comparar performance por campanha, público e canal','Identificar desperdícios e gargalos','Revisar segmentações e exclusões','Realocar orçamento para eficiência','Documentar decisões e hipóteses']],
      ['Lead scoring e qualificação automática', 'CRITICAL', ['Definir atributos firmográficos e comportamentais','Criar matriz de pontuação','Definir MQL e SQL','Automatizar mudança de estágio','Validar qualidade dos leads com vendas']],
      ['Análise de CAC, CPL, ROAS e conversões', 'CRITICAL', ['Consolidar investimento por canal','Calcular CPL e CAC por período','Calcular ROAS por campanha','Mapear conversões por etapa','Criar rotina executiva de análise']],
      ['Ajustes em funis e ofertas', 'HIGH', ['Identificar maior queda do funil','Revisar oferta e proposta de valor','Testar prova, garantia e CTA','Otimizar handoffs marketing-vendas','Medir impacto sobre conversão']],
      ['Dashboards avançados e relatórios executivos', 'HIGH', ['Definir painéis por função','Criar visão executiva semanal','Criar visão comercial do funil','Criar visão de mídia e conteúdo','Padronizar relatório e reunião de performance']],
      ['Otimização de conteúdo e SEO técnico', 'MEDIUM', ['Auditar conteúdos com baixa performance','Atualizar conteúdos prioritários','Corrigir links e estrutura técnica','Melhorar Core Web Vitals quando aplicável','Criar backlog contínuo de SEO']]
    ]
  },
  {
    name: 'Automação', short: '121–150 DIAS', start: '2026-12-15', end: '2027-01-13', objective: 'Automatizar processos e aumentar eficiência comercial.', color: '#1689A8',
    activities: [
      ['Fluxos de automação avançados', 'CRITICAL', ['Mapear gatilhos de alto volume','Definir condições e ações','Automatizar distribuição de tarefas','Automatizar follow-ups e alertas','Monitorar falhas e exceções']],
      ['Sequências de nutrição inteligente', 'HIGH', ['Segmentar por intenção e comportamento','Criar sequências por estágio','Definir gatilhos de avanço','Criar regras de pausa e saída','Medir avanço para oportunidade']],
      ['Recuperação de leads perdidos', 'HIGH', ['Classificar motivos de perda','Criar públicos de recuperação','Criar sequência de reativação','Definir gatilho de retorno ao comercial','Medir taxa de recuperação']],
      ['Integrações completas CRM + WhatsApp + E-mail', 'CRITICAL', ['Mapear eventos entre sistemas','Padronizar IDs e origem','Sincronizar mudanças de estágio','Automatizar mensagens transacionais','Criar monitoramento de falhas']],
      ['IA para previsões e insights', 'HIGH', ['Definir indicadores para previsão','Preparar dados históricos','Criar sinais de risco e oportunidade','Gerar recomendações para gestão','Validar insights contra resultados reais']],
      ['Padronização de processo comercial', 'HIGH', ['Documentar etapas e critérios','Padronizar handoffs','Criar checklists comerciais','Definir SLAs e responsabilidades','Auditar aderência ao processo']]
    ]
  },
  {
    name: 'Escala', short: '151–180 DIAS', start: '2027-01-14', end: '2027-02-12', objective: 'Escalar o que funciona e acelerar o crescimento.', color: '#D92B52',
    activities: [
      ['Escala de campanhas Top Performers', 'CRITICAL', ['Selecionar campanhas vencedoras','Definir teto de escala por canal','Aumentar investimento progressivamente','Monitorar CAC e qualidade','Criar playbook de escala']],
      ['Expansão de conteúdos e autoridade', 'HIGH', ['Mapear temas e formatos vencedores','Aumentar cadência de produção','Expandir cases e provas sociais','Distribuir conteúdo em múltiplos canais','Medir contribuição para demanda']],
      ['Novos segmentos e regiões', 'HIGH', ['Selecionar segmentos adjacentes','Validar potencial por dados','Adaptar mensagens e ofertas','Testar regiões prioritárias','Decidir expansão com critérios de CAC e conversão']],
      ['Otimização de ofertas e precificação', 'HIGH', ['Analisar elasticidade e conversão','Testar pacotes e ofertas','Avaliar percepção de valor','Medir margem e CAC','Consolidar oferta vencedora']],
      ['Programa de indicação e prova social ativa', 'MEDIUM', ['Definir mecânica de indicação','Criar incentivos e regras','Estruturar coleta de depoimentos','Automatizar pedidos de indicação','Medir leads e vendas por indicação']],
      ['Planejamento para expansão contínua', 'HIGH', ['Consolidar aprendizados dos 180 dias','Priorizar próximos investimentos','Atualizar roadmap e metas','Definir novos experimentos','Criar ciclo mensal de melhoria contínua']]
    ]
  }
];

function addDays(dateString, days) {
  const d = new Date(`${dateString}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function getOrCreatePhase(client, campaignId, phase, index, adminId) {
  const found = await client.query('SELECT id FROM phases WHERE campaign_id=$1 AND phase_order=$2', [campaignId, index + 1]);
  if (found.rowCount) return found.rows[0].id;
  const phaseId = id();
  await client.query(`INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,'PLANNED')`, [phaseId, campaignId, index + 1, phase.name, phase.short, phase.start, phase.end, phase.objective, phase.color]);
  return phaseId;
}

function taskExecutionSpec(phase, title, microtasks) {
  const execution_plan = `Executar de forma sequencial e documentada: ${microtasks.join('; ')}. Ao final, reunir evidências, revisar o resultado com o responsável/revisor e registrar decisões, pendências e próximos passos no Growth OS.`;
  const t = title.toLowerCase();
  let deliverable = `Entregável operacional da tarefa “${title}”, validado pelo responsável e registrado no Growth OS.`;
  if (t.includes('auditoria')) deliverable='Diagnóstico executivo de Growth com inventário de ativos, gaps priorizados, riscos, evidências e backlog de correções.';
  else if (t.includes('icp') || t.includes('personas')) deliverable='Documento validado de ICP e personas, com critérios de fit, decisores, dores, objeções e sinais de intenção.';
  else if (t.includes('posicionamento')) deliverable='Guia de posicionamento e mensagens por ICP e estágio do funil, pronto para uso em site, mídia e vendas.';
  else if (t.includes('analytics') || t.includes('dashboard')) deliverable='Plano de mensuração e dashboard executivo com eventos, UTMs, KPIs, fontes e rotina de leitura.';
  else if (t.includes('crm') && t.includes('integrações')) deliverable='CRM configurado com campos, etapas, origens, responsabilidades e fluxo ponta a ponta validado.';
  else if (t.includes('conteúdo') && t.includes('calendário')) deliverable='Calendário editorial inicial com pilares, temas, formatos, canais, responsáveis e fluxo de aprovação.';
  else if (t.includes('landing')) deliverable='Landing pages publicadas, responsivas e rastreadas, com oferta, prova, formulário e CTA validados.';
  else if (t.includes('formulários') || t.includes('ctas')) deliverable='Formulários e CTAs otimizados, instrumentados e validados com redução de fricção e critérios de qualificação.';
  else if (t.includes('whatsapp')) deliverable='Fluxo WhatsApp + CRM operacional, com origem identificada, handoff comercial e teste ponta a ponta concluído.';
  else if (t.includes('nutrição')) deliverable='Sequências de nutrição publicadas e mensuradas, com segmentos, gatilhos, critérios de saída e passagem para vendas.';
  else if (t.includes('google ads')) deliverable='Campanhas Google Ads configuradas/publicadas com estrutura por intenção, conversões, UTMs e rotina de otimização.';
  else if (t.includes('a/b')) deliverable='Relatório de experimentos com hipóteses, métricas, variações, resultados e decisão da próxima iteração.';
  else if (t.includes('meta ads')) deliverable='Estrutura de Meta Ads ativa com públicos, criativos, eventos, UTMs e ciclos de teste documentados.';
  else if (t.includes('seo')) deliverable='Plano/implementação de SEO com páginas prioritárias, correções on-page/técnicas, conteúdos e backlog contínuo.';
  else if (t.includes('youtube')) deliverable='Pacote de vídeos/cases publicado com SEO, CTA e conexão mensurável com o funil e landing pages.';
  else if (t.includes('retargeting') || t.includes('públicos semelhantes')) deliverable='Estrutura de remarketing e públicos semelhantes configurada, segmentada por estágio e com medição de incrementalidade.';
  else if (t.includes('lead scoring')) deliverable='Modelo de lead scoring e qualificação automática implementado, com critérios MQL/SQL e validação junto a vendas.';
  else if (t.includes('cac') || t.includes('cpl') || t.includes('roas')) deliverable='Relatório executivo de eficiência com CAC, CPL, ROAS e conversões por canal/período, incluindo decisões recomendadas.';
  else if (t.includes('funis e ofertas')) deliverable='Funil e oferta revisados, com gargalos priorizados, testes de proposta/CTA e impacto de conversão medido.';
  else if (t.includes('automação')) deliverable='Fluxos de automação configurados, testados e monitorados, com gatilhos, condições, ações e tratamento de exceções.';
  else if (t.includes('recuperação de leads')) deliverable='Playbook de recuperação de leads perdidos com segmentação, sequência, gatilhos e taxa de recuperação monitorada.';
  else if (t.includes('integrações completas')) deliverable='Integração CRM + WhatsApp + E-mail validada, com IDs padronizados, sincronização de estágios e monitoramento de falhas.';
  else if (t.includes('ia para previsões')) deliverable='Protótipo de insights preditivos com sinais de risco/oportunidade, recomendações e validação contra resultados reais.';
  else if (t.includes('padronização de processo')) deliverable='Playbook comercial padronizado com etapas, critérios, handoffs, checklists, SLAs e rotina de auditoria.';
  else if (t.includes('escala de campanhas')) deliverable='Playbook de escala das campanhas vencedoras com limites de investimento, monitoramento de CAC/qualidade e critérios de expansão.';
  else if (t.includes('expansão de conteúdos')) deliverable='Plano de expansão de conteúdo e autoridade com temas vencedores, cadência, distribuição e medição de demanda.';
  else if (t.includes('novos segmentos') || t.includes('regiões')) deliverable='Plano de expansão validado por dados, com segmentos/regiões prioritários, mensagens, ofertas, testes e critérios de CAC/conversão.';
  else if (t.includes('precificação') || t.includes('ofertas')) deliverable='Oferta/precificação testada e consolidada com evidências de conversão, percepção de valor, margem e CAC.';
  else if (t.includes('indicação') || t.includes('prova social')) deliverable='Programa de indicação e prova social operacional, com incentivos, coleta de depoimentos, automação e métricas de origem.';
  else if (t.includes('planejamento para expansão')) deliverable='Roadmap pós-180 dias atualizado com aprendizados, investimentos prioritários, metas, experimentos e ciclo mensal de melhoria.';
  return {execution_plan, deliverable};
}

async function seedRoadmap() {
  const pool = require('./pool');
  const env = require('../config/env');
  if (env.isProduction) throw new Error('db:seed:roadmap is blocked in production. Use an explicit non-production environment.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const campaignResult = await client.query('SELECT id FROM campaigns WHERE name=$1', ['G3Soft Growth Marketing 180 Dias']);
    if (!campaignResult.rowCount) throw new Error('Campanha base "G3Soft Growth Marketing 180 Dias" não encontrada. Execute db:seed primeiro.');
    const campaignId = campaignResult.rows[0].id;
    const users = await client.query("SELECT id,role FROM users WHERE role IN ('ADMIN','MANAGER','STAKEHOLDER') AND active=TRUE");
    const byRole = Object.fromEntries(users.rows.map(u => [u.role, u.id]));
    if (!byRole.ADMIN || !byRole.MANAGER || !byRole.STAKEHOLDER) throw new Error('Usuários ADMIN, MANAGER e STAKEHOLDER são necessários. Execute db:seed primeiro.');

    let parentCount = 0;
    let subtaskCount = 0;
    for (let pi = 0; pi < roadmap.length; pi++) {
      const phase = roadmap[pi];
      const phaseId = await getOrCreatePhase(client, campaignId, phase, pi, byRole.ADMIN);
      const phaseSpan = Math.max(1, Math.floor((new Date(`${phase.end}T12:00:00Z`) - new Date(`${phase.start}T12:00:00Z`)) / 86400000));
      for (let ti = 0; ti < phase.activities.length; ti++) {
        const [title, priority, microtasks] = phase.activities[ti];
        const existing = await client.query('SELECT id FROM tasks WHERE phase_id=$1 AND title=$2', [phaseId, title]);
        let taskId;
        if (existing.rowCount) {
          taskId = existing.rows[0].id;
        } else {
          taskId = id();
          const offset = Math.min(phaseSpan, Math.floor((ti / Math.max(1, phase.activities.length - 1)) * phaseSpan));
          const due = addDays(phase.start, offset);
          const spec = taskExecutionSpec(phase.name, title, microtasks);
          await client.query(`INSERT INTO tasks(id,phase_id,title,description,status,priority,assignee_id,reviewer_id,created_by,due_date,position,execution_plan,deliverable)
            VALUES($1,$2,$3,$4,'BACKLOG',$5,$6,$7,$8,$9,$10,$11,$12)`, [taskId, phaseId, title, `Atividade principal da fase ${phase.name}. Planejamento derivado do Roadmap de 180 Dias.`, priority, byRole.MANAGER, byRole.STAKEHOLDER, byRole.ADMIN, due, ti, spec.execution_plan, spec.deliverable]);
          parentCount++;
        }
        const spec = taskExecutionSpec(phase.name, title, microtasks);
        const executionType = inferExecutionType(title);
        await client.query(`UPDATE tasks SET execution_plan=COALESCE(execution_plan,$1), deliverable=COALESCE(deliverable,$2), execution_type=CASE WHEN execution_type='GENERAL' THEN $3 ELSE execution_type END, updated_at=NOW() WHERE id=$4`, [spec.execution_plan, spec.deliverable, executionType, taskId]);
        await ensureTaskAcceptance(client, taskId, executionType);
        for (let si = 0; si < microtasks.length; si++) {
          const subTitle = microtasks[si];
          const exists = await client.query('SELECT id FROM task_subtasks WHERE task_id=$1 AND title=$2', [taskId, subTitle]);
          if (!exists.rowCount) {
            await client.query(`INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by)
              VALUES($1,$2,$3,FALSE,$4,$5)`, [id(), taskId, subTitle, si, byRole.MANAGER]);
            subtaskCount++;
          }
        }
      }
    }

    // Supporting technical task already present in the base seed: give it the same
    // microtask treatment without turning it into an additional principal activity.
    const trackingPhase = await client.query('SELECT id FROM phases WHERE campaign_id=$1 AND phase_order=1', [campaignId]);
    if (trackingPhase.rowCount) {
      const trackingTask = await client.query('SELECT id FROM tasks WHERE phase_id=$1 AND title=$2', [trackingPhase.rows[0].id, 'Implementação de tracking e eventos']);
      if (trackingTask.rowCount) {
        const microtasks = ['Definir eventos e parâmetros de tracking','Implementar eventos de conversão prioritários','Validar UTMs e origem de tráfego','Executar testes ponta a ponta','Documentar o plano de mensuração'];
        for (let si = 0; si < microtasks.length; si++) {
          await client.query(`INSERT INTO task_subtasks(id,task_id,title,is_done,position,created_by)
            SELECT $1,$2,$3,FALSE,$4,$5 WHERE NOT EXISTS (SELECT 1 FROM task_subtasks WHERE task_id=$2 AND title=$3)`, [id(), trackingTask.rows[0].id, microtasks[si], si, byRole.MANAGER]);
          subtaskCount++;
        }
      }
    }

    // Add phase milestone events so the 180-day plan is visible immediately in the Professional Calendar.
    for (let pi = 0; pi < roadmap.length; pi++) {
      const phase = roadmap[pi];
      const phaseResult = await client.query('SELECT id FROM phases WHERE campaign_id=$1 AND phase_order=$2', [campaignId, pi + 1]);
      const phaseId = phaseResult.rows[0].id;
      const title = `Marco — ${phase.name}`;
      const start = `${phase.start}T13:00:00Z`;
      const exists = await client.query('SELECT 1 FROM calendar_events WHERE title=$1 AND start_at=$2', [title, start]);
      if (!exists.rowCount) {
        await client.query(`INSERT INTO calendar_events(id,campaign_id,phase_id,owner_id,title,description,event_type,start_at,end_at,location,status,created_by)
          VALUES($1,$2,$3,$4,$5,$6,'CAMPAIGN',$7,$8,$9,'SCHEDULED',$10)`, [id(), campaignId, phaseId, byRole.MANAGER, title, `Início operacional da fase ${phase.name}: ${phase.objective}`, start, `${phase.start}T13:30:00Z`, 'Growth OS', byRole.ADMIN]);
      }
      const endTitle = `Checkpoint — ${phase.name}`;
      const endStart = `${phase.end}T16:00:00Z`;
      const endExists = await client.query('SELECT 1 FROM calendar_events WHERE title=$1 AND start_at=$2', [endTitle, endStart]);
      if (!endExists.rowCount) {
        await client.query(`INSERT INTO calendar_events(id,campaign_id,phase_id,owner_id,title,description,event_type,start_at,end_at,location,status,created_by)
          VALUES($1,$2,$3,$4,$5,$6,'DEADLINE',$7,$8,$9,'SCHEDULED',$10)`, [id(), campaignId, phaseId, byRole.STAKEHOLDER, endTitle, `Checkpoint de encerramento da fase ${phase.name}. Validar entregas, indicadores e próximos ajustes.`, endStart, `${phase.end}T16:30:00Z`, 'Growth OS', byRole.ADMIN]);
      }
    }

    await client.query('UPDATE campaigns SET objective=$1, target_segment=$2, updated_at=NOW() WHERE id=$3', ['Executar o roadmap de Growth Marketing em 180 dias, conectando estratégia, aquisição, conteúdo, comercial, automação e escala.', 'B2B — empresas que precisam estruturar aquisição, conversão e operação comercial com dados.', campaignId]);
    await client.query('COMMIT');
    console.log(`Roadmap 180 dias populado: ${roadmap.length} fases, ${parentCount} novas tarefas principais, ${subtaskCount} novas microtarefas.`);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

if (require.main === module) seedRoadmap().catch(e => { console.error(e.message); process.exitCode = 1; }).finally(() => pool.end());
module.exports = { seedRoadmap, roadmap };
