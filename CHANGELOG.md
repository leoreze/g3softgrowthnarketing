## 1.0.20 — Preparação GitHub + Render

- Preparação do projeto para o repositório `leoreze/g3softgrowthnarketing`.
- CI GitHub Actions para `check`, testes e build.
- Render Blueprint com `preDeployCommand` para migrations.
- Auto-deploy condicionado aos checks do GitHub (`checksPass`).
- Health check `/api/ready`.
- Web server explicitamente ligado em `0.0.0.0`.
- Documentação de deploy GitHub + Render.

# CHANGELOG

## v1.0.17 — CRUD completo, governança clara e UX em português

- Aprovações com contexto explícito do que deve ser aprovado.
- Interface e rótulos principais traduzidos para português do Brasil.
- CRUD de fases, tarefas, microtarefas, conteúdos, campanhas e automações.
- Edição e exclusão com autorização server-side e auditoria.
- Espaçamento vertical refinado no Task Execution Center e Automações.


- Fixes `42P01: missing FROM-clause entry for table "u"` in `GET /api/tasks/:id/details`.
- Adds the missing `LEFT JOIN users u ON u.id=e.user_id` for task evidence.
- No database migration required.
- Adds regression coverage for the evidence query alias.

## v1.0.14 — Execution Schema Reconciliation

- Added migration 017 to repair partially-created execution/evidence tables additively.
- Hardened task details diagnostics without exposing SQL internals.
- Expanded db doctor schema checks.
- No reset, drop, truncate or production data deletion.

# v1.0.12

- Added `npm run clean:legacy` to remove only the obsolete `src/db/local-prepare.js` left by older extracted versions.
- No database changes or migrations.
- Preserved remote database migration flow.

# Changelog

## 1.0.10 - Database readiness & local workflow hardening

- Fixed version-specific migration error messaging in task details.
- Added schema readiness checks for migration 015 execution/approval structures.
- Added `npm run local:prepare` for safe local migration/status/doctor flow.
- Hardened `db:doctor` to report pending migrations and execution/approval schema readiness.
- No database reset behavior changed.

# v1.0.9 — Critical frontend render regression fix

- Restored missing `renderWorkflows()` and shared calendar/content/automation functions that were accidentally absent from v1.0.8.
- Prevents the global render dispatcher from throwing `ReferenceError` before any page can render.
- Preserves v1.0.8 approval, execution evidence and Content Planner behavior.
- No database migration added.

# Changelog

## 1.0.8 - 2026-08-12

### Fixed
- Restored the missing `renderApprovals()` frontend renderer that caused `ReferenceError: renderApprovals is not defined` when opening Aprovações.
- Restored approval-card navigation into the governance approval details modal.
- Added regression coverage for the approvals render dispatch.

### Database
- No new migration.

1.0.7 — Task Details, Approval Flow & Content Planner

- Corrige o detalhe de tarefa quando a migration 015 ainda não foi aplicada, retornando diagnóstico seguro em vez de 500 genérico.
- Unifica o envio de tarefa para aprovação com a criação do `approval_request`, inclusive no endpoint legado `/api/tasks/:id/submit`.
- Corrige a decisão de aprovação/rejeição para usar o workflow de governança e manter a trilha de aprovação consistente.
- Adiciona drag & drop nativo ao Content Planner entre colunas de workflow.
- Preserva a base v1.0.6 e seus testes de regressão.
## 1.0.6 — Execution Evidence & Approval Intelligence

### Added
- Checklist formal de aceite por tarefa.
- Tipos de execução e requisitos mínimos de evidência por tipo.
- Approval Readiness calculado server-side.
- Bloqueio de envio para aprovação quando faltam critérios, evidências ou entregável.
- CRUD de critérios de aceite com autorização server-side.
- Indicadores de readiness no Task Execution Center.
- Migration `015_task_acceptance_evidence_intelligence.sql`.
- 11 testes específicos da camada de aceite/evidência/aprovação.

### UX
- Espaçamento de 20px entre cards de microtarefas.
- Campo de adicionar microtarefa com `margin-top: 20px` e `margin-bottom: 20px`.

### QA
- 103/103 testes PASS.
- `npm run check` PASS.
- `npm run build` PASS.

# v1.0.5 — Task Comment Permission Regression Fix

- Corrigido erro `canCommentTask is not defined` ao abrir o Task Execution Center.
- Alinhada a regra de exibição do formulário de comentários do frontend com a autorização server-side.
- Nenhuma migration ou alteração de banco.
- Regressão coberta por testes automatizados.

