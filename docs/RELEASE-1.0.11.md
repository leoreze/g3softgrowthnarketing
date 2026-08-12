# G3Soft Growth OS v1.0.11

## Remote/Production Database Migration

This release removes the local-only database preparation flow. The official migration command is now environment-agnostic:

```bash
npm run db:migrate
```

It may be executed against the configured Render PostgreSQL / production database when intentionally authorized. Migrations are incremental and tracked in `schema_migrations`.

### Important

- `npm run db:migrate` is allowed for remote/production databases.
- `npm run db:reset` remains prohibited in production and must never be used against production data.
- No new migration was introduced in v1.0.11. Migration `015_task_acceptance_evidence_intelligence.sql` remains the required schema change for Execution Evidence & Approval Intelligence.

## Recommended local terminal flow when DATABASE_URL points to the intended remote database

```bash
npm ci
npm run db:status
npm run db:migrate
npm run db:doctor
npm run verify
npm start
```

If the application is deployed on Render, the configured start command already runs `npm run db:migrate` before `npm start`.
