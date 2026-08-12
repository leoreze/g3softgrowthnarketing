# Release v1.0.6 — Execution Evidence & Approval Intelligence

## Objetivo

Transformar o Task Execution Center em um ciclo formal de execução e aceite:

**Tarefa → Microtarefas → Checklist de Aceite → Evidências → Approval Readiness → Aprovação → Resultado**

## Entregas

- Checklist formal de aceite por tarefa.
- Critérios de aceite obrigatórios e critérios manuais adicionais.
- Critérios sistêmicos para microtarefas e entregável.
- Classificação de tarefas por tipo de execução.
- Requisitos mínimos de evidência por tipo de tarefa.
- Cálculo server-side de `Approval Readiness`.
- Bloqueio server-side do envio para aprovação quando critérios, evidências ou entregável estiverem incompletos.
- Bloqueio também no endpoint de movimentação do Kanban e no endpoint alternativo de aprovação.
- Task Execution Center atualizado com readiness, pendências e contadores de evidência.
- Inclusão de critérios de aceite diretamente no modal.
- Preservação da abertura de tarefas e da colaboração existente.
- Espaçamento solicitado entre cards de microtarefas e no campo de adicionar microtarefa.

## Banco

Nova migration append-only:

`015_task_acceptance_evidence_intelligence.sql`

Novas estruturas:

- `tasks.execution_type`
- `task_acceptance_criteria`
- `task_evidence_requirements`

As migrations `001` a `014` permanecem byte-for-byte inalteradas em relação à base v1.0.5.

## API

Novos endpoints:

- `GET /api/tasks/:id/readiness`
- `POST /api/tasks/:id/acceptance-criteria`
- `PATCH /api/tasks/:id/acceptance-criteria/:criterionId`
- `DELETE /api/tasks/:id/acceptance-criteria/:criterionId`

O endpoint existente de envio de tarefa para aprovação passa a exigir readiness completo.

O mesmo gate é aplicado ao endpoint de submissão de aprovação e à movimentação do Kanban para `PENDING_APPROVAL`.

## Segurança

- Readiness é calculado no backend.
- Frontend não é fonte de autoridade para aprovação.
- Critérios sistêmicos não podem ser falsificados manualmente.
- Permissões de criação/alteração/exclusão de critérios são verificadas server-side.
- Nenhuma credencial ou segredo é armazenado no checklist/evidência.

## QA

Baseline anterior:

- 92 testes
- 92 PASS

v1.0.6:

- 103 testes
- 103 PASS
- `npm run check` PASS
- `npm run build` PASS
- `npm run verify` PASS

A suíte adiciona 11 testes específicos para checklist, evidências, readiness, bloqueio server-side, autorização, regressão e UX/CSP.

## Limites da validação

Não foi executado nesta sessão um teste contra o PostgreSQL de produção/Render nem browser E2E real. A migration foi validada estruturalmente e as migrations `001–014` foram comparadas byte-for-byte com a base v1.0.5.

## Banco / Deploy

Produção: executar apenas:

`npm run db:migrate`

Não executar:

`npm run db:reset`

Após deploy, executar hard refresh no navegador.