## v1.0.4 — Task Filters Regression Fix

- Corrige `bindFilters()` para tolerar controles opcionais ausentes em cada tela.
- O filtro `#dueFilter`, exclusivo do Kanban, deixa de interromper a renderização de Tarefas.
- Mantém o botão **Abrir** conectado ao Task Execution Center.
- Adiciona cobertura de regressão para renderização de Tarefas sem `#dueFilter`.
- Nenhuma migration nova; banco de produção permanece intacto.

## v0.8.4 — Analytics SQL Fix

- Corrige alias SQL reservado/ambíguo na série diária do Analytics (`day` → `activity_date`).
- Mantém o relacionamento real de tarefas via fases.
- Sem alterações de banco/migrations.

# Changelog

## v0.8.3 — Analytics + Responsive Sidebar Fix
- Fixed Analytics task aggregation through phases.
- Fixed tablet/mobile sidebar overlay so hidden sidebar never reserves layout width.
- Added regression coverage.


## v0.8.3 — Analytics + Responsive Sidebar Fix
- Fixed Analytics task aggregation to join tasks through phases instead of nonexistent tasks.campaign_id.
- Fixed tablet/mobile shell so hidden sidebar never reserves layout width.
- Sidebar opens as an overlay below desktop breakpoint.
- Preserved desktop fixed sidebar behavior.
- Added regression coverage.

## 0.7.5
- Global page loader on every sidebar navigation item.
- Minimum loader visibility duration to prevent imperceptible flashes on fast local renders.
- Preserved CSP-safe styling and premium modal system.

v0.7.4 — Roadmap Phase Modal & Unified Modal Footer

- Restored the functional Roadmap `+ Nova fase` modal and POST `/api/phases` flow.
- Standardized premium form controls for phase, campaign and content modals.
- Standardized every modal footer with a full-width top divider and right-aligned actions.
- Preserved CSP without unsafe-inline and database migrations.

# v0.7.3 — Premium UX Forms & Navigation Loading

- Restored functional New Task modal and task creation flow.
- Standardized premium inputs/selects/textareas across task, campaign and content modals.
- Added loading overlay to every sidebar navigation click, including same-page clicks.
- Preserved CSP without unsafe-inline.
- No database migration changes.

# CHANGELOG

## 0.7.1 — Navigation Fix
- Fixed sidebar navigation dispatch for Campanhas and Conteúdo.
- Selecting either menu now renders its dedicated view instead of falling back to Visão geral.
- Added regression coverage for the navigation map.


## 0.7.0 — Growth Campaigns + Content Planner
- Campaign planning fields and channel budgets.
- Content Planner with Growth workflow.
- Content linked to campaign, phase, task and calendar event.
- Content approval workflow using the existing multi-step governance engine.
- New Campanhas and Conteúdo views.
- Migration 010 is additive and preserves migrations 001–009.


## v0.6.0 — UI Shell & Loading Experience

- Page loading modal after authentication and during navigation.
- Fixed desktop sidebar with independent premium scrolling for long menus.
- Custom scrollbar styling with reduced-motion support.
- Sticky topbar and stable application shell on desktop.
- Preserved CSP without inline styles.
# Changelog

## 0.7.2 — Approval SQL Query Fix

- Fixed PostgreSQL aggregation queries in workflow and approval listing endpoints.
- Preserved deterministic step ordering inside `json_agg`.
- No database migration changes.
- Regression suite remains green.

## 0.5.0 - Workflow & Multi-User Approval
- Workflow definitions reutilizáveis para tarefas e campanhas.
- Aprovação sequencial multiusuário com snapshot das etapas.
- Aprovação de campanhas com transição DRAFT/PAUSED → ACTIVE.
- Governança server-side e auditoria.
- Interface de Workflows.


## 0.4.0 — Intelligent Calendar
- Calendário operacional Mês/Semana/Dia/Agenda.
- Filtros por busca, prioridade, status e atrasadas.
- Drag & drop com reagendamento auditado.
- Indicadores de risco e conflitos.
- Índices de calendário sem alteração destrutiva.

## 0.3.4 — Seed/Auth Fix
- Corrigido seed idempotente e criação de tarefas.
- Estabilizado provisionamento de credenciais de desenvolvimento.

## 0.6.0 — Professional Calendar
- calendário profissional com eventos nativos;
- views mês/semana/dia/agenda;
- criação, filtros e reagendamento;
- migration 009 não destrutiva;
- seed idempotente com eventos de exemplo.

