const express=require('express');
const crypto=require('crypto');
const pool=require('../db/pool');
const {requireAuth,requireRole}=require('../middleware/auth');
const audit=require('../middleware/audit');
const {uuid,text,oneOf}=require('../validators/common');
const {DIMENSIONS,defaultAssessments,calculateScore,diagnosticContext,clampScore}=require('../services/diagnostic360');
const router=express.Router();
router.use(requireAuth);

const ANALYSIS_TYPES=['COMPLETO','SEO','MARKETING','COMERCIAL','CRM','CAMPANHA','LANDING_PAGE','REDES_SOCIAIS','CONCORRENCIA'];
const SOURCE_TYPES=['WEBSITE','PAGE','LANDING_PAGE','SOCIAL','GOOGLE_BUSINESS','SEO','GOOGLE_ADS','META_ADS','LINKEDIN_ADS','YOUTUBE','CRM','ANALYTICS','COMPETITOR','PRODUCT','ICP','PERSONA','OTHER'];
const EVIDENCE_TYPES=['URL','SCREENSHOT','PDF','CSV','XLSX','DOCUMENT','NOTE'];
const REVIEW_STATUS=['PENDENTE','APROVADO','DEVOLVIDO'];

function cleanOptional(v,max=10000){return v===undefined||v===null||v===''?null:text(v,max)}
function assertMutable(d){if(d.snapshot_locked||d.status==='APPROVED'){const e=new Error('Esta análise está aprovada e bloqueada como snapshot. Duplique-a para criar uma nova versão.');e.status=409;throw e}}
async function currentCampaign(){const r=await pool.query('SELECT * FROM campaigns ORDER BY created_at DESC LIMIT 1');return r.rows[0]||null}
async function getDiagnosticById(id){
 const d=(await pool.query('SELECT * FROM growth_diagnostics WHERE id=$1',[id])).rows[0];
 if(!d)return null;
 const [ass,actions,sources,metrics,evidences,reviews]=await Promise.all([
  pool.query('SELECT * FROM growth_diagnostic_assessments WHERE diagnostic_id=$1 ORDER BY dimension_key,criterion_key',[id]),
  pool.query(`SELECT a.*,u.name owner_name FROM growth_diagnostic_actions a LEFT JOIN users u ON u.id=a.owner_id WHERE a.diagnostic_id=$1 ORDER BY CASE a.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 WHEN 'P2' THEN 2 ELSE 3 END,a.created_at`,[id]),
  pool.query('SELECT * FROM growth_diagnostic_sources WHERE diagnostic_id=$1 ORDER BY created_at DESC',[id]),
  pool.query('SELECT * FROM growth_diagnostic_metrics WHERE diagnostic_id=$1 ORDER BY created_at DESC',[id]),
  pool.query('SELECT * FROM growth_diagnostic_evidences WHERE diagnostic_id=$1 ORDER BY created_at DESC',[id]),
  pool.query(`SELECT r.*,u.name reviewer_name FROM growth_diagnostic_reviews r LEFT JOIN users u ON u.id=r.reviewer_id WHERE r.diagnostic_id=$1 ORDER BY r.created_at DESC`,[id])
 ]);
 const score=calculateScore(ass.rows);
 const assessed=ass.rows.filter(x=>x.status==='VALIDADO').length;
 const withEvidence=ass.rows.filter(x=>x.status==='VALIDADO'&&((x.evidence||'').trim()||evidences.rows.some(e=>e.assessment_id===x.id))).length;
 const confidence=ass.rows.length?Math.round(((assessed/ass.rows.length)*0.6+(withEvidence/ass.rows.length)*0.4)*100):0;
 if(Number(d.confidence_score)!==confidence || Number(d.overall_score)!==score.overall){await pool.query('UPDATE growth_diagnostics SET overall_score=$1,confidence_score=$2,updated_at=NOW() WHERE id=$3',[score.overall,confidence,id]);d.overall_score=score.overall;d.confidence_score=confidence}
 return {diagnostic:d,assessments:ass.rows,actions:actions.rows,sources:sources.rows,metrics:metrics.rows,evidences:evidences.rows,reviews:reviews.rows,score};
}
function snapshotName(base,periodStart,periodEnd){const p=periodStart&&periodEnd?` · ${periodStart} → ${periodEnd}`:'';return `${base||'Diagnóstico 360'}${p}`}

