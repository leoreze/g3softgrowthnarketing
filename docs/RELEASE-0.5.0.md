# G3Soft Growth OS v0.5.0 — Workflow & Multi-User Approval

## Objetivo

Evoluir a governança do Growth OS para workflows reutilizáveis e aprovação multiusuário, preservando o mecanismo de aprovação existente.

## Entregas

- workflow definitions reutilizáveis para TASK e CAMPAIGN;
- etapas ordenadas por papel ou usuário;
- status DRAFT, ACTIVE e ARCHIVED;
- snapshot das etapas no momento da solicitação de aprovação;
- aprovação sequencial multiusuário;
- aprovação de campanhas;
- campanha aprovada avança para ACTIVE;
- campanha rejeitada retorna para DRAFT;
- tarefa mantém o comportamento legado de revisor + stakeholder;
- controle server-side de autorização;
- transações PostgreSQL nas operações críticas;
- auditoria das submissões e decisões;
- interface de Workflows;
- ação de envio de campanha para aprovação;
- migration 008 não destrutiva.

## Banco

`008_workflow_engine.sql` adiciona as tabelas `workflow_definitions` e `workflow_definition_steps`, campos de referência em `approval_requests` e índices. Não executa DROP, TRUNCATE ou reset.

## Rotas

- `GET /api/workflows`
- `GET /api/workflows/:id`
- `POST /api/workflows`
- `PATCH /api/workflows/:id/status`
- `POST /api/approvals/tasks/:id/submit`
- `POST /api/approvals/campaigns/:id/submit`
- `POST /api/approvals/:id/decision`

## Compatibilidade

As migrations 001–007 permanecem byte-for-byte inalteradas. A migration 008 é incremental.

## Critérios de aceite

1. Workflow existente pode continuar aprovando tarefas.
2. Tarefa com reviewer preserva a primeira etapa do reviewer e depois stakeholder.
3. Campanha DRAFT/PAUSED pode ser submetida por ADMIN/MANAGER.
4. Aprovação final de campanha altera status para ACTIVE.
5. Rejeição de campanha retorna para DRAFT.
6. Usuário não autorizado recebe 403.
7. Solicitação duplicada recebe 409.
8. Cada decisão gera audit log.
9. Nenhuma migration anterior é alterada.
