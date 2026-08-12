# G3Soft Growth OS v0.3.3 — Authentication Credential Repair

## Why

A `401 INVALID_CREDENTIALS` can persist when a seeded user already exists with an old password hash. The previous seed only inserted missing users; it did not repair an existing development account.

## Fix

In non-production environments, `npm run db:seed` now:

1. creates the seeded users when missing;
2. updates their password hash from `SEED_ADMIN_PASSWORD`;
3. reactivates them;
4. remains idempotent.

Production seed remains blocked.

## Recovery

With the intended `.env` loaded:

```powershell
npm run db:migrate
npm run db:seed
npm run db:status
npm run dev
```

Then log in with the values from `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

Do not run `db:reset` against the Render database.
