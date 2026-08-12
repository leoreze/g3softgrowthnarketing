# Deploy Render — G3Soft Growth OS v1.0.20

## 1. Segurança imediata

Nunca coloque `DATABASE_URL` real no Git, README, screenshots ou prompts públicos.
Se uma credencial de banco for compartilhada fora do ambiente seguro, faça rotação da senha no Render antes do deploy.

## 2. PostgreSQL

Use o `DATABASE_URL` privado fornecido pelo Render como variável de ambiente do Web Service.

## 3. Variáveis

```text
NODE_ENV=production
DATABASE_URL=<secret do Render>
SESSION_SECRET=<secret aleatório com pelo menos 32 caracteres>
CORS_ORIGIN=<origem pública do app>
```

## 4. Build / Start

```text
Build: npm install
Pre-deploy: npm run db:migrate
Start: npm start
Health: /api/ready
```

O projeto atualmente não versiona `package-lock.json`; portanto, o Render usa `npm install`. Se um lockfile for adotado futuramente, altere o Build Command para `npm ci`.

## 5. Banco de produção

```bash
npm run db:migrate
```

Nunca execute `npm run db:reset` no banco de produção ou em qualquer banco remoto.

## 6. Primeiro administrador

Não use `db:seed` em produção nem contra bancos remotos. Para provisionamento explícito, use `db:bootstrap` com confirmação. Configure temporariamente no Render:

```text
BOOTSTRAP_ADMIN_EMAIL
BOOTSTRAP_ADMIN_PASSWORD
BOOTSTRAP_ADMIN_NAME
```

Execute:

```bash
npm run db:bootstrap
```

Depois remova/limpe essas variáveis de bootstrap do ambiente.

## Deploy via GitHub

Repositório: `leoreze/g3softgrowthnarketing`

Branch de produção: `main`

O Blueprint `render.yaml` configura o Web Service para instalar dependências, aplicar migrations incrementais antes do start e usar `/api/ready` como health check.

### Variáveis obrigatórias no Render

- `NODE_ENV=production`
- `DATABASE_URL` — PostgreSQL do Render
- `SESSION_SECRET` — segredo aleatório com pelo menos 32 caracteres
- `CORS_ORIGIN` — URL pública do Web Service, sem barra final

Nunca comite `.env` ou credenciais.
