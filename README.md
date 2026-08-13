# G3Soft Growth OS — v1.0.22
## Landing Page Engine — v0.2.0

A partir da base estável v1.0.22, a Landing Page Engine fornece uma única estrutura reutilizável para landing pages de produto, segmento e aquisição. A experiência visual usa a identidade G3Soft (preto, branco e laranja), fotografia humana full-bleed no hero, ícones SVG de grande presença e mockups 3D em uma seção dedicada de produto. Rotas disponíveis: `/g3erp`, `/g3control`, `/g3food`, `/g3pedidos`, `/g3small`, `/varejo`, `/supermercados`, `/restaurantes`, `/lojas`, `/conveniencias`, `/multilojas`, `/descubra-seu-g3` e `/calculadora-de-perdas`.

A engine usa configuração centralizada em `public/landing/landing-data.js`, renderização compartilhada em `public/landing/landing-engine.js` e estilos em `public/landing/landing.css`. O tracking da primeira versão fica localmente preparado para posterior integração com CRM/analytics.


Growth Command Center do G3Soft Growth OS: roadmap de 180 dias, Kanban, tarefas, microtarefas, evidências, checklist de aceite, prontidão para aprovação, governança, CRM/marketing, Content Planner com drag & drop, automações, auditoria e calendário inteligente Mês/Semana/Dia/Agenda.

## Stack

HTML5 · CSS3 · JavaScript Vanilla · Node.js · Express · PostgreSQL.

Segurança: Helmet, bcryptjs, sessões HTTP-only em PostgreSQL, SameSite, Secure em produção, rate limiting, queries parametrizadas, RBAC, validação server-side, workflow validado no backend e audit log.

## Requisitos

Node.js 20+ e PostgreSQL gerenciado pelo Render.

## Local — sem Docker

O desenvolvimento local usa Node.js diretamente e pode conectar ao PostgreSQL gerenciado pelo Render.

```bash
cp .env.example .env
npm install
npm run db:status
npm run db:migrate
npm run verify
npm run dev
```

No Windows PowerShell, use `Copy-Item .env.example .env`.

**Importante:** `db:seed` é bloqueado para bancos remotos. O banco remoto deve ser provisionado de forma explícita com `db:bootstrap` quando necessário.

Abrir `http://localhost:3000`.

## Provisionamento do ADMIN no PostgreSQL remoto

O banco Render não recebe `db:seed`. Depois das migrations, crie o primeiro administrador com confirmação explícita:

PowerShell:

```powershell
$env:BOOTSTRAP_REMOTE_CONFIRM="YES"
$env:BOOTSTRAP_ADMIN_EMAIL="admin@g3soft.local"
$env:BOOTSTRAP_ADMIN_PASSWORD="USE-UMA-SENHA-NOVA-COM-12-OU-MAIS-CARACTERES"
$env:BOOTSTRAP_ADMIN_NAME="G3Soft Admin"
npm run db:bootstrap
Remove-Item Env:BOOTSTRAP_REMOTE_CONFIRM,Env:BOOTSTRAP_ADMIN_EMAIL,Env:BOOTSTRAP_ADMIN_PASSWORD,Env:BOOTSTRAP_ADMIN_NAME -ErrorAction SilentlyContinue
```

Depois verifique:

```powershell
npm run db:doctor
```

## Usuários de desenvolvimento

- ADMIN: `admin@g3soft.local` / senha definida em `SEED_ADMIN_PASSWORD`
- STAKEHOLDER: `stakeholder@g3soft.local` / mesma senha do seed local
- MANAGER: `manager@g3soft.local` / mesma senha do seed local
- USER: `user@g3soft.local` / mesma senha do seed local

Troque as senhas antes de qualquer uso fora do ambiente local.

## Banco Render

Configure `DATABASE_URL` no Render como secret. Nunca cole a URL real no Git.

Depois do primeiro deploy, se o banco estiver vazio, o start aplica as migrations automaticamente. Para criar o primeiro administrador sem usar o seed de desenvolvimento, configure temporariamente `BOOTSTRAP_ADMIN_EMAIL`, `BOOTSTRAP_ADMIN_PASSWORD` e `BOOTSTRAP_ADMIN_NAME` no Render e execute `npm run db:bootstrap`. Remova essas variáveis depois.

Se uma senha real for compartilhada fora do cofre de secrets, faça rotação imediatamente.

## Migrations

```bash
npm run db:migrate
```

A migration `004_work_management.sql` adiciona as estruturas de colaboração e gestão operacional. A `005_governance.sql` adiciona aprovação multi-etapas. A `007_calendar_intelligence.sql` adiciona índices específicos do calendário sem alterações destrutivas.

### Reset local/teste

```bash
RESET_CONFIRM=YES npm run db:reset
```

Este comando só funciona quando `DATABASE_URL` aponta para `localhost`, `127.0.0.1` ou `::1`. Nunca use reset contra o PostgreSQL do Render.

Este comando é bloqueado em produção. Nunca use reset no PostgreSQL do Render.

## Qualidade

```bash
npm run check
npm test
npm run build
npm run verify
```

## Render

`render.yaml` aplica migrations no pre-deploy, inicia a aplicação depois da migration, usa `/api/ready` como health check e configura o Render para só auto-deployar após os checks de CI passarem.

