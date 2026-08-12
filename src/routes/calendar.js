const express=require('express');
const crypto=require('crypto');
const pool=require('../db/pool');
const {requireAuth,requireRole}=require('../middleware/auth');
const audit=require('../middleware/audit');
const {uuid}=require('../validators/common');
const router=express.Router();
router.use(requireAuth);

const iso=/^\d{4}-\d{2}-\d{2}$/;
const safeDate=v=>{const s=String(v||'');if(!iso.test(s))throw Object.assign(new Error('Data inválida.'),{status:400});return s};
const statuses=['BACKLOG','IN_PROGRESS','PENDING_APPROVAL','APPROVED','REJECTED','DONE','BLOCKED'];
const priorities=['LOW','MEDIUM','HIGH','CRITICAL'];

router.get('/',async(req,res,next)=>{try{
  const from=safeDate(req.query.from||'1900-01-01');
  const to=safeDate(req.query.to||'2999-12-31');
  if(from>to)return res.status(400).json({error:'INVALID_RANGE',message:'Intervalo de datas inválido.'});
  const values=[from,to]; const where=['t.due_date BETWEEN $1 AND $2'];
  if(req.query.phase_id){values.push(uuid(req.query.phase_id));where.push(`t.phase_id=$${values.length}`)}
  if(req.query.assignee_id){values.push(uuid(req.query.assignee_id));where.push(`t.assignee_id=$${values.length}`)}
  if(req.query.status){const s=String(req.query.status).toUpperCase();if(!statuses.includes(s))return res.status(400).json({error:'INVALID_STATUS',message:'Status inválido.'});values.push(s);where.push(`t.status=$${values.length}`)}
  if(req.query.priority){const p=String(req.query.priority).toUpperCase();if(!priorities.includes(p))return res.status(400).json({error:'INVALID_PRIORITY',message:'Prioridade inválida.'});values.push(p);where.push(`t.priority=$${values.length}`)}
  if(req.query.search){values.push(`%${String(req.query.search).slice(0,100)}%`);where.push(`(t.title ILIKE $${values.length} OR COALESCE(t.description,'') ILIKE $${values.length})`)}
  if(req.query.overdue==='true')where.push(`t.due_date < CURRENT_DATE AND t.status NOT IN ('DONE','APPROVED')`);
  const r=await pool.query(`SELECT t.id,t.phase_id,t.title,t.description,t.status,t.priority,t.due_date,t.position,t.assignee_id,t.reviewer_id,t.estimated_hours,t.blocked_reason,p.name phase_name,p.color phase_color,a.name assignee_name,r.name reviewer_name,EXISTS(SELECT 1 FROM task_dependencies d WHERE d.task_id=t.id) has_dependencies,EXISTS(SELECT 1 FROM task_dependencies d JOIN tasks dep ON dep.id=d.depends_on_task_id WHERE d.task_id=t.id AND dep.status NOT IN ('DONE','APPROVED')) has_blocking_dependency,CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('DONE','APPROVED') THEN TRUE ELSE FALSE END is_overdue,CASE WHEN t.priority='CRITICAL' THEN TRUE ELSE FALSE END is_critical FROM tasks t JOIN phases p ON p.id=t.phase_id LEFT JOIN users a ON a.id=t.assignee_id LEFT JOIN users r ON r.id=t.reviewer_id WHERE ${where.join(' AND ')} ORDER BY t.due_date,t.priority DESC,t.position,t.title`,values);
  res.json({data:r.rows,meta:{from,to,count:r.rowCount}});
}catch(e){next(e)}});

router.get('/summary',async(req,res,next)=>{try{
  const from=safeDate(req.query.from||'1900-01-01');const to=safeDate(req.query.to||'2999-12-31');
  const r=await pool.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE due_date < CURRENT_DATE AND status NOT IN ('DONE','APPROVED'))::int overdue,COUNT(*) FILTER(WHERE priority='CRITICAL' AND status NOT IN ('DONE','APPROVED'))::int critical,COUNT(*) FILTER(WHERE status='PENDING_APPROVAL')::int approvals,COUNT(*) FILTER(WHERE status='BLOCKED')::int blocked FROM tasks WHERE due_date BETWEEN $1 AND $2`,[from,to]);
  res.json({data:r.rows[0]});
}catch(e){next(e)}});

router.patch('/:id/reschedule',async(req,res,next)=>{try{
  const id=uuid(req.params.id);const dueDate=safeDate(req.body.due_date);
  const before=(await pool.query('SELECT * FROM tasks WHERE id=$1',[id])).rows[0];
  if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Tarefa não encontrada.'});
  if(req.user.role!=='ADMIN'&&before.assignee_id!==req.user.id)return res.status(403).json({error:'FORBIDDEN',message:'Somente o responsável ou ADMIN pode reagendar esta tarefa.'});
  const r=await pool.query('UPDATE tasks SET due_date=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[dueDate,id]);
  await audit(req,{action:'RESCHEDULE',entity:'task',entityId:id,beforeData:{due_date:before.due_date},afterData:{due_date:r.rows[0].due_date}});
  res.json({data:r.rows[0]});
}catch(e){next(e)}});

router.patch('/:id/position',requireRole('ADMIN','STAKEHOLDER','MANAGER'),async(req,res,next)=>{try{
  const id=uuid(req.params.id);const position=Number(req.body.position);
  if(!Number.isInteger(position)||position<0)return res.status(400).json({error:'INVALID_POSITION',message:'Posição inválida.'});
  const before=(await pool.query('SELECT * FROM tasks WHERE id=$1',[id])).rows[0];if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Tarefa não encontrada.'});
  const r=await pool.query('UPDATE tasks SET position=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[position,id]);
  await audit(req,{action:'CALENDAR_REORDER',entity:'task',entityId:id,beforeData:{position:before.position},afterData:{position:r.rows[0].position}});
  res.json({data:r.rows[0]});
}catch(e){next(e)}});

router.get('/:id/conflicts',async(req,res,next)=>{try{
  const id=uuid(req.params.id);const task=(await pool.query('SELECT * FROM tasks WHERE id=$1',[id])).rows[0];if(!task)return res.status(404).json({error:'NOT_FOUND',message:'Tarefa não encontrada.'});
  if(!task.due_date)return res.json({data:[]});
  const r=await pool.query(`SELECT t.id,t.title,t.status,t.priority,t.due_date,p.name phase_name,a.name assignee_name FROM tasks t JOIN phases p ON p.id=t.phase_id LEFT JOIN users a ON a.id=t.assignee_id WHERE t.id<>$1 AND t.due_date=$2 AND (($3::uuid IS NOT NULL AND t.assignee_id=$3) OR t.priority='CRITICAL') AND t.status NOT IN ('DONE','APPROVED') ORDER BY t.priority DESC,t.title`,[id,task.due_date,task.assignee_id]);
  res.json({data:r.rows});
}catch(e){next(e)}});

module.exports=router;
