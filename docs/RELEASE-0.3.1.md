# Release v0.3.1 — Authentication Hardening

## Problem addressed
The login endpoint could correctly return HTTP 401 while the real cause remained opaque operationally: missing/inactive user, password mismatch, or malformed stored bcrypt hash. This release hardens the authentication path and adds a safe operator diagnostic.

## Changes
- Centralized authentication in `src/services/auth.js`.
- Case-insensitive email lookup while preserving the original stored address.
- Defensive bcrypt verification.
- Explicit session regeneration/save before returning a successful login.
- Added `last_login_at` column and a case-insensitive email index.
- Added `npm run db:auth-check` for local/test/explicitly-confirmed remote diagnosis. It never prints passwords or password hashes.
- Removed the insecure 11-character seed fallback; `SEED_ADMIN_PASSWORD` is now required and must have at least 12 characters.
- Bootstrap validates admin email and password length.
- Frontend version updated to v0.3.1.

## Database
Migration: `006_auth_hardening.sql`

No destructive operations.

## Safe diagnosis
PowerShell example:

```powershell
$env:AUTH_CHECK_EMAIL="admin@g3soft.local"
$env:AUTH_CHECK_PASSWORD="SUA-SENHA-COM-12+-CARACTERES"
npm run db:auth-check
Remove-Item Env:AUTH_CHECK_EMAIL,Env:AUTH_CHECK_PASSWORD -ErrorAction SilentlyContinue
```

For a remote/production database, also set `BOOTSTRAP_REMOTE_CONFIRM=YES` for the diagnostic command only. Never commit these variables.

Expected output:

```text
ACCOUNT: ACTIVE
ROLE: ADMIN
PASSWORD_MATCH: YES
LOGIN_READY: YES
```

If `PASSWORD_MATCH: NO`, run the existing `db:bootstrap` with the intended admin password to repair the credential. No database reset is required.
