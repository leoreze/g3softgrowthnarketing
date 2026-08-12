# G3Soft Growth OS — v1.0.20

## Objetivo

Preparar a v1.0.19 para publicação no GitHub e deploy contínuo no Render.

## Alterações

- CI com GitHub Actions.
- `render.yaml` com migrations no pre-deploy.
- Auto-deploy condicionado a checks do GitHub.
- Health check `/api/ready`.
- Bind HTTP em `0.0.0.0`.
- Segredos permanecem fora do Git.

## Banco

Nenhuma migration nova. O deploy aplica somente as migrations existentes via `npm run db:migrate`.

## Segurança

`DATABASE_URL` e `SESSION_SECRET` são `sync: false` no Blueprint e devem ser configurados como secrets no Render.
