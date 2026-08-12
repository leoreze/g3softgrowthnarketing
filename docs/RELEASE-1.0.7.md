# G3Soft Growth OS v1.0.7

## Correções

- Task Execution Center: diagnóstico explícito quando a migration 015 não está aplicada.
- Envio para aprovação: `/api/tasks/:id/submit` agora cria a solicitação de aprovação e as etapas do workflow, preservando compatibilidade.
- Aprovação/rejeição no modal: decisão passa pelo endpoint de governança `/api/approvals/:id/decision`.
- Content Planner: cards agora podem ser arrastados entre as colunas do workflow e o status é persistido via API.

## Banco

Nenhuma migration nova. A v1.0.7 depende da migration 015 já existente na v1.0.6.

Se o banco local ainda não tiver a 015:

```bash
npm run db:migrate
```

Não usar `npm run db:reset` em produção.
