const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');

test('v1.0.16 Content Planner sends approval through the approval endpoint only',()=>{
  const j=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  assert.match(j,/\/api\/approvals\/content\/\$\{id\}\/submit/);
  assert.doesNotMatch(j,/data-content-submit[^]*?api\(`\/api\/content\/\$\{b\.dataset\.contentSubmit\}/);
});

test('v1.0.16 Content Planner enables approval submission from executable workflow states',()=>{
  const j=fs.readFileSync(path.join(root,'public/js/app.js'),'utf8');
  assert.match(j,/\['IDEA','BRIEF','PRODUCTION','REVIEW','REJECTED'\]\.includes\(x\.status\)/);
});

test('v1.0.16 content approval endpoint can promote content to REVIEW before creating approval',()=>{
  const r=fs.readFileSync(path.join(root,'src/routes/approvals.js'),'utf8');
  assert.match(r,/submittableStatuses=\['IDEA','BRIEF','PRODUCTION','REVIEW','REJECTED'\]/);
  assert.match(r,/originalStatus!==['"]REVIEW['"]/);
  assert.match(r,/workflowType:'CONTENT'/);
});
