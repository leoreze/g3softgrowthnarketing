const express=require('express');
const crypto=require('crypto');
const pool=require('../db/pool');
const {requireAuth,requireRole}=require('../middleware/auth');
const audit=require('../middleware/audit');
const {uuid,text}=require('../validators/common');
const {getTaskReadiness}=require('../services/task-acceptance');

const router=express.Router();
router.use(requireAuth);

const roleRank={USER:1,MANAGER:2,STAKEHOLDER:3,ADMIN:4};
function canApprove(step,user){
  if(step.approver_user_id) return step.approver_user_id===user.id;
  return step.approver_role===user.role || (user.role==='ADMIN' && roleRank[user.role]>=roleRank[step.approver_role||'USER']);
}

async function getRequest(id,client=pool){
  const r=await client.query(`
    SELECT ar.*,t.title task_title,t.description task_description,t.status task_status,ci.title content_title,ci.status content_status,
           t.reviewer_id,t.assignee_id,t.approval_note,t.rejection_note,
           c.name campaign_name,c.status campaign_status,
           u.name requested_by_name
    FROM approval_requests ar
    LEFT JOIN tasks t ON ar.entity='task' AND t.id=ar.entity_id
    LEFT JOIN campaigns c ON ar.entity='campaign' AND c.id=ar.entity_id
    LEFT JOIN content_items ci ON ar.entity='content' AND ci.id=ar.entity_id
    LEFT JOIN users u ON u.id=ar.requested_by
    WHERE ar.id=$1
  `,[id]);
  return r.rows[0];
}

router.get('/',async(req,res,next)=>{
  try{
    const status=req.query.status?String(req.query.status).toUpperCase():'PENDING';
    const r=await pool.query(`
      SELECT ar.id,ar.entity,ar.entity_id,ar.workflow,ar.workflow_definition_id,ar.status,ar.version,
             ar.requested_at,ar.resolved_at,ar.resolution_note,
             t.title task_title,t.status task_status,t.reviewer_id,
             c.name campaign_name,c.status campaign_status,
             a.name assignee_name,p.name phase_name,req.name requested_by_name,
             COALESCE((SELECT json_agg(json_build_object(
               'id',x.id,'step_order',x.step_order,'approver_role',x.approver_role,
               'approver_user_id',x.approver_user_id,'status',x.status,
               'decided_at',x.decided_at,'decision_note',x.decision_note
             ) ORDER BY x.step_order)
             FROM (SELECT s.id,s.step_order,s.approver_role,s.approver_user_id,s.status,s.decided_at,s.decision_note
                   FROM approval_steps s WHERE s.request_id=ar.id ORDER BY s.step_order) x),'[]'::json) AS steps
      FROM approval_requests ar
      LEFT JOIN tasks t ON ar.entity='task' AND t.id=ar.entity_id
      LEFT JOIN campaigns c ON ar.entity='campaign' AND c.id=ar.entity_id
      LEFT JOIN phases p ON p.id=t.phase_id
      LEFT JOIN users a ON a.id=t.assignee_id
      LEFT JOIN users req ON req.id=ar.requested_by
      WHERE ($1='ALL' OR ar.status=$1)
      ORDER BY ar.requested_at DESC
    `,[status]);
    res.json({data:r.rows});
  }catch(e){next(e);}
});

