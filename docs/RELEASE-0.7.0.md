# Release 0.7.0 — Growth Campaigns + Content Planner

## Scope
Connect calendar → campaigns → content → phases → tasks → approval.

## Database
Migration `010_growth_campaigns_content.sql` is additive. It adds campaign planning fields, campaign channels, content items, content workflow support and calendar linkage.

## Safety
Do not edit previous migrations. Do not reset production. Use `npm run db:migrate`.
