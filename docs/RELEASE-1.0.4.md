# Release v1.0.4 — Task Filters Regression Fix

## Problema

Ao abrir a tela **Tarefas**, `bindFilters()` tentava registrar `onchange` em `#dueFilter`. Esse elemento existe somente no Kanban, portanto a referência era `null` e interrompia `renderTasks()`. O erro aparecia como:

```text
Uncaught TypeError: Cannot set properties of null (setting 'onchange')
```

## Correção

`bindFilters()` passou a tratar defensivamente os controles condicionais:

- `#searchFilter`;
- `#clearFilters`;
- `#dueFilter`.

O filtro de atrasadas continua ativo no Kanban e as telas que não possuem esse controle deixam de falhar durante a renderização.

## Banco

Nenhuma migration nova. Não executar `npm run db:reset` em produção.

## Validação

- `npm test`: 90/90 PASS
- `npm run check`: PASS
- `npm run build`: PASS

A suíte contém cobertura específica de regressão para `bindFilters()` sem `#dueFilter`.

## Deploy

Publicar normalmente no Render. Após o deploy, executar hard refresh no navegador (`Ctrl + F5`) para descartar cache antigo do `app.js`.