router.get('/:id',async(req,res,next)=>{
  try{
    const id=uuid(req.params.id);
    const request=await getRequest(id);
    if(!request)return res.status(404).json({error:'NOT_FOUND',message:'Solicitação de aprovação não encontrada.'});
    const steps=await pool.query(`
      SELECT s.*,u.name approver_user_name,
        d.comment last_comment
      FROM approval_steps s
      LEFT JOIN users u ON u.id=s.approver_user_id
      LEFT JOIN LATERAL (
        SELECT comment FROM approval_decisions d
        WHERE d.step_id=s.id ORDER BY d.created_at DESC LIMIT 1
      ) d ON TRUE
      WHERE s.request_id=$1 ORDER BY s.step_order
    `,[id]);
    let context={type:request.entity};
    if(request.entity==='task'){
      const task=(await pool.query('SELECT t.title,t.description,t.status,t.priority,t.execution_type,t.deliverable,t.deliverable_status,p.name phase_name,c.name campaign_name FROM tasks t JOIN phases p ON p.id=t.phase_id JOIN campaigns c ON c.id=p.campaign_id WHERE t.id=$1',[request.entity_id])).rows[0];
      const readiness=task?await getTaskReadiness(pool,request.entity_id):null;
      const evidence=task?(await pool.query('SELECT e.id,e.title,e.evidence_type,e.url,e.description,e.created_at,u.name user_name FROM task_evidence e LEFT JOIN users u ON u.id=e.user_id WHERE e.task_id=$1 ORDER BY e.created_at DESC',[request.entity_id])).rows:[];
      const criteria=task?(await pool.query('SELECT id,title,description,required,is_complete,system_key FROM task_acceptance_criteria WHERE task_id=$1 ORDER BY position,created_at',[request.entity_id])).rows:[];
      context={...context,task,readiness,evidence,criteria};
    } else if(request.entity==='content') context.content=(await pool.query('SELECT ci.title,ci.format,ci.channel,ci.status,ci.copy,ci.cta,ci.scheduled_at,ca.name campaign_name,p.name phase_name FROM content_items ci LEFT JOIN campaigns ca ON ca.id=ci.campaign_id LEFT JOIN phases p ON p.id=ci.phase_id WHERE ci.id=$1',[request.entity_id])).rows[0]||null;
    else if(request.entity==='campaign') context.campaign=(await pool.query('SELECT name,description,objective,status,start_date,end_date,budget_cents,target_segment,landing_page_url FROM campaigns WHERE id=$1',[request.entity_id])).rows[0]||null;
    res.json({data:{request,steps:steps.rows,context}});
  }catch(e){next(e);}
});

const {createRequestFromWorkflow}=require('../services/approval-workflow');

router.post('/tasks/:id/submit',async(req,res,next)=>{
  const taskId=uuid(req.params.id);const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const task=(await client.query('SELECT * FROM tasks WHERE id=$1 FOR UPDATE',[taskId])).rows[0];
    if(!task)return res.status(404).json({error:'NOT_FOUND',message:'Tarefa não encontrada.'});
    if(task.assignee_id&&task.assignee_id!==req.user.id&&req.user.role!=='ADMIN')return res.status(403).json({error:'FORBIDDEN',message:'Somente o responsável ou ADMIN pode enviar para aprovação.'});
    if(!['IN_PROGRESS','REJECTED'].includes(task.status))return res.status(409).json({error:'INVALID_WORKFLOW',message:'A tarefa precisa estar em execução ou rejeitada.'});
    const readiness=await getTaskReadiness(client,taskId);
    if(!readiness?.ready)return res.status(409).json({error:'TASK_NOT_READY_FOR_APPROVAL',message:'A tarefa ainda não atende aos critérios mínimos de aprovação.',details:{criteria:readiness?.criteria?.missing||[],evidence:readiness?.evidence?.missing||[],deliverable:readiness?.deliverable?.ready}});
    const open=await client.query("SELECT id FROM approval_requests WHERE entity='task' AND entity_id=$1 AND status='PENDING' FOR UPDATE",[taskId]);
    if(open.rowCount)return res.status(409).json({error:'APPROVAL_ALREADY_OPEN',message:'Já existe uma aprovação pendente para esta tarefa.'});
    const created=await createRequestFromWorkflow(client,{entity:'task',entityId:taskId,workflowType:'TASK',requestedBy:req.user.id,legacyReviewerId:task.reviewer_id});
    await client.query("UPDATE tasks SET status='PENDING_APPROVAL',updated_at=NOW() WHERE id=$1",[taskId]);
    await client.query('INSERT INTO task_status_history(id,task_id,changed_by,from_status,to_status,note) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),taskId,req.user.id,task.status,'PENDING_APPROVAL','Enviada para aprovação']);
    await client.query('COMMIT');
    const after=await getRequest(created.requestId);
    await audit(req,{action:'SUBMIT_APPROVAL',entity:'task',entityId:taskId,beforeData:{status:task.status},afterData:{status:'PENDING_APPROVAL',approval_request_id:created.requestId,workflow:created.workflow?.name}});
    res.status(201).json({data:after});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);}
  finally{client.release();}
});

