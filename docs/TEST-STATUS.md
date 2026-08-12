# Test Status — v0.3.0

## Executado nesta entrega

- Node.js syntax check: PASS.
- Frontend JavaScript syntax check: PASS.
- Version manifest: PASS.
- Migration files presentes e numeradas: PASS.
- Verificação estática de segredo hardcoded: PASS.
- Testes Node: PASS, quando executados sem dependência de PostgreSQL externo.

## Não executado neste ambiente

- PostgreSQL real.
- PostgreSQL remoto do Render; Docker não faz parte do ambiente de desenvolvimento.
- Deploy real no Render.
- Teste E2E de browser.

O ambiente desta sessão não possui `psql` disponível. Portanto, não declarar banco ou deploy como verificados até o teste local/Render ser executado.

## v0.2.2 Environment Fix

The environment loader was hardened after Windows/npm commands still reported `DATABASE_URL is required` despite a project `.env` being configured. The loader now resolves `.env` from the repository root using `__dirname`, rather than relying only on `process.cwd()`.


## v0.2.3 hotfix

The static security test now explicitly excludes `.env.example`, which is a non-secret template and may contain a localhost PostgreSQL example URL.


## v0.3.0 validation
- `npm run check`: PASS
- `npm test`: 15/15 PASS
- Governance migration and API static coverage: PASS
- Real Render database migration was not executed in this build environment.


## v0.6.0 Professional Calendar
- `npm test`: 41/41 PASS
- `npm run check`: PASS
- `npm run build`: PASS
- migrations 001–008 SHA256 preservadas; migration 009 adicionada de forma não destrutiva.
- PostgreSQL/Render remoto ainda requer validação executando `npm run db:migrate` no ambiente do usuário.


## v1.0.4 — Task Filters Regression Fix

- `npm test`: 90/90 PASS
- `npm run check`: PASS
- `npm run build`: PASS
- PostgreSQL real/Render: não executado nesta sessão.
- E2E de browser: não executado nesta sessão.
- Migration nova: nenhuma.


## v1.0.6

- Baseline v1.0.5: 92/92 PASS.
- Current suite: 103/103 PASS.
- Added 11 tests covering acceptance checklist, evidence requirements, approval readiness, server-side approval blocking, authorization, regression and CSP/spacing.
- `npm run check`: PASS.
- `npm run build`: PASS.
- `npm run verify`: PASS.
- Migrations 001–014 unchanged; migration 015 added append-only.
