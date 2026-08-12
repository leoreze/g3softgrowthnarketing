# G3Soft Growth OS v0.4.0 — Intelligent Calendar

## Objetivo

Transformar o calendário de uma simples listagem de prazos em uma camada de planejamento operacional: mês, semana, dia e agenda, filtros, indicadores de risco e reagendamento por drag & drop.

## Entregas

- visualizações Mês, Semana, Dia e Agenda;
- filtros por busca, prioridade, status e atrasadas;
- contadores de tarefas, atrasadas, críticas e aprovações;
- drag & drop para reagendar tarefas;
- controle server-side de permissão para reagendamento;
- endpoint de conflitos por tarefa;
- detecção de dependências bloqueadoras;
- índices específicos para consultas de calendário;
- auditoria de reagendamento e reordenação;
- mobile-first e responsivo;
- `prefers-reduced-motion` preservado.

## Banco

A migration `007_calendar_intelligence.sql` adiciona somente índices. Não há DROP, TRUNCATE, alteração destrutiva ou reset.

## Rotas

- `GET /api/calendar`
- `GET /api/calendar/summary`
- `PATCH /api/calendar/:id/reschedule`
- `PATCH /api/calendar/:id/position`
- `GET /api/calendar/:id/conflicts`

## Critérios de aceite

1. Mês, semana, dia e agenda carregam tarefas por prazo.
2. Filtros não executam SQL concatenado com entrada do usuário.
3. Apenas ADMIN ou o responsável podem reagendar uma tarefa.
4. Reagendamento gera audit log.
5. Uma migration já aplicada não pode ser modificada sem falhar por checksum.
6. Nenhuma operação destrutiva é introduzida.
