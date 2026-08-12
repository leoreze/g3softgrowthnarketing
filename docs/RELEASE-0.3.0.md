# Release v0.3.0 — Governance

## Scope
Governance and multi-step approval for tasks, preserving v0.2.x work management and authentication.

## Database
Migration: `005_governance.sql`.

New tables:
- `approval_requests`
- `approval_steps`
- `approval_decisions`

No destructive operations are included.

## Workflow

`IN_PROGRESS` / `REJECTED` → `PENDING_APPROVAL` → `APPROVED` or `REJECTED`.

A standard task approval creates a reviewer step when `reviewer_id` is assigned, followed by a `STAKEHOLDER` step. Every decision is immutable in `approval_decisions`.

## Commands

```powershell
npm install
npm run check
npm test
npm run db:status
npm run db:migrate
npm run db:doctor
npm run dev
```

Do not run `db:reset` or `db:seed` against the Render database.
