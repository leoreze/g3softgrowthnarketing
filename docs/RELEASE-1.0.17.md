# G3Soft Growth OS v1.0.17

## CRUD completo, governança clara e UX em português do Brasil

### Entregas

- Aprovações com contexto explícito do item que o aprovador deve analisar.
- Critérios de aceite, evidências, entregável e prontidão apresentados no detalhe da aprovação.
- Interface principal e rótulos de workflow traduzidos para português do Brasil.
- CRUD de fases.
- CRUD de tarefas.
- CRUD de microtarefas.
- CRUD de conteúdos.
- CRUD de campanhas.
- CRUD de automações.
- Edição e exclusão protegidas por autorização server-side.
- Auditoria mantida nas operações de alteração e exclusão.
- Espaçamento vertical de 20px entre cards de microtarefas.
- Campo de adicionar microtarefa com margem superior e inferior de 20px.
- Espaçamento vertical de 20px entre cards de automações.
- Content Planner mantém drag & drop.

## Banco de dados

Nenhuma migration nova foi criada na v1.0.17.

As migrations existentes 001–017 foram preservadas.

## Segurança

- Exclusão de campanha bloqueada quando há aprovação pendente.
- Exclusão de conteúdo bloqueada quando há aprovação pendente.
- Edição de tarefa validada no servidor.
- Edição/exclusão de microtarefas validada no servidor.
- CRUD de automações limitado a ADMIN/MANAGER.

## Testes

- Baseline anterior: 132 testes.
- Novos testes: 12.
- Resultado: **144/144 PASS**.
- `npm run check`: PASS.
- `npm run build`: PASS.

## Banco remoto

A aplicação continua preparada para PostgreSQL remoto/Render.

Não executar reset para esta versão.
