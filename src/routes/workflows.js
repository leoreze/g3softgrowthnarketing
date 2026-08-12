const express = require('express');
const crypto = require('crypto');
const pool = require('../db/pool');
const { requireAuth, requireRole } = require('../middleware/auth');
const audit = require('../middleware/audit');
const { uuid, text, oneOf } = require('../validators/common');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req,res,next)=>{
  try {
    const entity = req.query.entity ? oneOf(req.query.entity, ['TASK','CAMPAIGN']) : null;
    const values=[]; const where=[];
    if(entity){ values.push(entity); where.push(`w.entity_type=$${values.length}`); }
    const r=await pool.query(`
      SELECT w.*, u.name created_by_name,
        COALESCE((SELECT json_agg(json_build_object(
          'id',x.id,'step_order',x.step_order,'name',x.name,
          'approver_role',x.approver_role,'approver_user_id',x.approver_user_id,
          'required',x.required
        ) ORDER BY x.step_order)
        FROM (SELECT s.id,s.step_order,s.name,s.approver_role,s.approver_user_id,s.required
              FROM workflow_definition_steps s WHERE s.workflow_id=w.id ORDER BY s.step_order) x),'[]'::json) AS steps
      FROM workflow_definitions w
      LEFT JOIN users u ON u.id=w.created_by
      ${where.length?'WHERE '+where.join(' AND '):''}
      ORDER BY w.entity_type,w.status,w.created_at DESC
    `,values);
    res.json({data:r.rows});
  } catch(e){ next(e); }
});

router.get('/:id', async(req,res,next)=>{
  try{
    const id=uuid(req.params.id);
    const w=(await pool.query('SELECT * FROM workflow_definitions WHERE id=$1',[id])).rows[0];
    if(!w)return res.status(404).json({error:'NOT_FOUND',message:'Workflow não encontrado.'});
    const steps=await pool.query(`
      SELECT s.*,u.name approver_user_name
      FROM workflow_definition_steps s
      LEFT JOIN users u ON u.id=s.approver_user_id
      WHERE s.workflow_id=$1 ORDER BY s.step_order
    `,[id]);
    res.json({data:{workflow:w,steps:steps.rows}});
  }catch(e){next(e);}
});

router.post('/', requireRole('ADMIN','MANAGER'), async(req,res,next)=>{
  const client=await pool.connect();
  try{
    const name=text(req.body.name,120);
    const entityType=oneOf(req.body.entity_type,['TASK','CAMPAIGN']);
    const description=req.body.description?text(req.body.description,2000):null;
    if(!name)return res.status(400).json({error:'INVALID_INPUT',message:'Nome obrigatório.'});
    const steps=Array.isArray(req.body.steps)?req.body.steps:[];
    if(steps.length>20)return res.status(400).json({error:'TOO_MANY_STEPS',message:'Um workflow pode ter no máximo 20 etapas.'});
    await client.query('BEGIN');
    const w=(await client.query(`
      INSERT INTO workflow_definitions(id,name,entity_type,description,status,created_by)
      VALUES($1,$2,$3,$4,'DRAFT',$5) RETURNING *
    `,[crypto.randomUUID(),name,entityType,description,req.user.id])).rows[0];
    for(let i=0;i<steps.length;i++){
      const s=steps[i]||{};
      const role=s.approver_role?oneOf(s.approver_role,['ADMIN','STAKEHOLDER','MANAGER','USER']):null;
      const userId=s.approver_user_id?uuid(s.approver_user_id):null;
      if(!role&&!userId) return res.status(400).json({error:'INVALID_STEP',message:`A etapa ${i+1} precisa de um papel ou usuário.`});
      await client.query(`
        INSERT INTO workflow_definition_steps(id,workflow_id,step_order,name,approver_role,approver_user_id,required)
        VALUES($1,$2,$3,$4,$5,$6,$7)
      `,[crypto.randomUUID(),w.id,i+1,text(s.name||`Etapa ${i+1}`,120),role,userId,s.required!==false]);
    }
    await client.query('COMMIT');
    await audit(req,{action:'CREATE',entity:'workflow_definition',entityId:w.id,afterData:{...w,steps:steps.length}});
    res.status(201).json({data:w});
  }catch(e){await client.query('ROLLBACK').catch(()=>{});next(e);}
  finally{client.release();}
});

router.patch('/:id/status', requireRole('ADMIN','MANAGER'), async(req,res,next)=>{
  try{
    const id=uuid(req.params.id);
    const status=oneOf(req.body.status,['DRAFT','ACTIVE','ARCHIVED']);
    const before=(await pool.query('SELECT * FROM workflow_definitions WHERE id=$1',[id])).rows[0];
    if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Workflow não encontrado.'});
    if(status==='ACTIVE'){
      const count=(await pool.query('SELECT COUNT(*)::int count FROM workflow_definition_steps WHERE workflow_id=$1',[id])).rows[0].count;
      if(!count)return res.status(409).json({error:'WORKFLOW_EMPTY',message:'Um workflow precisa de pelo menos uma etapa.'});
    }
    const r=await pool.query('UPDATE workflow_definitions SET status=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[status,id]);
    await audit(req,{action:'UPDATE',entity:'workflow_definition',entityId:id,beforeData:before,afterData:r.rows[0]});
    res.json({data:r.rows[0]});
  }catch(e){next(e);}
});

module.exports=router;
