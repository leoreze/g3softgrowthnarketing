# G3Soft Growth OS v1.0.8

## Objetivo
Correção de regressão da tela Aprovações após a v1.0.7.

## Bug corrigido
`render()` referenciava `renderApprovals`, mas a função não estava presente em `public/js/app.js`, causando `ReferenceError` e impedindo a navegação/renderização da tela Aprovações.

## Correção
- Restaurado `renderApprovals()`.
- Cards de aprovação continuam abrindo `approvalDetails(id)`.
- Nenhuma migration nova.

## Validação
- Baseline v1.0.7 preservado.
- Novo teste de regressão para `renderApprovals`.
- `npm run check`.
- `npm test`.
- `npm run build`.
