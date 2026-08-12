const crypto = require('crypto');

/**
 * Creates an immutable approval request snapshot from the currently active workflow.
 * The caller owns the surrounding transaction.
 */
async function createRequestFromWorkflow(client,{entity,entityId,workflowType,requestedBy,version=1,legacyReviewerId=null}){
  const workflow=(await client.query(`
    SELECT * FROM workflow_definitions
    WHERE entity_type=$1 AND status='ACTIVE'
    ORDER BY created_at ASC LIMIT 1
  `,[workflowType])).rows[0];
  const requestId=crypto.randomUUID();
  await client.query(`
    INSERT INTO approval_requests(id,entity,entity_id,workflow,status,version,requested_by,workflow_definition_id)
    VALUES($1,$2,$3,$4,'PENDING',$5,$6,$7)
  `,[requestId,entity,entityId,workflow?.name||`${workflowType}_STANDARD`,version,requestedBy,workflow?.id||null]);

  let templateSteps=workflow?(await client.query(`
    SELECT * FROM workflow_definition_steps
    WHERE workflow_id=$1 ORDER BY step_order
  `,[workflow.id])).rows:[];

  if(entity==='task' && legacyReviewerId){
    templateSteps=[
      {step_order:1,name:'Revisor responsável',approver_user_id:legacyReviewerId,approver_role:null,required:true},
      ...templateSteps.map(s=>({...s,step_order:s.step_order+1}))
    ];
  }

  if(!templateSteps.length) throw Object.assign(new Error('Workflow sem etapas configuradas.'),{status:409,code:'WORKFLOW_EMPTY'});

  for(const s of templateSteps){
    await client.query(`
      INSERT INTO approval_steps(id,request_id,step_order,approver_role,approver_user_id,status)
      VALUES($1,$2,$3,$4,$5,'PENDING')
    `,[crypto.randomUUID(),requestId,s.step_order,s.approver_role||null,s.approver_user_id||null]);
  }
  return {requestId,workflow};
}

module.exports={createRequestFromWorkflow};
