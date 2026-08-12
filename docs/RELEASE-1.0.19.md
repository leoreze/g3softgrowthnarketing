# G3Soft Growth OS — v1.0.19

## Objetivo
Garantir que os menus de três pontinhos do Planejador de conteúdo e de Campanhas apareçam acima de todos os conteúdos vizinhos.

## Alterações
- Camada de empilhamento elevada para o máximo prático do navegador (`2147483647`), com valor solicitado documentado no CSS.
- O hospedeiro do menu recebe `action-menu-host-open` enquanto o menu está aberto.
- Campanhas deixam de recortar o menu aberto pelo `overflow` do painel.
- Fechamento do menu remove o estado de camada superior.
- Nenhuma alteração de banco.

## QA
- Testes anteriores preservados.
- Testes específicos de layering adicionados em `tests/v119.action-menu-layering.test.js`.
- `npm run check`: PASS
- `npm run build`: PASS
