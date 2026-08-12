# G3Soft Growth OS v1.0.10

## Database readiness hardening

- Removed version-specific v1.0.6 wording from the task-details migration diagnostic.
- `/api/ready` checks the execution/approval schema introduced by migration 015.
- `db:doctor` reports pending migrations and readiness of migration 015.
- v1.0.11 supersedes the temporary local-only preparation command and standardizes `npm run db:migrate` across environments.
