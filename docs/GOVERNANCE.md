# Governance v0.3.0

## Task approval workflow

IN_PROGRESS / REJECTED → PENDING_APPROVAL → APPROVED or REJECTED.

A standard request creates a reviewer step when the task has `reviewer_id`, followed by a STAKEHOLDER step. Each decision is stored in `approval_decisions` and the request status is resolved only after the final step.

## API

- `GET /api/approvals?status=PENDING`
- `GET /api/approvals/:id`
- `POST /api/approvals/tasks/:id/submit`
- `POST /api/approvals/:id/decision`

Decision body:

```json
{"decision":"APPROVED","comment":"Validado."}
```

or

```json
{"decision":"REJECTED","comment":"Ajustar CTA e revisar copy."}
```

## Security

All endpoints require authentication. Approval authority is enforced server-side. Critical mutations use PostgreSQL transactions and create audit records. No passwords, tokens or secrets are written to audit logs.