router.post('/campaigns/:id/submit',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{
  const campaignId=uuid(req.params.id);const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const campaign=(await client.query('SELECT * FROM campaigns WHERE id=$1 FOR UPDATE',[campaignId])).rows[0];
    if(!campaign)return res.status(404).json({error:'NOT_FOUND',message:'Campanha não encontrada.'});
    if(!['DRAFT','PAUSED'].includes(campaign.status))return res.status(409).json({error:'INVALID_WORKFLOW',message:'A campanha precisa estar em DRAFT ou PAUSED.'});
    const open=await client.query("SELECT id FROM approval_requests WHERE entity='campaign' AND entity_id=$1 AND status='PENDING' FOR UPDATE",[campaignId]);
    if(open.rowCount)return res.status(409).json({error:'APPROVAL_ALREADY_OPEN',message:'Já existe uma aprovação pendente para esta campanha.'});
    const created=await createRequestFromWorkflow(client,{entity:'campaign',entityId:campaignId,workflowType:'CAMPAIGN',requestedBy:req.user.id,version:1});
    await client.query('COMMIT');
    const after=await getRequest(created.requestId);
    await audit(req,{action:'SUBMIT_APPROVAL',entity:'campaign',entityId:campaignId,beforeData:{status:campaign.status},afterData:{status:'PENDING_APPROVAL',approval_request_id:created.requestId,workflow:created.workflow?.name}});
    res.status(201).json({data:after});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);}
  finally{client.release();}
});

router.post('/content/:id/submit',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{const contentId=uuid(req.params.id);const client=await pool.connect();try{await client.query('BEGIN');const content=(await client.query('SELECT * FROM content_items WHERE id=$1 FOR UPDATE',[contentId])).rows[0];if(!content)return res.status(404).json({error:'NOT_FOUND',message:'Conteúdo não encontrado.'});if(req.user.role==='USER'&&content.owner_id!==req.user.id)return res.status(403).json({error:'FORBIDDEN',message:'Somente o responsável pode enviar este conteúdo.'});const submittableStatuses=['IDEA','BRIEF','PRODUCTION','REVIEW','REJECTED'];if(!submittableStatuses.includes(content.status))return res.status(409).json({error:'INVALID_WORKFLOW',message:'O conteúdo precisa estar em IDEA, BRIEF, PRODUCTION, REVIEW ou REJECTED para ser enviado à aprovação.'});const open=await client.query("SELECT id FROM approval_requests WHERE entity='content' AND entity_id=$1 AND status='PENDING' FOR UPDATE",[contentId]);if(open.rowCount)return res.status(409).json({error:'APPROVAL_ALREADY_OPEN',message:'Já existe uma aprovação pendente para este conteúdo.'});const originalStatus=content.status;if(originalStatus!=='REVIEW')await client.query("UPDATE content_items SET status='REVIEW',updated_at=NOW() WHERE id=$1",[contentId]);const created=await createRequestFromWorkflow(client,{entity:'content',entityId:contentId,workflowType:'CONTENT',requestedBy:req.user.id,version:1});await client.query("UPDATE content_items SET status='PENDING_APPROVAL',updated_at=NOW() WHERE id=$1",[contentId]);await client.query('COMMIT');await audit(req,{action:'SUBMIT_APPROVAL',entity:'content',entityId:contentId,beforeData:{status:originalStatus},afterData:{status:'PENDING_APPROVAL',approval_request_id:created.requestId}});res.status(201).json({data:{request_id:created.requestId}})}catch(e){await client.query('ROLLBACK').catch(()=>{});next(e)}finally{client.release()}});

