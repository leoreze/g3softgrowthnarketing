# Work Management — v0.3.0

## Kanban

O Kanban usa o endpoint `/api/work/board` e permite reorganização por `position`.
O drag & drop só pode executar transições aceitas pelo backend.

### Transições

```text
BACKLOG → IN_PROGRESS → PENDING_APPROVAL → APPROVED → DONE
    │          │                │
    └──────→ BLOCKED ←──────────┘
REJECTED → IN_PROGRESS
BLOCKED → IN_PROGRESS | BACKLOG
DONE → IN_PROGRESS
```

O frontend nunca é a autoridade de autorização. Toda transição é validada no servidor.

## Colaboração

Cada tarefa pode possuir:

- subtarefas;
- comentários;
- tags;
- dependências;
- apontamentos de horas;
- anexos por URL;
- histórico de status.

## Anexos

A v0.3.0 registra links HTTP/HTTPS. Não existe upload binário local, porque Render Web Services têm filesystem efêmero. Armazenamento de arquivos será definido posteriormente com object storage e política de retenção.

## Calendário

A interface oferece mês e semana. Os deadlines são derivados das tarefas e continuam sendo uma única fonte de verdade no PostgreSQL.
