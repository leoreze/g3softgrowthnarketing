# Arquitetura v0.1.0

```text
Browser
  ↓
HTML5 / CSS3 / Vanilla JS
  ↓ fetch / JSON
Express API
  ↓ middleware
Auth → RBAC → validation → routes → services
  ↓ parametrized SQL
PostgreSQL
```

## Domínio

`campaigns → phases → tasks`.

Usuários atuam como responsáveis/revisores. Mudanças de status geram `task_status_history`; operações críticas geram `audit_logs`.

## Segurança

A autorização é aplicada no backend. O frontend apenas apresenta ações disponíveis. Senhas são armazenadas com bcrypt; credenciais e secrets não são retornados pela API. Payloads têm limites; SQL usa parâmetros; Helmet aplica headers de segurança; login possui rate limiting.

## Banco

Migrations em `src/db/migrations`. O runner registra versão, nome, checksum e data de aplicação. Produção executa apenas migrations.


## v0.5.0 — Workflow Engine
- `workflow_definitions` define reusable approval templates.
- `workflow_definition_steps` define ordered approvers by role or user.
- `approval_requests` stores the immutable workflow snapshot reference.
- `approval_steps` remains the runtime snapshot, preserving historical decisions.
- Tasks preserve the existing reviewer-first behavior; campaigns can use the campaign standard workflow.