// List of all analyses — historical snapshots are never overwritten.
router.get('/analyses',async(req,res,next)=>{try{
 const r=await pool.query(`SELECT d.*,c.name campaign_name,u.name created_by_name,rv.name reviewed_by_name,
   (SELECT COUNT(*) FROM growth_diagnostic_sources s WHERE s.diagnostic_id=d.id) source_count,
   (SELECT COUNT(*) FROM growth_diagnostic_evidences e WHERE e.diagnostic_id=d.id) evidence_count,
   (SELECT COUNT(*) FROM growth_diagnostic_actions a WHERE a.diagnostic_id=d.id AND a.status<>'CONCLUIDA') open_action_count
   FROM growth_diagnostics d LEFT JOIN campaigns c ON c.id=d.campaign_id LEFT JOIN users u ON u.id=d.created_by LEFT JOIN users rv ON rv.id=d.reviewed_by
   ORDER BY d.created_at DESC`);
 res.json({data:r.rows});
}catch(e){next(e)}});

router.get('/compare',async(req,res,next)=>{try{
 const a=uuid(req.query.a),b=uuid(req.query.b);const rows=await pool.query(`SELECT diagnostic_id,dimension_key,dimension_name,score FROM growth_diagnostic_assessments WHERE diagnostic_id IN ($1,$2) ORDER BY dimension_key`,[a,b]);
 const map=new Map();for(const r of rows.rows){if(!map.has(r.dimension_key))map.set(r.dimension_key,{key:r.dimension_key,name:r.dimension_name,a:null,b:null});const x=map.get(r.dimension_key);if(r.diagnostic_id===a)x.a=Number(r.score)*20;if(r.diagnostic_id===b)x.b=Number(r.score)*20}
 const da=await pool.query('SELECT id,name,overall_score,confidence_score FROM growth_diagnostics WHERE id=$1',[a]);const db=await pool.query('SELECT id,name,overall_score,confidence_score FROM growth_diagnostics WHERE id=$1',[b]);
 res.json({data:{left:da.rows[0],right:db.rows[0],dimensions:[...map.values()].map(x=>({...x,delta:(x.b??0)-(x.a??0)}))}});
}catch(e){next(e)}});

router.get('/export/:id',async(req,res,next)=>{try{const payload=await getDiagnosticById(uuid(req.params.id));if(!payload)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});res.json({data:{...payload,exported_at:new Date().toISOString()}})}catch(e){next(e)}});

router.get('/',async(req,res,next)=>{try{
 const id=req.query.id?uuid(req.query.id):null;
 if(id){const p=await getDiagnosticById(id);if(!p)return res.status(404).json({error:'NOT_FOUND',message:'Diagnóstico não encontrado.'});return res.json({data:{exists:true,dimensions:DIMENSIONS,...p}})}
 const c=await currentCampaign();const d=await pool.query('SELECT id FROM growth_diagnostics ORDER BY created_at DESC LIMIT 1');
 if(!d.rowCount)return res.json({data:{exists:false,campaign:c,dimensions:DIMENSIONS,diagnostic:null,assessments:[],actions:[],sources:[],metrics:[],evidences:[],reviews:[],score:null}});
 const p=await getDiagnosticById(d.rows[0].id);res.json({data:{exists:true,campaign:c,dimensions:DIMENSIONS,...p}});
}catch(e){next(e)}});

router.get('/:id',async(req,res,next)=>{try{const p=await getDiagnosticById(uuid(req.params.id));if(!p)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});res.json({data:{exists:true,dimensions:DIMENSIONS,...p}})}catch(e){next(e)}});

