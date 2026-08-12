# G3Soft Growth OS v0.3.4

## Seed transaction fix

Fixed the development seed task INSERT parameter binding. The statement previously reused `$6` and `$8` while supplying nine values, causing the transaction to fail and roll back after the ADMIN/user rows had been prepared. That left the ADMIN absent and surfaced as `401 INVALID_CREDENTIALS` during login.

The task insert now binds `$1` through `$9` correctly.

## Authentication impact

No authentication route or password algorithm was weakened. The existing idempotent seed continues to hash the configured development password with bcrypt and updates existing seeded users, so rerunning `npm run db:seed` repairs credential drift without deleting data.

## Database

No new migration. This is an application/seed bug fix only.
