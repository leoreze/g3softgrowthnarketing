
const crypto = require('crypto');

const DIMENSIONS = [
  {
    key: 'MARCA_PRESENCA',
    name: 'Marca e presença digital',
    weight: 10,
    criteria: [
      ['marca_clara','Posicionamento e proposta de valor claros','P1'],
      ['presenca_google','Presença e identidade de marca no Google','P1'],
      ['canais_digitais','Ecossistema digital mapeado e consistente','P2'],
      ['prova_social','Prova social, autoridade e reputação','P1']
    ]
  },
  {
    key: 'SITE_CRO',
    name: 'Site, experiência e conversão',
    weight: 12,
    criteria: [
      ['arquitetura_site','Arquitetura de páginas orientada a intenção','P1'],
      ['ctas','CTAs e caminhos de conversão claros','P0'],
      ['formularios','Formulários e captura de leads','P0'],
      ['ux_mobile','Experiência mobile e usabilidade','P1'],
      ['landing_pages','Landing pages comerciais por oferta/segmento','P1']
    ]
  },
  {
    key: 'SEO',
    name: 'SEO técnico e on-page',
    weight: 12,
    criteria: [
      ['indexacao','Indexação, sitemap e rastreamento','P0'],
      ['seo_tecnico','SEO técnico, performance e arquitetura','P1'],
      ['seo_onpage','Títulos, descrições, headings e conteúdo','P1'],
      ['seo_intencao','Cobertura de palavras-chave por intenção','P1'],
      ['seo_segmentos','Páginas por segmento e problema','P1']
    ]
  },
  {
    key: 'CONTEUDO_SOCIAL',
    name: 'Conteúdo e redes sociais',
    weight: 10,
    criteria: [
      ['instagram','Instagram: estratégia, frequência e conversão','P2'],
      ['facebook','Facebook: estratégia, frequência e conversão','P2'],
      ['linkedin','LinkedIn: autoridade B2B e geração de demanda','P1'],
      ['youtube','YouTube: canal oficial, SEO e demonstrações','P2'],
      ['repurpose','Repurpose de conteúdo entre canais','P2']
    ]
  },
  {
    key: 'MIDIA_PAGA',
    name: 'Mídia paga e aquisição',
    weight: 12,
    criteria: [
      ['google_ads','Google Ads: estrutura e intenção','P0'],
      ['meta_ads','Meta Ads: campanhas e públicos','P1'],
      ['linkedin_ads','LinkedIn Ads: presença e estratégia B2B','P2'],
      ['investimentos','Investimentos e orçamento por canal','P0'],
      ['roas_cac','CAC, CPL, ROAS e eficiência','P0']
    ]
  },
  {
    key: 'CRM_LEADS',
    name: 'CRM, leads e vendas',
    weight: 14,
    criteria: [
      ['crm','CRM identificado e pipeline estruturado','P0'],
      ['fontes_leads','Fontes de leads identificadas','P0'],
      ['atribuicao','Atribuição de origem até oportunidade','P0'],
      ['sla_comercial','SLA e distribuição de leads','P1'],
      ['receita','Conversão de oportunidade em receita','P0']
    ]
  },
  {
    key: 'ANALYTICS_TRACKING',
    name: 'Analytics e mensuração',
    weight: 12,
    criteria: [
      ['ga4','GA4 configurado e validado','P0'],
      ['gtm','Google Tag Manager e eventos','P0'],
      ['search_console','Search Console e dados de busca','P0'],
      ['conversoes','Conversões e microconversões instrumentadas','P0'],
      ['utm','UTMs e padrão de campanha','P1']
    ]
  },
  {
    key: 'AUTOMACAO',
    name: 'Automação e jornada',
    weight: 8,
    criteria: [
      ['automacoes','Automações de marketing e operação','P1'],
      ['nutricao','Nutrição e follow-up de leads','P1'],
      ['integracoes','Integrações entre canais e sistemas','P0'],
      ['alertas','Alertas e recuperação de oportunidades','P2']
    ]
  },
  {
    key: 'COMERCIAL',
    name: 'Estratégia comercial',
    weight: 6,
    criteria: [
      ['segmentacao','Segmentação por produto e ICP','P1'],
      ['oferta','Ofertas, argumentos e diferenciais','P1'],
      ['funil','Funil comercial e critérios de qualificação','P0'],
      ['cases','Cases e evidências de resultado','P1']
    ]
  },
  {
    key: 'DADOS_GOVERNANCA',
    name: 'Dados, governança e execução',
    weight: 4,
    criteria: [
      ['dados_confiaveis','Dados confiáveis e fontes documentadas','P1'],
      ['responsaveis','Responsáveis e revisores definidos','P1'],
      ['priorizacao','Backlog priorizado por impacto','P1'],
      ['revisao','Cadência de revisão e decisões registradas','P2']
    ]
  }
];

function clampScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
}

function maturity(score) {
  if (score >= 90) return { key: 'EXCELENTE', label: 'Excelente' };
  if (score >= 75) return { key: 'AVANCADO', label: 'Avançado' };
  if (score >= 60) return { key: 'ESTRUTURADO', label: 'Estruturado' };
  if (score >= 40) return { key: 'EM_DESENVOLVIMENTO', label: 'Em desenvolvimento' };
  return { key: 'CRITICO', label: 'Crítico' };
}

function calculateScore(rows) {
  const byDim = new Map();
  for (const d of DIMENSIONS) byDim.set(d.key, []);
  for (const row of rows) {
    if (!byDim.has(row.dimension_key)) byDim.set(row.dimension_key, []);
    byDim.get(row.dimension_key).push(row);
  }
  let weighted = 0;
  let totalWeight = 0;
  const dimensions = [];
  for (const d of DIMENSIONS) {
    const items = byDim.get(d.key) || [];
    const avg = items.length ? items.reduce((s, x) => s + clampScore(x.score), 0) / items.length : 0;
    weighted += avg * d.weight;
    totalWeight += d.weight;
    dimensions.push({
      key: d.key,
      name: d.name,
      weight: d.weight,
      score: Math.round(avg * 20),
      maturity: maturity(avg * 20).label,
      assessed: items.filter(x => String(x.status) === 'VALIDADO').length,
      total: items.length
    });
  }
  const overall = totalWeight ? Math.round((weighted / (totalWeight * 5)) * 100) : 0;
  return { overall, maturity: maturity(overall), dimensions };
}

function defaultAssessments() {
  const rows = [];
  for (const d of DIMENSIONS) {
    for (const [key, name, priority] of d.criteria) {
      rows.push({
        id: crypto.randomUUID(),
        dimension_key: d.key,
        dimension_name: d.name,
        criterion_key: key,
        criterion_name: name,
        weight: d.weight / d.criteria.length,
        score: 0,
        status: 'PENDENTE',
        evidence: null,
        notes: null,
        priority
      });
    }
  }
  return rows;
}

function diagnosticContext(diagnostic, assessments, actions) {
  const score = calculateScore(assessments);
  return {
    diagnostic: {
      id: diagnostic.id,
      name: diagnostic.name,
      status: diagnostic.status,
      overall_score: score.overall,
      maturity: score.maturity.label,
      executive_summary: diagnostic.executive_summary || null,
      ai_summary: diagnostic.ai_summary || null
    },
    dimensions: score.dimensions,
    assessments: assessments.map(x => ({
      dimension: x.dimension_name,
      criterion: x.criterion_name,
      score: Number(x.score),
      status: x.status,
      priority: x.priority,
      evidence: x.evidence || '',
      notes: x.notes || ''
    })),
    actions
  };
}

module.exports = { DIMENSIONS, defaultAssessments, calculateScore, maturity, diagnosticContext, clampScore };