## 1.0.0 — Hardening + Segurança + QA + Produção
- Production security headers and strict CSP baseline.
- Request correlation via X-Request-ID and API no-store cache policy.
- Production session hardening with __Host- cookie semantics and no automatic session-table creation.
- Production secret-strength validation.
- Same-origin protection for state-changing API requests when Origin is supplied.
- `/api/ready` readiness endpoint validates critical database dependencies.
- Automation scheduler now performs schema preflight and disables itself gracefully when migrations are incomplete.
- Graceful shutdown closes the HTTP server and PostgreSQL pool.
- Render health check now targets readiness instead of liveness.
- Regression suite expanded for production hardening.

## [1.0.1] - Roadmap 180 Dias Planning Seed
- Added an idempotent non-production roadmap seed based on the approved 180-day Growth roadmap.
- Expanded principal activities into actionable microtasks using the existing `task_subtasks` model.
- Added phase milestone/checkpoint events to the Professional Calendar.
- Added `npm run db:seed:roadmap` for explicit planning-data population.

## 1.0.1 — Roadmap 180 Dias + Microtarefas
- Seed idempotente do planejamento de 180 dias baseado no roadmap visual.
- Atividades principais transformadas em tarefas e microtarefas.
- Marcos de início e checkpoints adicionados ao calendário.

## [1.0.2] - Task Execution & Deliverables

- Migration 013, append-only, com plano de execução e entregável das 35 tarefas principais.
- Endpoint autenticado `GET /api/tasks/:id/details`.
- Modal unificado de tarefa com descrição, execução, entregável, microtarefas, progresso e histórico.
- Roadmap/Fases permite abrir a fase e navegar para qualquer tarefa.
- Tarefas possuem ação explícita `Abrir`.
- CSP preservada sem estilos inline.

## 1.0.3 — Task Execution Center

### Added
- Task Execution Center integrado ao modal de tarefa.
- Execução de microtarefas com atualização persistida.
- Inclusão de microtarefas pelo próprio centro de execução.
- Registro de evidências por link, nota, imagem ou documento.
- Registro de horas executadas e observações.
- Comentários operacionais diretamente na tarefa.
- Edição e envio do entregável para aprovação.
- Visualização de histórico, bloqueios e estado do entregável.
- Ações contextuais de iniciar, enviar para aprovação, aprovar, rejeitar, concluir e bloquear.
- Delegação de eventos para corrigir a abertura de tarefas após re-renderizações da página Tarefas.

### Database
- Migration `014_task_execution_center.sql`.
- Novos campos de estado do entregável em `tasks`.
- Nova tabela `task_evidence`.

### Security
- Ações de execução protegidas por autorização server-side.
- Evidências, comentários, horas, subtarefas e entregáveis geram audit log.
- Nenhum segredo é persistido em evidências ou comentários por regra de aplicação.

## 1.0.11 — Remote/Production Database Migration Flow
- Removed the local-only `npm run local:prepare` command.
- `npm run db:migrate` is the single migration command for local, remote, and production environments.
- Preserved the production safeguard that blocks destructive `npm run db:reset`.
- Added regression tests ensuring migrations are not artificially restricted to local databases.

## v1.0.16 — Content Planner Approval Button

- Fixed Content Planner “Enviar aprovação” action.
- Approval submission now uses a single server-side approval endpoint.
- Content in IDEA, BRIEF, PRODUCTION, REVIEW or REJECTED can be submitted; the backend transitions it to REVIEW before creating the approval request when necessary.
- Frontend now disables the button while submitting and restores it on failure.
- Added regression tests for the Content Planner approval flow.


## 1.0.18 — Menus Contextuais + Notificações Premium
- Ações de editar, excluir e outras ações passaram a ficar dentro do menu de três pontos.
- Visão geral não exibe ações de editar/excluir nos cards do roadmap.
- Central de execução, tarefas, fases, campanhas, conteúdos e automações usam menus contextuais.
- Modal de notificações redesenhado como listagem premium, com maior contraste, status nova/lida e ação explícita.
- Interface mantida em português do Brasil.


## 1.0.19 — Menus sobrepostos no Planejador e Campanhas
- Menus de três pontos recebem a maior camada de empilhamento prática do navegador.
- Ao abrir um menu, o card/coluna hospedeira sobe para a camada superior sem alterar o layout fechado.
- Menus do Planejador de conteúdo passam à frente dos cards vizinhos.
- Menus de Campanhas escapam do recorte interno do card quando abertos.
- Nenhuma migration nova.
