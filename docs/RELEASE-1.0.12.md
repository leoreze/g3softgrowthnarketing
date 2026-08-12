# G3Soft Growth OS v1.0.12

## Legacy cleanup and remote database workflow

- Removes dependency on the obsolete local-only preparation command.
- Adds `npm run clean:legacy`, which removes only `src/db/local-prepare.js` if an older extracted project left it behind.
- Keeps `npm run db:migrate` environment-agnostic for the configured PostgreSQL database, including remote/production.
- Keeps destructive `npm run db:reset` protected in production.
- No database migration is added in this release.

## Validation

- `npm test`: 122/122
- `npm run check`: PASS
- `npm run build`: PASS