router.post('/',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{const client=await pool.connect();try{
 await client.query('BEGIN');
 const campaign=req.body.campaign_id?uuid(req.body.campaign_id):null;
 const id=crypto.randomUUID();
 const name=text(req.body.name||'Diagnóstico 360',220);const type=oneOf(req.body.analysis_type||'COMPLETO',ANALYSIS_TYPES);
 const d=(await client.query(`INSERT INTO growth_diagnostics(id,campaign_id,name,status,analysis_type,period_start,period_end,objective,created_by) VALUES($1,$2,$3,'DRAFT',$4,$5,$6,$7,$8) RETURNING *`,[id,campaign,name,type,req.body.period_start||null,req.body.period_end||null,cleanOptional(req.body.objective,6000),req.user.id])).rows[0];
 for(const a of defaultAssessments())await client.query(`INSERT INTO growth_diagnostic_assessments(id,diagnostic_id,dimension_key,dimension_name,criterion_key,criterion_name,weight,score,status,priority) VALUES($1,$2,$3,$4,$5,$6,$7,0,'PENDENTE',$8)`,[a.id,id,a.dimension_key,a.dimension_name,a.criterion_key,a.criterion_name,a.weight,a.priority]);
 await audit(req,{action:'CREATE',entity:'growth_diagnostic',entityId:id,afterData:d},client);await client.query('COMMIT');res.status(201).json({data:{id}});
}catch(e){try{await client.query('ROLLBACK')}catch{}next(e)}finally{client.release()}});

router.post('/ensure',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{
 const campaign=await currentCampaign();const name=campaign?`Diagnóstico 360 · ${campaign.name}`:'Diagnóstico 360';const r=await pool.query(`SELECT id FROM growth_diagnostics WHERE status<>'APPROVED' ORDER BY created_at DESC LIMIT 1`);if(r.rowCount)return res.status(200).json({data:{id:r.rows[0].id,existing:true}});
 const d=await pool.query(`INSERT INTO growth_diagnostics(id,campaign_id,name,status,analysis_type,created_by) VALUES($1,$2,$3,'IN_PROGRESS','COMPLETO',$4) RETURNING id`,[crypto.randomUUID(),campaign?.id||null,name,req.user.id]);const id=d.rows[0].id;for(const a of defaultAssessments())await pool.query(`INSERT INTO growth_diagnostic_assessments(id,diagnostic_id,dimension_key,dimension_name,criterion_key,criterion_name,weight,score,status,priority) VALUES($1,$2,$3,$4,$5,$6,$7,0,'PENDENTE',$8)`,[a.id,id,a.dimension_key,a.dimension_name,a.criterion_key,a.criterion_name,a.weight,a.priority]);res.status(201).json({data:{id,existing:false}});
}catch(e){next(e)}});

