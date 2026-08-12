# Authentication troubleshooting

If login returns `401 INVALID_CREDENTIALS` after a fresh setup, run:

```powershell
npm run db:seed
```

The development seed is idempotent and repairs the seeded ADMIN password hash. It does not reset or delete the database.

Then restart the server:

```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
npm run dev
```

Default development credentials are controlled by `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` in `.env`. Never commit `.env`.
