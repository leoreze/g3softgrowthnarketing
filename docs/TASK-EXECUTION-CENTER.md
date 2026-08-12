# Task Execution Center — v1.0.3

O Task Execution Center transforma o modal de detalhes em uma unidade operacional de execução.

## Capacidades

- microtarefas: concluir/reabrir e adicionar;
- entregável: editar, salvar rascunho e enviar;
- evidências: registrar/remover links, notas e referências;
- horas: registrar tempo executado e contexto;
- comentários: registrar decisões e observações;
- bloqueio: registrar motivo e mudar a tarefa para BLOCKED;
- aprovação: aprovar/rejeitar quando o usuário possuir papel compatível;
- workflow: iniciar, enviar para aprovação e concluir quando permitido;
- histórico: acompanhar mudanças e responsáveis.

## Fonte de verdade

A tarefa continua sendo a entidade central. Roadmap, Kanban, Calendário e Tarefas apontam para o mesmo `taskDetails(id)`.

## API

- `GET /api/tasks/:id/details`
- `POST /api/tasks/:id/subtasks`
- `PATCH /api/tasks/:id/subtasks/:subtaskId`
- `POST /api/tasks/:id/comments`
- `POST /api/tasks/:id/time`
- `POST /api/tasks/:id/evidence`
- `DELETE /api/tasks/:id/evidence/:evidenceId`
- `PATCH /api/tasks/:id/deliverable`
- `POST /api/tasks/:id/block`
- `POST /api/tasks/:id/submit`
- `POST /api/tasks/:id/approve`
- `POST /api/tasks/:id/reject`

## Migration

`014_task_execution_center.sql` é aditiva e idempotente. Aplicar com:

```bash
npm run db:migrate
```

Nunca executar reset em produção.
