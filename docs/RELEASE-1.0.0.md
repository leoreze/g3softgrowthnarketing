# G3Soft Growth OS v1.0.0 — Hardening + Segurança + QA + Produção

## Escopo

A v1.0.0 fecha a linha 0.x com foco em hardening operacional, segurança de produção, readiness, observabilidade básica e regressão.

## Segurança

- Helmet com CSP self-only e restrição de `frame-ancestors`/`form-action`.
- HSTS somente em produção.
- Referrer-Policy restritiva.
- Permissions-Policy mínima.
- `X-Request-ID` para correlação de requisições.
- API com `Cache-Control: no-store`.
- `SESSION_SECRET` com mínimo de 32 caracteres em produção.
- Cookie de produção `__Host-g3sid`, `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`.
- Session store não cria tabela automaticamente em produção.
- Proteção de origem para métodos mutáveis quando o header `Origin` estiver presente.
- Rate limiting global e de login preservados.
- Nenhuma credencial real versionada.

## Readiness e produção

- `/api/health` verifica liveness do PostgreSQL.
- `/api/ready` verifica `schema_migrations`, `automation_rules` e `notifications`.
- Render usa `/api/ready` como health check.
- O Automation Engine faz preflight do schema e permanece desabilitado se a migration 011 ainda não estiver aplicada.
- Shutdown gracioso encerra HTTP server e PostgreSQL pool.

## Banco

A linha histórica `001` até `011` é append-only. Nenhuma migration existente foi alterada na v1.0.0.

A migration `011_automation_notifications.sql` continua sendo a última migration necessária para o módulo de automações/notificações.

## QA

- 75 testes automatizados passando.
- Syntax check passando.
- Build/check passando.
- Testes históricos atualizados para aceitar a linha de release v1.0.0 sem remover as validações estruturais.

## Produção

Antes de promover para produção:

1. Rotacionar qualquer credencial que tenha sido exposta durante desenvolvimento.
2. Configurar `DATABASE_URL`, `SESSION_SECRET` e `CORS_ORIGIN` somente no ambiente do Render.
3. Executar `npm run db:migrate` uma única vez por release/deploy.
4. Confirmar `/api/ready` HTTP 200.
5. Confirmar login, sessão, RBAC, approvals, automações e notificações.
6. Confirmar ausência de erros CSP no navegador.
7. Não executar `db:reset` em produção.
