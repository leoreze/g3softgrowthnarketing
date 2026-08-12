# Release v1.0.5 — Task Comment Permission Regression Fix

## Problema

Ao abrir uma tarefa no **Task Execution Center**, o frontend utilizava `canCommentTask` para decidir se o formulário de comentários deveria ser renderizado, mas essa variável não havia sido definida no escopo de `taskDetails()`. Isso produzia:

```text
ReferenceError: canCommentTask is not defined
```

## Correção

Foi definida a permissão no frontend antes da montagem do modal:

```js
const canCommentTask = canOperate || state.user?.role === 'STAKEHOLDER';
```

A regra corresponde à autorização existente no backend.

## Banco

Nenhuma migration nova. Nenhuma alteração de schema.

## Validação

- `npm test`: 92/92 PASS
- `npm run check`: PASS
- `npm run build`: PASS

A suíte preserva os 90 testes da v1.0.4 e adiciona 2 testes de regressão para o comentário da tarefa.

## Deploy

Deploy normal no Render. Não executar `npm run db:reset`. Após publicar, fazer `Ctrl + F5`.