router.post('/:id/decision',async(req,res,next)=>{
  const id=uuid(req.params.id);
  const decision=String(req.body.decision||'').toUpperCase();
  if(!['APPROVED','REJECTED'].includes(decision))return res.status(400).json({error:'INVALID_DECISION',message:'Decisão inválida.'});
  const comment=text(req.body.comment||'',2000)||null;
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const request=await getRequest(id,client);
    if(!request)return res.status(404).json({error:'NOT_FOUND',message:'Solicitação de aprovação não encontrada.'});
    if(request.status!=='PENDING')return res.status(409).json({error:'APPROVAL_RESOLVED',message:'Esta aprovação já foi resolvida.'});
    const step=(await client.query("SELECT * FROM approval_steps WHERE request_id=$1 AND status='PENDING' ORDER BY step_order LIMIT 1 FOR UPDATE",[id])).rows[0];
    if(!step)return res.status(409).json({error:'WORKFLOW_INVALID',message:'Nenhuma etapa pendente encontrada.'});
    const entityId=request.entity_id;
    const task=request.entity==='task'?(await client.query('SELECT * FROM tasks WHERE id=$1 FOR UPDATE',[entityId])).rows[0]:null;
    const campaign=request.entity==='campaign'?(await client.query('SELECT * FROM campaigns WHERE id=$1 FOR UPDATE',[entityId])).rows[0]:null;
    const content=request.entity==='content'?(await client.query('SELECT * FROM content_items WHERE id=$1 FOR UPDATE',[entityId])).rows[0]:null;
    if(!task&&!campaign&&!content)return res.status(404).json({error:'NOT_FOUND',message:'Entidade da aprovação não encontrada.'});
    if(!canApprove(step,req.user))return res.status(403).json({error:'FORBIDDEN',message:'Você não pode decidir esta etapa.'});

    const nextStep=(await client.query('SELECT * FROM approval_steps WHERE request_id=$1 AND step_order>$2 ORDER BY step_order LIMIT 1',[id,step.step_order])).rows[0];
    await client.query('UPDATE approval_steps SET status=$1,decision_note=$2,decided_by=$3,decided_at=NOW() WHERE id=$4',[decision,comment,req.user.id,step.id]);
    await client.query('INSERT INTO approval_decisions(id,request_id,step_id,decision,decided_by,comment,entity_version) VALUES($1,$2,$3,$4,$5,$6,$7)',[crypto.randomUUID(),id,step.id,decision,req.user.id,comment,request.version]);

    if(decision==='REJECTED'){
      await client.query("UPDATE approval_requests SET status='REJECTED',resolved_at=NOW(),resolved_by=$1,resolution_note=$2 WHERE id=$3",[req.user.id,comment,id]);
      if(task){
        await client.query("UPDATE tasks SET status='REJECTED',rejection_note=$1,updated_at=NOW() WHERE id=$2",[comment,entityId]);
        await client.query('INSERT INTO task_status_history(id,task_id,changed_by,from_status,to_status,note) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),entityId,req.user.id,task.status,'REJECTED',comment||'Rejeitada']);
      }else if(campaign){
        await client.query("UPDATE campaigns SET status='DRAFT',updated_at=NOW() WHERE id=$1",[entityId]);
      }else{ await client.query("UPDATE content_items SET status='REJECTED',updated_at=NOW() WHERE id=$1",[entityId]); }
    }else if(!nextStep){
      await client.query("UPDATE approval_requests SET status='APPROVED',resolved_at=NOW(),resolved_by=$1,resolution_note=$2 WHERE id=$3",[req.user.id,comment,id]);
      if(task){
        await client.query("UPDATE tasks SET status='APPROVED',approval_note=$1,updated_at=NOW() WHERE id=$2",[comment||'Aprovada',entityId]);
        await client.query('INSERT INTO task_status_history(id,task_id,changed_by,from_status,to_status,note) VALUES($1,$2,$3,$4,$5,$6)',[crypto.randomUUID(),entityId,req.user.id,task.status,'APPROVED',comment||'Aprovada']);
      }else if(campaign){
        await client.query("UPDATE campaigns SET status='ACTIVE',updated_at=NOW() WHERE id=$1",[entityId]);
      }else{ await client.query("UPDATE content_items SET status='APPROVED',updated_at=NOW() WHERE id=$1",[entityId]); }
    }

    await client.query('COMMIT');
    await audit(req,{action:decision==='APPROVED'?'APPROVE':'REJECT',entity:'approval_request',entityId:id,beforeData:{status:request.status},afterData:{decision,step:step.step_order,comment}});
    res.json({data:{request_id:id,entity:request.entity,decision,step:step.step_order,completed:!nextStep||decision==='REJECTED'}});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);}
  finally{client.release();}
});

module.exports=router;
