# Deploy G3Soft Growth OS — GitHub + Render

## Repositório

`https://github.com/leoreze/g3softgrowthnarketing`

## Git Bash

```bash
# dentro da pasta do projeto
git init
git branch -M main
git remote add origin https://github.com/leoreze/g3softgrowthnarketing.git
git add .
git status
git commit -m "chore: prepare G3Soft Growth OS v1.0.20 for Render"
git push -u origin main
```

Se o remote `origin` já existir:

```bash
git remote set-url origin https://github.com/leoreze/g3softgrowthnarketing.git
```

## Validação local apontando para PostgreSQL remoto

```bash
npm install
npm run db:status
npm run db:migrate
npm run db:doctor
npm run check
npm test
npm run build
npm start
```

Não execute `npm run db:reset` contra o PostgreSQL remoto.

## Render

1. No Render, crie um **New + → Blueprint** ou um **Web Service** ligado ao repositório.
2. O `render.yaml` já define o serviço `g3soft-growth-marketing`.
3. Configure os secrets: `DATABASE_URL`, `SESSION_SECRET` e `CORS_ORIGIN`.
4. O Build Command é `npm install`.
5. O Pre-Deploy Command é `npm run db:migrate`.
6. O Start Command é `npm start`.
7. O Health Check é `/api/ready`.
8. O auto-deploy usa `checksPass`, então o Render só deve implantar depois dos checks do GitHub Actions passarem.

### Primeiro administrador

Depois que as migrations estiverem aplicadas, use o bootstrap explícito conforme `docs/DEPLOY-RENDER.md`. Não use o seed de desenvolvimento em produção.
