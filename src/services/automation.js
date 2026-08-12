const crypto=require('crypto');
const pool=require('../db/pool');

async function notify({userId,type,title,message,entityType=null,entityId=null,actionUrl=null}){
  if(!userId)return null;
  const id=crypto.randomUUID();
  const r=await pool.query(`INSERT INTO notifications(id,user_id,type,title,message,entity_type,entity_id,action_url)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8)
    ON CONFLICT(user_id,type,entity_type,entity_id,title) DO NOTHING RETURNING *`,
    [id,userId,type,title,message,entityType,entityId,actionUrl]);
  return r.rows[0]||null;
}

async function runRule(rule){
  const q=rule.trigger_type;
  let items=[];
  if(q==='TASK_DUE') items=(await pool.query(`SELECT t.id,t.title,t.assignee_id,t.due_date FROM tasks t WHERE t.due_date=CURRENT_DATE AND t.status NOT IN ('DONE','APPROVED') AND t.assignee_id IS NOT NULL`)).rows;
  if(q==='TASK_OVERDUE') items=(await pool.query(`SELECT t.id,t.title,t.assignee_id,t.due_date FROM tasks t WHERE t.due_date<CURRENT_DATE AND t.status NOT IN ('DONE','APPROVED') AND t.assignee_id IS NOT NULL`)).rows;
  if(q==='APPROVAL_PENDING') items=(await pool.query(`SELECT ar.id,ar.entity,ar.entity_id,ar.requested_by,COALESCE(t.title,c.name,ci.title,'Item') item_title FROM approval_requests ar LEFT JOIN tasks t ON ar.entity='task' AND t.id=ar.entity_id LEFT JOIN campaigns c ON ar.entity='campaign' AND c.id=ar.entity_id LEFT JOIN content_items ci ON ar.entity='content' AND ci.id=ar.entity_id WHERE ar.status='PENDING'`)).rows;
  if(q==='CONTENT_SCHEDULED') items=(await pool.query(`SELECT ci.id,ci.title,ci.owner_id,ci.scheduled_at FROM content_items ci WHERE ci.scheduled_at >= NOW() AND ci.scheduled_at < NOW()+INTERVAL '24 hours' AND ci.status IN ('SCHEDULED','APPROVED') AND ci.owner_id IS NOT NULL`)).rows;
  if(q==='CAMPAIGN_START') items=(await pool.query(`SELECT c.id,c.name,c.created_by FROM campaigns c WHERE c.start_date=CURRENT_DATE AND c.status IN ('DRAFT','ACTIVE') AND c.created_by IS NOT NULL`)).rows;
  let sent=0;
  for(const item of items){
    const triggerKey=`${q}:${item.id}:${q==='TASK_DUE'||q==='TASK_OVERDUE'||q==='CAMPAIGN_START'?new Date().toISOString().slice(0,10):new Date().toISOString().slice(0,13)}`;
    const recipient=q==='APPROVAL_PENDING'?item.requested_by:q==='CAMPAIGN_START'?item.created_by:q==='CONTENT_SCHEDULED'?item.owner_id:item.assignee_id;
    const title=rule.action_config?.title || 'G3Soft Growth OS';
    const message=q==='TASK_DUE'?`A tarefa “${item.title}” vence hoje.`:q==='TASK_OVERDUE'?`A tarefa “${item.title}” está atrasada desde ${item.due_date}.`:q==='APPROVAL_PENDING'?`“${item.item_title}” está aguardando aprovação.`:q==='CONTENT_SCHEDULED'?`O conteúdo “${item.title}” está programado para as próximas 24 horas.`:`A campanha “${item.name}” começa hoje.`;
    const run=await pool.query(`INSERT INTO automation_runs(id,rule_id,trigger_key,status,details) VALUES($1,$2,$3,'SUCCESS',$4) ON CONFLICT(rule_id,trigger_key) DO NOTHING RETURNING id`,[crypto.randomUUID(),rule.id,triggerKey,JSON.stringify({entity_id:item.id})]);
    if(!run.rowCount)continue;
    await notify({userId:recipient,type:'AUTOMATION',title,message,entityType:q,entityId:item.id,actionUrl:null});sent++;
  }
  await pool.query('UPDATE automation_rules SET last_run_at=NOW(),updated_at=NOW() WHERE id=$1',[rule.id]);
  return sent;
}

async function runAutomations(){
  const rules=(await pool.query(`SELECT * FROM automation_rules WHERE is_active=true ORDER BY created_at`)).rows;
  let total=0;for(const rule of rules)total+=await runRule(rule);return {rules:rules.length,notifications:total};
}
module.exports={notify,runAutomations};
