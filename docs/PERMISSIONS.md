# Permissions — v0.5.0

| Role | Workflows | Task approval | Campaign approval |
|---|---|---|---|
| ADMIN | create/activate/archive | approve | submit/approve |
| MANAGER | create/activate/archive | approve only when assigned by workflow | submit |
| STAKEHOLDER | view | approve when workflow step targets role | approve when workflow step targets role |
| USER | view | approve only when explicitly targeted | no |

All authorization is enforced server-side. Frontend controls are convenience only.
