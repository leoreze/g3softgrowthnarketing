const crypto = require('crypto');

const EXECUTION_TYPES = ['GENERAL','LANDING_PAGE','CONTENT','PAID_MEDIA','SEO','CRM','ANALYTICS','AUTOMATION','SALES'];
const EVIDENCE_TYPES = ['LINK','NOTE','IMAGE','DOCUMENT'];

const DEFAULTS = {
  GENERAL: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias para a execução estão concluídas.', true],
      ['Entregável registrado', 'O resultado efetivamente entregue está documentado na seção Entregável.', true]
    ],
    evidence: [['NOTE', 1, 'Registro de execução']]
  },
  LANDING_PAGE: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Responsividade validada', 'A página foi validada em desktop e mobile.', true],
      ['CTA e formulário validados', 'CTA, formulário e conversão foram testados.', true],
      ['Tracking validado', 'Eventos e conversões estão sendo registrados.', true],
      ['Entregável registrado', 'URL publicada e resultado final estão documentados.', true]
    ],
    evidence: [['LINK', 1, 'URL publicada'], ['IMAGE', 1, 'Screenshot da execução']]
  },
  CONTENT: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Copy revisada', 'Copy, CTA e mensagem foram revisados.', true],
      ['Criativo final validado', 'Arte, vídeo ou documento final está aprovado para publicação.', true],
      ['Entregável registrado', 'Resultado final está documentado.', true]
    ],
    evidence: [['IMAGE', 1, 'Criativo final'], ['DOCUMENT', 1, 'Material ou publicação']]
  },
  PAID_MEDIA: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Campanha configurada', 'Campanha, público, orçamento e criativos estão configurados.', true],
      ['Tracking validado', 'Eventos, UTMs e conversões foram testados.', true],
      ['Entregável registrado', 'Resultado e próximos passos estão documentados.', true]
    ],
    evidence: [['IMAGE', 1, 'Screenshot da plataforma'], ['LINK', 1, 'Campanha ou destino']]
  },
  SEO: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Checklist SEO concluído', 'Itens técnicos e on-page previstos foram validados.', true],
      ['Implementações validadas', 'As mudanças foram verificadas no ativo publicado.', true],
      ['Entregável registrado', 'Resultado e backlog residual estão documentados.', true]
    ],
    evidence: [['LINK', 1, 'Página auditada'], ['DOCUMENT', 1, 'Relatório ou checklist SEO']]
  },
  CRM: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Campos e etapas validados', 'Campos, pipeline e responsabilidades foram validados.', true],
      ['Fluxo ponta a ponta testado', 'O fluxo foi executado do lead até a atividade comercial.', true],
      ['Entregável registrado', 'Configuração e resultado do teste estão documentados.', true]
    ],
    evidence: [['IMAGE', 1, 'Screenshot do CRM'], ['NOTE', 1, 'Registro do teste ponta a ponta']]
  },
  ANALYTICS: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Eventos validados', 'Eventos e conversões prioritárias foram testados.', true],
      ['Dashboard validado', 'KPIs e fontes do dashboard foram conferidos.', true],
      ['Entregável registrado', 'Plano de mensuração e resultado final estão documentados.', true]
    ],
    evidence: [['IMAGE', 1, 'Dashboard validado'], ['DOCUMENT', 1, 'Plano de mensuração']]
  },
  AUTOMATION: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Gatilhos e ações validados', 'Gatilhos, condições e ações foram testados.', true],
      ['Tratamento de exceções validado', 'Falhas e exceções previstas possuem comportamento definido.', true],
      ['Entregável registrado', 'Fluxo final e resultado estão documentados.', true]
    ],
    evidence: [['IMAGE', 1, 'Screenshot do fluxo'], ['NOTE', 1, 'Resultado do teste']]
  },
  SALES: {
    criteria: [
      ['Microtarefas obrigatórias concluídas', 'Todas as microtarefas necessárias estão concluídas.', true],
      ['Processo comercial validado', 'Etapas, critérios e handoffs foram validados.', true],
      ['Teste comercial concluído', 'Um fluxo real ou controlado foi executado ponta a ponta.', true],
      ['Entregável registrado', 'Resultado e próximos passos estão documentados.', true]
    ],
    evidence: [['NOTE', 1, 'Registro comercial'], ['DOCUMENT', 1, 'Material ou proposta']]
  }
};

function normalizeType(value) {
  const type = String(value || 'GENERAL').toUpperCase();
  return EXECUTION_TYPES.includes(type) ? type : 'GENERAL';
}

