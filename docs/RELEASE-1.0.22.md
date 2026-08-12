# G3Soft Growth OS v1.0.22

## Diagnostic Intelligence Workspace

O Diagnóstico 360° deixa de ser uma página de score e passa a ser um módulo central do Growth OS.

### Entregas

- Nova análise com nome, tipo, período e objetivo.
- Cadastro estruturado de fontes e ativos: site, páginas, landing pages, redes sociais, Google Business, SEO, Google Ads, Meta Ads, LinkedIn Ads, YouTube, CRM, Analytics, concorrentes, produtos, ICP e personas.
- Registro de métricas quantitativas por fonte.
- Registro e validação de evidências.
- Score 0–100 e confiança dos dados em indicadores separados.
- Histórico completo de análises.
- Comparação entre snapshots.
- Duplicação de análise para nova versão.
- Exportação JSON da análise.
- Snapshot aprovado com bloqueio server-side.
- IA contextual com fontes, métricas, evidências, scores e prioridades.
- Interface premium, responsiva e em português do Brasil.

### Banco

Migration aditiva:

`src/db/migrations/019_diagnostic_workspace.sql`

Não executa reset, truncate, drop de banco, drop de schema ou destruição de dados.

### Validação

- `npm run check` — PASS
- `npm test` — 172 PASS / 0 FAIL
- `npm run build` — PASS