router.post('/:id/duplicate',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{const client=await pool.connect();try{
 await client.query('BEGIN');const src=await getDiagnosticById(uuid(req.params.id));if(!src){await client.query('ROLLBACK');return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'})}
 const id=crypto.randomUUID();const d=(await client.query(`INSERT INTO growth_diagnostics(id,campaign_id,name,status,analysis_type,period_start,period_end,objective,created_by) VALUES($1,$2,$3,'DRAFT',$4,$5,$6,$7,$8) RETURNING *`,[id,src.diagnostic.campaign_id,`${src.diagnostic.name} · Nova versão`,src.diagnostic.analysis_type,src.diagnostic.period_start,src.diagnostic.period_end,src.diagnostic.objective,req.user.id])).rows[0];
 for(const a of src.assessments)await client.query(`INSERT INTO growth_diagnostic_assessments(id,diagnostic_id,dimension_key,dimension_name,criterion_key,criterion_name,weight,score,status,evidence,notes,priority) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,[crypto.randomUUID(),id,a.dimension_key,a.dimension_name,a.criterion_key,a.criterion_name,a.weight,a.score,a.status,a.evidence,a.notes,a.priority]);
 for(const s of src.sources)await client.query(`INSERT INTO growth_diagnostic_sources(id,diagnostic_id,source_type,name,url,objective,audience,platform,metadata,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[crypto.randomUUID(),id,s.source_type,s.name,s.url,s.objective,s.audience,s.platform,s.metadata,req.user.id]);
 await client.query('COMMIT');res.status(201).json({data:{id}});
}catch(e){try{await client.query('ROLLBACK')}catch{}next(e)}finally{client.release()}});

router.patch('/assessments/:id',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{
 const id=uuid(req.params.id);const before=(await pool.query(`SELECT a.*,d.snapshot_locked,d.status diagnostic_status FROM growth_diagnostic_assessments a JOIN growth_diagnostics d ON d.id=a.diagnostic_id WHERE a.id=$1`,[id])).rows[0];if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Critério não encontrado.'});assertMutable(before);
 const r=await pool.query(`UPDATE growth_diagnostic_assessments SET score=$1,status=$2,priority=$3,evidence=$4,notes=$5,updated_by=$6,updated_at=NOW() WHERE id=$7 RETURNING *`,[clampScore(req.body.score),oneOf(req.body.status||before.status,['PENDENTE','EM_ANALISE','VALIDADO']),oneOf(req.body.priority||before.priority,['P0','P1','P2','P3']),cleanOptional(req.body.evidence,5000),cleanOptional(req.body.notes,5000),req.user.id,id]);
 await audit(req,{action:'UPDATE',entity:'growth_diagnostic_assessment',entityId:id,beforeData:before,afterData:r.rows[0]});res.json({data:r.rows[0],score:(await getDiagnosticById(before.diagnostic_id)).score});
}catch(e){next(e)}});

router.patch('/:id',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const id=uuid(req.params.id);const before=(await pool.query('SELECT * FROM growth_diagnostics WHERE id=$1',[id])).rows[0];if(!before)return res.status(404).json({error:'NOT_FOUND',message:'Diagnóstico não encontrado.'});if(before.snapshot_locked&&req.body.status!=='DRAFT')return res.status(409).json({error:'SNAPSHOT_LOCKED',message:'Snapshot aprovado é somente leitura.'});
 const status=req.body.status?oneOf(req.body.status,['DRAFT','IN_PROGRESS','REVIEW','APPROVED','ARCHIVED']):before.status;
 const summary=req.body.executive_summary===undefined?before.executive_summary:cleanOptional(req.body.executive_summary,12000);
 const r=await pool.query(`UPDATE growth_diagnostics SET status=$1,executive_summary=$2,reviewed_by=CASE WHEN $1='APPROVED' THEN $3 ELSE reviewed_by END,reviewed_at=CASE WHEN $1='APPROVED' THEN NOW() ELSE reviewed_at END,snapshot_locked=CASE WHEN $1='APPROVED' THEN TRUE ELSE snapshot_locked END,updated_at=NOW() WHERE id=$4 RETURNING *`,[status,summary,req.user.id,id]);
 if(status==='APPROVED')await pool.query(`INSERT INTO growth_diagnostic_reviews(id,diagnostic_id,reviewer_id,status,comment) VALUES($1,$2,$3,'APROVADO',$4)`,[crypto.randomUUID(),id,req.user.id,cleanOptional(req.body.review_comment,5000)]);
 await audit(req,{action:'UPDATE',entity:'growth_diagnostic',entityId:id,beforeData:before,afterData:r.rows[0]});res.json({data:r.rows[0]});
}catch(e){next(e)}});

router.post('/:id/sources',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`INSERT INTO growth_diagnostic_sources(id,diagnostic_id,source_type,name,url,objective,audience,platform,metadata,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[crypto.randomUUID(),d.diagnostic.id,oneOf(req.body.source_type,SOURCE_TYPES),text(req.body.name,220),cleanOptional(req.body.url,1000),cleanOptional(req.body.objective,4000),cleanOptional(req.body.audience,4000),cleanOptional(req.body.platform,80),req.body.metadata||{},req.user.id]);res.status(201).json({data:r.rows[0]})}catch(e){next(e)}});
router.patch('/:id/sources/:sourceId',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const id=uuid(req.params.id),sid=uuid(req.params.sourceId);const d=await getDiagnosticById(id);if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`UPDATE growth_diagnostic_sources SET name=$1,url=$2,objective=$3,audience=$4,platform=$5,metadata=$6,updated_at=NOW() WHERE id=$7 AND diagnostic_id=$8 RETURNING *`,[text(req.body.name,220),cleanOptional(req.body.url,1000),cleanOptional(req.body.objective,4000),cleanOptional(req.body.audience,4000),cleanOptional(req.body.platform,80),req.body.metadata||{},sid,id]);if(!r.rowCount)return res.status(404).json({error:'NOT_FOUND',message:'Fonte não encontrada.'});res.json({data:r.rows[0]})}catch(e){next(e)}});
router.delete('/:id/sources/:sourceId',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);await pool.query('DELETE FROM growth_diagnostic_sources WHERE id=$1 AND diagnostic_id=$2',[uuid(req.params.sourceId),d.diagnostic.id]);res.status(204).end()}catch(e){next(e)}});

router.post('/:id/metrics',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`INSERT INTO growth_diagnostic_metrics(id,diagnostic_id,source_id,metric_key,metric_name,value_numeric,value_text,unit,period_start,period_end,notes,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[crypto.randomUUID(),d.diagnostic.id,req.body.source_id?uuid(req.body.source_id):null,text(req.body.metric_key,100),text(req.body.metric_name,180),req.body.value_numeric===undefined||req.body.value_numeric===''?null:Number(req.body.value_numeric),cleanOptional(req.body.value_text,2000),cleanOptional(req.body.unit,40),req.body.period_start||null,req.body.period_end||null,cleanOptional(req.body.notes,4000),req.user.id]);res.status(201).json({data:r.rows[0]})}catch(e){next(e)}});
router.delete('/:id/metrics/:metricId',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);await pool.query('DELETE FROM growth_diagnostic_metrics WHERE id=$1 AND diagnostic_id=$2',[uuid(req.params.metricId),d.diagnostic.id]);res.status(204).end()}catch(e){next(e)}});

