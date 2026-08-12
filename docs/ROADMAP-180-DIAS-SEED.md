# Roadmap de 180 Dias — Seed Operacional

A fonte é o roadmap visual de 180 dias fornecido para o G3Soft Growth OS.

## Estrutura

- 6 fases: Fundação, Conversão, Aquisição, Otimização, Automação, Escala.
- 35 atividades principais do roadmap visual.
- 175 microtarefas derivadas dessas atividades, mais 5 microtarefas de apoio para o tracking técnico já existente na base (180 microtarefas no total).
- Cada atividade principal vira uma `task`.
- Cada atividade principal recebe microtarefas em `task_subtasks`.
- Cada fase recebe um marco de início e um checkpoint no Calendário Profissional.
- O seed é idempotente: pode ser executado novamente sem duplicar tarefas, subtarefas ou marcos.

## Execução

Pré-requisito: execute primeiro `npm run db:seed` em ambiente não produtivo para criar usuários e a campanha base.

Depois:

```bash
npm run db:seed:roadmap
```

`db:seed:roadmap` é bloqueado em produção.

## Modelo operacional

```text
FASE
  ↓
ATIVIDADE PRINCIPAL (TASK)
  ↓
MICROTAREFAS (TASK_SUBTASKS)
  ↓
EXECUÇÃO
  ↓
REVISÃO / APROVAÇÃO
  ↓
CALENDÁRIO / CHECKPOINT
  ↓
ANALYTICS
```
