const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const app=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'public/css/app.css'),'utf8');

test('v1.0.18 CRUD actions are behind three-dot menus',()=>{
 assert.match(app,/data-action-menu-trigger/); assert.match(app,/Editar fase/); assert.match(app,/Excluir fase/); assert.match(app,/Editar tarefa/); assert.match(app,/Excluir tarefa/); assert.match(app,/Editar conteúdo/); assert.match(app,/Excluir conteúdo/); assert.match(app,/Editar automação/); assert.match(app,/Excluir automação/);
});
test('v1.0.18 overview phase cards do not render CRUD menus',()=>assert.match(app,/state\.phases\.map\(\(p,i\)=>phaseCard\(p,i,false\)/));
test('v1.0.18 action menus close outside and expose ARIA state',()=>{assert.match(app,/aria-expanded/);assert.match(app,/document\.addEventListener\('click'/);assert.match(app,/bindActionMenus\(\)/)});
test('v1.0.18 notifications are premium list items with Portuguese labels',()=>{assert.match(app,/notification-item-premium/);assert.match(app,/notification-unread/);assert.match(app,/Marcar como lida/);assert.match(app,/ptNotificationType/);assert.match(css,/\.notification-item-premium/);assert.match(css,/\.notification-empty-premium/)});
test('v1.0.18 action menus have premium contrast styling',()=>{assert.match(css,/\.action-menu-trigger/);assert.match(css,/\.action-menu-wrap\.is-open \.action-menu/);assert.match(css,/\.action-menu-item\.danger/)});
test('v1.0.18 menu baseline accepts current patch version',()=>assert.match(JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8')).version,/^1\.0\.(?:18|19|20|21|22|23|25|27|28)$/));

test('v1.0.18 task execution actions and workflow actions use contextual menus',()=>{
  assert.match(app,/Ações da tarefa/);
  assert.match(app,/action-menu-task/);
  assert.match(app,/Iniciar execução/);
  assert.match(app,/Enviar para aprovação/);
  assert.match(app,/Bloquear/);
  assert.match(app,/Aprovar/);
  assert.match(app,/Rejeitar/);
  assert.match(app,/Ativar fluxo/);
  assert.match(app,/Arquivar fluxo/);
});

test('v1.0.18 does not use inline style attributes in the frontend',()=>{
  const html=fs.readFileSync(path.join(root,'public/index.html'),'utf8');
  assert.doesNotMatch(app,/style\\s*=/i);
  assert.doesNotMatch(html,/style\\s*=/i);
});
