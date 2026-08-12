const express=require('express');
const crypto=require('crypto');
const pool=require('../db/pool');
const {requireAuth,requireRole}=require('../middleware/auth');
const audit=require('../middleware/audit');
const {text,uuid,oneOf}=require('../validators/common');
const router=express.Router();
router.use(requireAuth);
const types=['MEETING','DEMO','FOLLOW_UP','CAMPAIGN','DEADLINE','OTHER'];
const statuses=['SCHEDULED','COMPLETED','CANCELLED'];
function dateTime(v){const d=new Date(v);if(!v||Number.isNaN(d.getTime()))throw Object.assign(new Error('Data/hora inválida.'),{status:400});return d.toISOString()}
function nullableUuid(v){return v?uuid(v):null}
async function get(id){return (await pool.query('SELECT * FROM calendar_events WHERE id=$1',[id])).rows[0]}
router.get('/',async(req,res,next)=>{try{
 const from=dateTime(req.query.from||new Date(Date.now()-86400000).toISOString());
 const to=dateTime(req.query.to||new Date(Date.now()+32*86400000).toISOString());
 const values=[from,to];const where=['e.start_at < $2','COALESCE(e.end_at,e.start_at) >= $1'];
 if(req.query.owner_id){values.push(uuid(req.query.owner_id));where.push(`e.owner_id=$${values.length}`)}
 if(req.query.event_type){values.push(oneOf(req.query.event_type,types));where.push(`e.event_type=$${values.length}`)}
 if(req.query.status){values.push(oneOf(req.query.status,statuses));where.push(`e.status=$${values.length}`)}
 if(req.query.search){values.push(`%${String(req.query.search).slice(0,100)}%`);where.push(`(e.title ILIKE $${values.length} OR COALESCE(e.description,'') ILIKE $${values.length})`)}
 const r=await pool.query(`SELECT e.*,u.name owner_name,c.name campaign_name,p.name phase_name,t.title task_title FROM calendar_events e LEFT JOIN users u ON u.id=e.owner_id LEFT JOIN campaigns c ON c.id=e.campaign_id LEFT JOIN phases p ON p.id=e.phase_id LEFT JOIN tasks t ON t.id=e.task_id WHERE ${where.join(' AND ')} ORDER BY e.start_at,e.title`,values);
 res.json({data:r.rows,meta:{from,to,count:r.rowCount}});
}catch(e){next(e)}});
router.post('/',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const start=dateTime(req.body.start_at);const end=req.body.end_at?dateTime(req.body.end_at):null;if(end&&new Date(end)<new Date(start))return res.status(400).json({error:'INVALID_RANGE',message:'O término deve ser posterior ao início.'});
 const r=await pool.query(`INSERT INTO calendar_events(id,campaign_id,phase_id,task_id,owner_id,content_id,title,description,event_type,start_at,end_at,all_day,location,status,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,[crypto.randomUUID(),nullableUuid(req.body.campaign_id),nullableUuid(req.body.phase_id),nullableUuid(req.body.task_id),nullableUuid(req.body.owner_id)||req.user.id,nullableUuid(req.body.content_id),text(req.body.title,220),req.body.description?text(req.body.description,4000):null,oneOf(req.body.event_type||'OTHER',types),start,end,Boolean(req.body.all_day),req.body.location?text(req.body.location,300):null,oneOf(req.body.status||'SCHEDULED',statuses),req.user.id]);
 await audit(req,{action:'CREATE',entity:'calendar_event',entityId:r.rows[0].id,afterData:r.rows[0]});res.status(201).json({data:r.rows[0]});
}catch(e){next(e)}});
router.patch('/:id',async(req,res,next)=>{try{
 const id=uuid(req.params.id);const before=await get(id);if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Evento não encontrado.'});
 if(req.user.role!=='ADMIN'&&req.user.role!=='MANAGER'&&before.owner_id!==req.user.id)return res.status(403).json({error:'FORBIDDEN',message:'Você não pode alterar este evento.'});
 const allowed=['title','description','event_type','start_at','end_at','all_day','location','status','owner_id','campaign_id','phase_id','task_id','content_id'];const sets=[],values=[];
 for(const k of allowed)if(req.body[k]!==undefined){let v=req.body[k];if(['campaign_id','phase_id','task_id','owner_id'].includes(k))v=nullableUuid(v);if(['title','description','location'].includes(k)&&v!==null)v=text(v,k==='description'?4000:k==='title'?220:300);if(k==='event_type')v=oneOf(v,types);if(k==='status')v=oneOf(v,statuses);if(['start_at','end_at'].includes(k)&&v)v=dateTime(v);if(k==='all_day')v=Boolean(v);sets.push(`${k}=$${values.length+1}`);values.push(v)}
 if(!sets.length)return res.status(400).json({error:'NO_CHANGES',message:'Nada para atualizar.'});
 values.push(id);const r=await pool.query(`UPDATE calendar_events SET ${sets.join(',')},updated_at=NOW() WHERE id=$${values.length} RETURNING *`,values);if(r.rows[0].end_at&&new Date(r.rows[0].end_at)<new Date(r.rows[0].start_at))return res.status(400).json({error:'INVALID_RANGE',message:'O término deve ser posterior ao início.'});
 await audit(req,{action:'UPDATE',entity:'calendar_event',entityId:id,beforeData:before,afterData:r.rows[0]});res.json({data:r.rows[0]});
}catch(e){next(e)}});
router.delete('/:id',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{const id=uuid(req.params.id);const before=await get(id);if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Evento não encontrado.'});await pool.query('DELETE FROM calendar_events WHERE id=$1',[id]);await audit(req,{action:'DELETE',entity:'calendar_event',entityId:id,beforeData:before});res.status(204).end()}catch(e){next(e)}});
module.exports=router;
