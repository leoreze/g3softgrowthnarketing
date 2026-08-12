# CRM Foundation — v0.3.0

## Escopo

Foundation funcional do CRM G3Soft Growth OS, sem redesign premium nesta etapa.

### Entidades
- `companies`
- `contacts`
- `lead_sources`
- `leads`
- `lead_history`

### API
- `GET/POST /api/crm/companies`
- `GET/PATCH/DELETE /api/crm/companies/:id`
- `GET/POST /api/crm/contacts`
- `GET/PATCH/DELETE /api/crm/contacts/:id`
- `GET/POST /api/crm/leads`
- `GET/PATCH /api/crm/leads/:id`
- `POST /api/crm/leads/:id/status`
- `POST /api/crm/leads/:id/qualify`
- `POST /api/crm/leads/:id/convert`
- `GET /api/crm/leads/:id/history`
- `GET /api/crm/lead-sources`

## Status de lead

`NEW`, `QUALIFICATION`, `MQL`, `SQL`, `DEMO`, `WON`, `LOST`, `NURTURE`.

## Segurança

- autenticação server-side com `requireAuth`;
- autorização baseada no papel e responsável;
- exclusão restrita a `ADMIN`;
- UUIDs validados;
- queries parametrizadas;
- auditoria das mutações;
- histórico de mudanças de status;
- nenhuma migration destrutiva.

## Banco

A migration é `020_crm_foundation.sql` e é aplicada pelo migration runner existente. Nenhuma migration anterior é alterada.

## Fora do escopo

Deals, Pipeline, Activities, WhatsApp, e-mail, automações comerciais, IA e redesign premium do CRM.

## Validação

A entrega deve manter todos os testes existentes verdes e adicionar os testes `tests/v030.crm-foundation.test.js`.
