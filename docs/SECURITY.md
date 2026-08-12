# Security Baseline — v0.3.2

- Helmet com CSP.
- Sessões server-side em PostgreSQL.
- Cookie HTTP-only, SameSite e Secure em produção.
- bcrypt para senhas.
- Rate limit de autenticação e API.
- Queries parametrizadas.
- RBAC no backend.
- Validação server-side.
- Transições de workflow validadas no backend.
- UUID validado em parâmetros críticos.
- Audit log sem senha/token/segredo.
- Reset bloqueado em produção.
- URLs de anexos restritas a HTTP/HTTPS.
- Não há upload binário na v0.3.2.
- `db:seed` bloqueado em produção.
- Bootstrap administrativo exige segredo explícito e senha mínima de 12 caracteres.

## Segredo exposto acidentalmente

Se uma `DATABASE_URL` real for compartilhada em uma conversa, issue, terminal gravado ou arquivo público, trate a credencial como comprometida e faça rotação imediatamente no provedor.

## PostgreSQL remoto em desenvolvimento

O ambiente local pode usar o PostgreSQL gerenciado do Render. Nesse cenário:
- `db:migrate` é permitido para migrations incrementais;
- `db:reset` é bloqueado para qualquer banco remoto;
- `db:seed` é bloqueado para qualquer banco remoto;
- `db:bootstrap` remoto exige `BOOTSTRAP_REMOTE_CONFIRM=YES`;
- a conexão remota usa SSL por padrão;
- nunca imprimir `DATABASE_URL`, senha ou `SESSION_SECRET` nos logs.

- `db:auth-check` permite diagnosticar `ACCOUNT`, `ROLE`, `PASSWORD_MATCH` e `LOGIN_READY` sem imprimir senha ou hash.

## v1.0.0 production hardening
- `SESSION_SECRET` must be at least 32 characters in production.
- Production sessions use a `__Host-` cookie, `Secure`, `HttpOnly`, `SameSite=Lax`, and no automatic session-table creation.
- State-changing API requests validate the supplied `Origin` against `CORS_ORIGIN` when present.
- Security headers include HSTS in production, strict referrer policy, frame-ancestor protection, form-action restriction, and a self-only CSP.
- API responses are marked `no-store`.
- `/api/ready` verifies critical schema dependencies before a deployment is considered ready.
- Automation is schema-aware and remains disabled until its required tables exist.
- Shutdown drains the HTTP server and PostgreSQL pool.