router.post('/:id/evidences',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`INSERT INTO growth_diagnostic_evidences(id,diagnostic_id,assessment_id,source_id,evidence_type,title,url,description,captured_at,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[crypto.randomUUID(),d.diagnostic.id,req.body.assessment_id?uuid(req.body.assessment_id):null,req.body.source_id?uuid(req.body.source_id):null,oneOf(req.body.evidence_type||'URL',EVIDENCE_TYPES),text(req.body.title,220),cleanOptional(req.body.url,1200),cleanOptional(req.body.description,6000),req.body.captured_at||new Date(),req.user.id]);res.status(201).json({data:r.rows[0]})}catch(e){next(e)}});
router.patch('/:id/evidences/:evidenceId/validate',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`UPDATE growth_diagnostic_evidences SET validated=$1,validated_by=$2,validated_at=CASE WHEN $1 THEN NOW() ELSE NULL END WHERE id=$3 AND diagnostic_id=$4 RETURNING *`,[req.body.validated!==false,req.user.id,uuid(req.params.evidenceId),d.diagnostic.id]);if(!r.rowCount)return res.status(404).json({error:'NOT_FOUND',message:'Evidência não encontrada.'});res.json({data:r.rows[0]})}catch(e){next(e)}});
router.delete('/:id/evidences/:evidenceId',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);await pool.query('DELETE FROM growth_diagnostic_evidences WHERE id=$1 AND diagnostic_id=$2',[uuid(req.params.evidenceId),d.diagnostic.id]);res.status(204).end()}catch(e){next(e)}});

router.post('/:id/actions',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`INSERT INTO growth_diagnostic_actions(id,diagnostic_id,title,description,dimension_key,priority,status,owner_id,due_date,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[crypto.randomUUID(),d.diagnostic.id,text(req.body.title,300),cleanOptional(req.body.description,5000),cleanOptional(req.body.dimension_key,60),oneOf(req.body.priority||'P1',['P0','P1','P2','P3']),oneOf(req.body.status||'BACKLOG',['BACKLOG','EM_EXECUCAO','CONCLUIDA','BLOQUEADA']),req.body.owner_id?uuid(req.body.owner_id):req.user.id,req.body.due_date||null,req.user.id]);res.status(201).json({data:r.rows[0]})}catch(e){next(e)}});
router.patch('/:id/actions/:actionId',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);const r=await pool.query(`UPDATE growth_diagnostic_actions SET title=$1,description=$2,priority=$3,status=$4,owner_id=$5,due_date=$6,updated_at=NOW() WHERE id=$7 AND diagnostic_id=$8 RETURNING *`,[text(req.body.title,300),cleanOptional(req.body.description,5000),oneOf(req.body.priority||'P1',['P0','P1','P2','P3']),oneOf(req.body.status||'BACKLOG',['BACKLOG','EM_EXECUCAO','CONCLUIDA','BLOQUEADA']),req.body.owner_id?uuid(req.body.owner_id):req.user.id,req.body.due_date||null,uuid(req.params.actionId),d.diagnostic.id]);if(!r.rowCount)return res.status(404).json({error:'NOT_FOUND',message:'Ação não encontrada.'});res.json({data:r.rows[0]})}catch(e){next(e)}});
router.delete('/:id/actions/:actionId',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{const d=await getDiagnosticById(uuid(req.params.id));if(!d)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});assertMutable(d.diagnostic);await pool.query('DELETE FROM growth_diagnostic_actions WHERE id=$1 AND diagnostic_id=$2',[uuid(req.params.actionId),d.diagnostic.id]);res.status(204).end()}catch(e){next(e)}});