## Estrutura

```text
src/
  config/
  db/migrations/
  middleware/
  routes/
  services/
  validators/
  app.js
  server.js
public/
  css/
  js/
  assets/
tests/
docs/
```

## Roadmap

- v0.1.0 — Foundation.
- v0.2.x — Work Management e estabilização de autenticação.
- v0.3.0 — Governança e workflow configurável.
- v0.7.0 — Calendário inteligente.
- v0.7.0 — Growth Command Center.
- v0.6.0 — KPI Engine.
- v0.7.0 — Automações.
- v0.8.0 — Growth Copilot.
- v1.0.0 — G3Soft Growth OS.


## Development database flow

For development, the G3Soft Growth OS follows the same simple provisioning flow used by the G3Soft OS pattern: run migrations, then run the idempotent seed. A remote Render PostgreSQL database is allowed when `NODE_ENV=development`; production remains protected.

```powershell
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Or run the complete setup in one command:

```powershell
npm run db:setup
```

The seed creates/retains the initial ADMIN, STAKEHOLDER, MANAGER and USER accounts and the 180-day campaign data without duplicating existing records. `ChangeMe!123` is acceptable for local/development bootstrap; production credentials must use a stronger secret.

## v0.6.0 — Professional Calendar

Calendário profissional com views mês/semana/dia/agenda, eventos nativos, filtros, criação e reagendamento por drag & drop.

Migration adicional: `009_professional_calendar.sql`.


## v0.7.4 UX

Roadmap phase creation uses the standardized premium modal form system. All modal footers use a full-width divider and right-aligned actions for consistent UX.

## v1.0.0 — Production Hardening

A versão 1.0.0 adiciona hardening de produção, readiness, correlação de requests, sessão de produção endurecida, proteção de origem para operações mutáveis, scheduler de automações consciente do schema e shutdown gracioso.

Antes do deploy, execute:

```powershell
npm install
npm test
npm run check
npm run db:migrate
npm run dev
```

Em produção, use somente variáveis de ambiente para segredos e nunca execute `npm run db:reset`.

## v1.0.2 — Roadmap 180 Dias + Microtarefas

O projeto inclui um planejamento operacional idempotente baseado no roadmap visual de 180 dias.

### População do planejamento em ambiente não produtivo

```bash
npm run db:seed:roadmap
```

### População segura em produção/staging via migration

```bash
npm run db:migrate
```

A migration `012_roadmap_180_days.sql` cria/atualiza o planejamento de forma aditiva: 6 fases, 35 atividades principais, 180 microtarefas (175 do roadmap + 5 de apoio ao tracking), marcos/checkpoints no calendário e o catálogo de canais. Não executa reset, DROP ou TRUNCATE.

## v1.0.2 — Task Execution & Deliverables

Cada tarefa do Roadmap 180 Dias possui `execution_plan` e `deliverable`, apresentados em um modal único de detalhes. O modal é acessível pela Visão Geral, Roadmap, Kanban, Tarefas e Calendário.

Migration: `013_task_execution_deliverables.sql`. Não executar reset em produção.


## v1.0.6 — Execution Evidence & Approval Intelligence

O Task Execution Center agora possui checklist formal de aceite, requisitos mínimos de evidência por tipo de execução e `Approval Readiness` calculado no backend. O envio para `PENDING_APPROVAL` é bloqueado server-side enquanto houver pendências.

- `GET /api/tasks/:id/readiness`
- `POST /api/tasks/:id/acceptance-criteria`
- `PATCH /api/tasks/:id/acceptance-criteria/:criterionId`
- `DELETE /api/tasks/:id/acceptance-criteria/:criterionId`
- Migration `015_task_acceptance_evidence_intelligence.sql`
- 103 testes PASS

## v1.0.5 — Task Filters Regression Fix

Correção incremental no frontend: `bindFilters()` agora trata de forma defensiva os controles que existem apenas em determinadas telas. Isso elimina o erro `Cannot set properties of null (setting 'onchange')` ao abrir **Tarefas** e preserva o Task Execution Center.

Não há migration nova e não é necessário resetar o banco.

Validação desta versão:

```bash
npm test
npm run check
npm run build
```

## v1.0.3 — Task Execution Center

O modal de tarefa evoluiu para um centro operacional completo. A execução agora pode ser conduzida dentro da própria tarefa, com microtarefas, entregável, evidências, horas, comentários, bloqueios, aprovação e histórico.

Migration: `014_task_execution_center.sql`

Aplicação:

```bash
npm run db:migrate
npm test
npm run check
npm run build
```

> `db:reset` continua restrito a LOCAL/TEST. Nunca executar reset em produção.

## Database migration

Use the same migration command for the configured database in any environment, including Render PostgreSQL / production:

```bash
npm run db:status
npm run db:migrate
npm run db:doctor
```

`npm run db:migrate` is incremental and does not reset or delete existing data. The destructive `npm run db:reset` command remains prohibited in production.

## Site institucional
A nova experiência institucional está disponível em `GET /g3soft`, integrada ao mesmo projeto e ao mesmo servidor do Growth OS.

## CRM Foundation v0.3.0
A foundation CRM incremental está disponível em `/api/crm`, com Companies, Contacts, Leads, Lead Sources e Lead History.