function inferExecutionType(title = '') {
  const value = String(title).toLowerCase();
  if (/(landing|formul[aá]rio|cta)/i.test(value)) return 'LANDING_PAGE';
  if (/(conte[uú]do|youtube|reels|shorts|case|editorial)/i.test(value)) return 'CONTENT';
  if (/(google ads|meta ads|campanha|retargeting|m[ií]dia paga)/i.test(value)) return 'PAID_MEDIA';
  if (/(seo|search|org[aâ]nico)/i.test(value)) return 'SEO';
  if (/(crm|lead|pipeline|processo comercial|vendas|sales)/i.test(value)) return 'CRM';
  if (/(analytics|dashboard|cac|cpl|roas|m[eé]trica|kpi)/i.test(value)) return 'ANALYTICS';
  if (/(automa[cç][aã]o|whatsapp|e-mail|email|nutri[cç][aã]o|ia para)/i.test(value)) return 'AUTOMATION';
  if (/(oferta|precifica[cç][aã]o|indica[cç][aã]o)/i.test(value)) return 'SALES';
  return 'GENERAL';
}

async function ensureTaskAcceptance(client, taskId, executionType = 'GENERAL') {
  const type = normalizeType(executionType);
  const defaults = DEFAULTS[type] || DEFAULTS.GENERAL;
  for (let i = 0; i < defaults.criteria.length; i += 1) {
    const [title, description, required] = defaults.criteria[i];
    await client.query(`
      INSERT INTO task_acceptance_criteria(id,task_id,title,description,required,position)
      VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT (task_id,title) DO NOTHING
    `, [crypto.randomUUID(), taskId, title, description, required, i]);
  }
  for (const [evidenceType, minCount, label] of defaults.evidence) {
    await client.query(`
      INSERT INTO task_evidence_requirements(id,task_id,evidence_type,min_count,label)
      VALUES($1,$2,$3,$4,$5)
      ON CONFLICT (task_id,evidence_type) DO NOTHING
    `, [crypto.randomUUID(), taskId, evidenceType, minCount, label]);
  }
  return type;
}

async function getTaskReadiness(client, taskId) {
  const [taskResult, criteriaResult, requirementResult, evidenceResult, subtaskResult] = await Promise.all([
    client.query('SELECT id,deliverable,deliverable_status,execution_type FROM tasks WHERE id=$1', [taskId]),
    client.query('SELECT id,title,description,required,is_complete,completed_by,completed_at,position,system_key FROM task_acceptance_criteria WHERE task_id=$1 ORDER BY position,created_at', [taskId]),
    client.query('SELECT id,evidence_type,min_count,label FROM task_evidence_requirements WHERE task_id=$1 ORDER BY evidence_type', [taskId]),
    client.query('SELECT evidence_type,COUNT(*)::int count FROM task_evidence WHERE task_id=$1 GROUP BY evidence_type', [taskId]),
    client.query('SELECT COUNT(*)::int total,COUNT(*) FILTER (WHERE is_done)::int completed FROM task_subtasks WHERE task_id=$1', [taskId])
  ]);
  const task = taskResult.rows[0];
  if (!task) return null;
  const microtaskStats = subtaskResult.rows[0] || {total:0,completed:0};
  const criteria = criteriaResult.rows.map(item => item.system_key === 'MICROTASKS_COMPLETE' ? {...item, is_complete: microtaskStats.total === 0 || microtaskStats.completed === microtaskStats.total} : item);
  const requirements = requirementResult.rows;
  const evidenceCounts = Object.fromEntries(evidenceResult.rows.map(row => [row.evidence_type, row.count]));
  const deliverableReady = Boolean(String(task.deliverable || '').trim()) && ['SUBMITTED','APPROVED'].includes(task.deliverable_status);
  const normalizedCriteria = criteria.map(item => item.system_key === 'DELIVERABLE_PRESENT' ? {...item, is_complete: deliverableReady} : item);
  const requiredCriteria = normalizedCriteria.filter(item => item.required);
  const completedCriteria = requiredCriteria.filter(item => item.is_complete);
  const missingCriteria = requiredCriteria.filter(item => !item.is_complete);
  const evidenceChecks = requirements.map(item => ({
    ...item,
    actual_count: evidenceCounts[item.evidence_type] || 0,
    satisfied: (evidenceCounts[item.evidence_type] || 0) >= item.min_count
  }));
  const missingEvidence = evidenceChecks.filter(item => !item.satisfied);
  const criteriaReady = requiredCriteria.length > 0 && missingCriteria.length === 0;
  const evidenceReady = evidenceChecks.length > 0 && missingEvidence.length === 0;
  const scoreParts = [criteriaReady, evidenceReady, deliverableReady];
  const score = Math.round((scoreParts.filter(Boolean).length / scoreParts.length) * 100);
  return {
    execution_type: normalizeType(task.execution_type),
    score,
    ready: criteriaReady && evidenceReady && deliverableReady,
    criteria: {
      total: criteria.length,
      required: requiredCriteria.length,
      completed: completedCriteria.length,
      ready: criteriaReady,
      missing: missingCriteria
    },
    evidence: {
      requirements: evidenceChecks,
      ready: evidenceReady,
      missing: missingEvidence
    },
    deliverable: {
      ready: deliverableReady,
      status: task.deliverable_status,
      has_content: Boolean(String(task.deliverable || '').trim())
    }
  };
}

module.exports = { EXECUTION_TYPES, EVIDENCE_TYPES, DEFAULTS, normalizeType, inferExecutionType, ensureTaskAcceptance, getTaskReadiness };