function buildPrompt(context,userPrompt){return `Você é o estrategista de Growth da G3Soft. Analise o Diagnóstico 360 abaixo com rigor executivo. Responda sempre em português do Brasil. NÃO invente dados. Diferencie fatos, lacunas, hipóteses e recomendações. Quando houver evidência insuficiente, diga explicitamente. Use o score e a confiança para priorizar. ${JSON.stringify(context,null,2)}\n\nSolicitação: ${userPrompt}`}
async function callOpenAI(context,userPrompt){const key=process.env.OPENAI_API_KEY;if(!key){const e=new Error('IA não configurada. Configure OPENAI_API_KEY no ambiente do Render.');e.code='AI_NOT_CONFIGURED';throw e}const response=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.1',input:[{role:'system',content:[{type:'input_text',text:'Você é estrategista de Growth da G3Soft. Responda em português do Brasil e não invente métricas.'}]},{role:'user',content:[{type:'input_text',text:buildPrompt(context,userPrompt)}]}],max_output_tokens:2400})});const body=await response.json().catch(()=>({}));if(!response.ok){const e=new Error(body?.error?.message||'Falha na IA.');e.code='AI_PROVIDER_ERROR';throw e}let out=body.output_text;if(!out&&Array.isArray(body.output))out=body.output.flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');return out||'A IA não retornou conteúdo.'}
router.post('/:id/ai/analyze',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const p=await getDiagnosticById(uuid(req.params.id));if(!p)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});const context=diagnosticContext(p.diagnostic,p.assessments,p.actions);context.sources=p.sources;context.metrics=p.metrics;context.evidences=p.evidences;context.confidence=p.diagnostic.confidence_score;const answer=await callOpenAI(context,cleanOptional(req.body.prompt,4000)||'Gere resumo executivo, forças, gaps, riscos, oportunidades, 5 prioridades P0/P1 e plano de 30 dias.');await pool.query('UPDATE growth_diagnostics SET ai_summary=$1,updated_at=NOW() WHERE id=$2',[answer,p.diagnostic.id]);await pool.query('INSERT INTO growth_diagnostic_ai_messages(id,diagnostic_id,user_id,role,content) VALUES($1,$2,$3,$4,$5)',[crypto.randomUUID(),p.diagnostic.id,req.user.id,'assistant',answer]);res.json({data:{answer}})}catch(e){if(e.code==='AI_NOT_CONFIGURED')return res.status(503).json({error:e.code,message:e.message});next(e)}});
router.post('/:id/ai/chat',requireRole('ADMIN','MANAGER','USER'),async(req,res,next)=>{try{const p=await getDiagnosticById(uuid(req.params.id));if(!p)return res.status(404).json({error:'NOT_FOUND',message:'Análise não encontrada.'});const message=text(req.body.message,4000);const context=diagnosticContext(p.diagnostic,p.assessments,p.actions);context.sources=p.sources;context.metrics=p.metrics;context.evidences=p.evidences;context.confidence=p.diagnostic.confidence_score;const history=(await pool.query('SELECT role,content FROM growth_diagnostic_ai_messages WHERE diagnostic_id=$1 ORDER BY created_at DESC LIMIT 12',[p.diagnostic.id])).rows.reverse();const answer=await callOpenAI(context,`${history.map(h=>`${h.role}: ${h.content}`).join('\n')}\nPergunta atual: ${message}`);await pool.query('INSERT INTO growth_diagnostic_ai_messages(id,diagnostic_id,user_id,role,content) VALUES($1,$2,$3,$4,$5),($6,$2,$3,$7,$8)',[crypto.randomUUID(),p.diagnostic.id,req.user.id,'user',message,crypto.randomUUID(),'assistant',answer]);res.json({data:{answer}})}catch(e){if(e.code==='AI_NOT_CONFIGURED')return res.status(503).json({error:e.code,message:e.message});next(e)}});

module.exports=router;
