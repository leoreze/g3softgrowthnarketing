# G3Soft Growth OS v0.6.0 — Professional Calendar

Evolução incremental sobre a v0.5.0, preservando as migrations anteriores.

## Entregas
- Calendário profissional Mês, Semana, Dia e Agenda.
- Eventos nativos de calendário: reunião, demonstração, follow-up, campanha, deadline e outros.
- Criação de eventos com data/hora, duração, local, descrição e responsável.
- Filtros por fase, responsável, tipo, prioridade e busca.
- Drag & drop para reagendamento de tarefas e eventos.
- Resumo operacional de itens, atrasadas, críticas e eventos.
- Legenda visual por tipo de compromisso.
- Mobile-first e responsividade preservadas.
- CSP mantida sem estilos inline.

## Banco
- Nova migration `009_professional_calendar.sql`.
- Nenhuma migration anterior foi modificada.
- `calendar_events` usa foreign keys e índices não destrutivos.
- Seed local/teste idempotente inclui compromissos de demonstração.

## Segurança
- Criação/exclusão de eventos restrita a ADMIN/MANAGER.
- Edição permitida ao proprietário, MANAGER ou ADMIN.
- Validação server-side de UUID, enums, datas e intervalos.
- Auditoria CREATE/UPDATE/DELETE.
