const express=require('express');
const crypto=require('crypto');
const pool=require('../db/pool');
const {requireAuth,requireRole}=require('../middleware/auth');
const audit=require('../middleware/audit');
const {createOrUpdatePublicLead,trackTouchpoint}=require('../services/marketing');
const admin=express.Router();
const publicRouter=express.Router();
function clean(v,max=500){if(v===undefined||v===null)return null;const s=String(v).trim();return s?s.slice(0,max):null;}
function uuid(v){return typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)?v:null;}
function code(){return crypto.randomBytes(7).toString('base64url').slice(0,10);}
publicRouter.post('/track',async(req,res,next)=>{try{res.status(202).json({data:await trackTouchpoint(req.body||{},req)});}catch(e){next(e)}});
publicRouter.post('/leads',async(req,res,next)=>{try{const result=await createOrUpdatePublicLead(req.body||{},req);res.status(result.created?201:200).json({data:result});}catch(e){next(e)}});
admin.use(requireAuth);
admin.get('/landing-pages',async(req,res,next)=>{try{const r=await pool.query("SELECT * FROM marketing_landing_pages WHERE active=true OR status='DRAFT' ORDER BY CASE WHEN status='DRAFT' THEN 0 ELSE 1 END,type,name");res.json({data:r.rows});}catch(e){next(e)}});
admin.get('/links',async(req,res,next)=>{try{const r=await pool.query(`SELECT l.*,p.key AS landing_page_key,p.name AS landing_page_name,p.path AS landing_page_path,c.name AS campaign_name,COALESCE((SELECT COUNT(*) FROM leads x WHERE x.tracking_link_id=l.id),0)::int AS lead_count FROM marketing_tracking_links l LEFT JOIN marketing_landing_pages p ON p.id=l.landing_page_id LEFT JOIN campaigns c ON c.id=l.campaign_id ORDER BY l.created_at DESC`);res.json({data:r.rows});}catch(e){next(e)}});
admin.post('/links',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const landingId=uuid(req.body?.landing_page_id)?req.body.landing_page_id:null,campaignId=uuid(req.body?.campaign_id)?req.body.campaign_id:null;let page=null;
 if(landingId)page=(await pool.query('SELECT * FROM marketing_landing_pages WHERE id=$1 AND active=true',[landingId])).rows[0];
 if(!page&&req.body?.landing_page_key)page=(await pool.query('SELECT * FROM marketing_landing_pages WHERE key=$1 AND active=true',[clean(req.body.landing_page_key,160)])).rows[0];
 if(!page)return res.status(400).json({error:'INVALID_LANDING_PAGE',message:'Landing page não encontrada.'});
 const c=code(),source=clean(req.body.source||req.body.utm_source,120)||'g3soft',medium=clean(req.body.medium||req.body.utm_medium,120)||'organic',campaign=clean(req.body.campaign||req.body.utm_campaign,180)||null,term=clean(req.body.term||req.body.utm_term,180)||null,content=clean(req.body.content||req.body.utm_content,180)||null;
 const name=clean(req.body.name,220)||`${page.name} • ${source}/${medium}`;
 const r=await pool.query(`INSERT INTO marketing_tracking_links(id,code,name,landing_page_id,campaign_id,channel,source,medium,campaign,term,content,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,[crypto.randomUUID(),c,name,page.id,campaignId,clean(req.body.channel,40)||'ORGANIC',source,medium,campaign,term,content,req.user.id]);
 const publicUrl=(process.env.G3_PUBLIC_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'');const target=new URL(page.path,publicUrl);for(const [k,v] of [['utm_source',source],['utm_medium',medium],['utm_campaign',campaign],['utm_term',term],['utm_content',content]])if(v)target.searchParams.set(k,v);target.searchParams.set('g3_link',c);
 await audit(req,{action:'CREATE',entity:'marketing_tracking_link',entityId:r.rows[0].id,afterData:r.rows[0]});res.status(201).json({data:{...r.rows[0],short_url:`${publicUrl}/r/${c}`,landing_url:target.toString()}});
}catch(e){next(e)}});
admin.post('/links/bulk',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const pages=(await pool.query('SELECT * FROM marketing_landing_pages WHERE active=true ORDER BY type,name')).rows,campaignId=uuid(req.body?.campaign_id)?req.body.campaign_id:null,source=clean(req.body.source,120)||'g3soft',medium=clean(req.body.medium,120)||'social',campaign=clean(req.body.campaign,180)||null,channel=clean(req.body.channel,40)||'ORGANIC',publicUrl=(process.env.G3_PUBLIC_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'');const links=[];
 for(const page of pages){const c=code();const r=await pool.query(`INSERT INTO marketing_tracking_links(id,code,name,landing_page_id,campaign_id,channel,source,medium,campaign,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,[crypto.randomUUID(),c,`${page.name} • ${source}/${medium}`,page.id,campaignId,channel,source,medium,campaign,req.user.id]);const u=new URL(page.path,publicUrl);u.searchParams.set('utm_source',source);u.searchParams.set('utm_medium',medium);if(campaign)u.searchParams.set('utm_campaign',campaign);u.searchParams.set('g3_link',c);links.push({...r.rows[0],short_url:`${publicUrl}/r/${c}`,landing_url:u.toString()});}
 await audit(req,{action:'CREATE_BULK',entity:'marketing_tracking_link',afterData:{count:links.length,campaignId,source,medium,campaign}});res.status(201).json({data:links});
}catch(e){next(e)}});
admin.get('/overview',async(req,res,next)=>{try{const [totals,sources,lands,camps,queue]=await Promise.all([
 pool.query(`SELECT COUNT(*)::int leads,COUNT(*) FILTER(WHERE status='MQL')::int mql,COUNT(*) FILTER(WHERE status='SQL')::int sql,COUNT(*) FILTER(WHERE status='DEMO')::int demo,COUNT(*) FILTER(WHERE status='WON')::int won,COUNT(*) FILTER(WHERE created_at>=NOW()-INTERVAL '30 days')::int new_30d FROM leads`),
 pool.query(`SELECT COALESCE(NULLIF(utm_source,''),s.name,'unknown') source,COUNT(*)::int leads FROM leads l LEFT JOIN lead_sources s ON s.id=l.source_id GROUP BY 1 ORDER BY 2 DESC LIMIT 12`),
 pool.query(`SELECT COALESCE(landing_page_key,'unknown') landing_page,COUNT(*)::int leads FROM leads GROUP BY 1 ORDER BY 2 DESC LIMIT 15`),
 pool.query(`SELECT COALESCE(c.name,'Sem campanha') campaign,COUNT(l.id)::int leads,COUNT(*) FILTER(WHERE l.status='WON')::int won FROM leads l LEFT JOIN campaigns c ON c.id=l.campaign_id GROUP BY 1 ORDER BY 2 DESC LIMIT 12`),
 pool.query(`SELECT status,COUNT(*)::int total FROM marketing_message_queue GROUP BY status ORDER BY status`)
]);res.json({data:{totals:totals.rows[0],sources:sources.rows,landing_pages:lands.rows,campaigns:camps.rows,message_queue:queue.rows}});}catch(e){next(e)}});

admin.get('/strategy/foundation',async(req,res,next)=>{try{
 const strategy=(await pool.query(`SELECT s.*,h.positioning,h.promise,h.commercial_message,h.campaign_message,h.big_idea,h.value_proposition,h.tone_of_voice
 FROM strategies s LEFT JOIN strategy_message_house h ON h.strategy_id=s.id
 WHERE s.slug='g3soft-posicionamento-mensagens' LIMIT 1`)).rows[0];
 if(!strategy)return res.status(404).json({error:'STRATEGY_NOT_FOUND',message:'Estratégia G3Soft não encontrada.'});
 const [pillars,icps,segments,products,proofs,matrix]=await Promise.all([
  pool.query('SELECT * FROM strategy_value_pillars WHERE strategy_id=$1 AND active=true ORDER BY sort_order',[strategy.id]),
  pool.query('SELECT * FROM icps WHERE strategy_id=$1 ORDER BY name',[strategy.id]),
  pool.query('SELECT * FROM segments WHERE strategy_id=$1 AND active=true ORDER BY name',[strategy.id]),
  pool.query('SELECT * FROM products WHERE strategy_id=$1 AND active=true ORDER BY name',[strategy.id]),
  pool.query('SELECT * FROM proofs WHERE strategy_id=$1 ORDER BY created_at DESC',[strategy.id]),
  pool.query(`SELECT m.*,i.name icp_name,s.name segment_name,p.name product_name,p.key product_key,
    lp.name landing_page_name,lp.path landing_page_path,c.name campaign_name
    FROM message_matrix m
    LEFT JOIN icps i ON i.id=m.icp_id LEFT JOIN segments s ON s.id=m.segment_id
    LEFT JOIN products p ON p.id=m.product_id LEFT JOIN marketing_landing_pages lp ON lp.id=m.landing_page_id
    LEFT JOIN campaigns c ON c.id=m.campaign_id
    WHERE m.strategy_id=$1 ORDER BY CASE m.status WHEN 'APPROVED' THEN 0 WHEN 'VALIDATED' THEN 1 WHEN 'VALIDATING' THEN 2 ELSE 3 END,m.created_at DESC`,[strategy.id])
 ]);
 res.json({data:{strategy,pillars:pillars.rows,icps:icps.rows,segments:segments.rows,products:products.rows,proofs:proofs.rows,matrix:matrix.rows}});
}catch(e){next(e)}});

admin.get('/strategy',async(req,res,next)=>{try{
 const r=await pool.query(`SELECT s.*,p.name AS landing_page_name,p.path AS landing_page_path,
 COALESCE((SELECT COUNT(*) FROM leads l WHERE l.landing_page_key=s.landing_page_key OR l.product_interest=s.product_key),0)::int AS lead_count
 FROM growth_strategy_items s
 LEFT JOIN marketing_landing_pages p ON p.key=s.landing_page_key
 WHERE s.active=true ORDER BY CASE s.priority WHEN 'P0' THEN 0 WHEN 'P1' THEN 1 ELSE 2 END,s.segment,s.icp`);
 res.json({data:r.rows});
}catch(e){next(e)}});

admin.post('/strategy/matrix/campaign-draft',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const id=uuid(req.body?.matrix_id); if(!id)return res.status(400).json({error:'INVALID_MATRIX',message:'Selecione uma linha da matriz.'});
 const m=(await pool.query(`SELECT m.*,i.name icp_name,s.name segment_name,p.name product_name,p.key product_key,
 lp.path landing_page_path FROM message_matrix m
 LEFT JOIN icps i ON i.id=m.icp_id LEFT JOIN segments s ON s.id=m.segment_id
 LEFT JOIN products p ON p.id=m.product_id LEFT JOIN marketing_landing_pages lp ON lp.id=m.landing_page_id
 WHERE m.id=$1`,[id])).rows[0];
 if(!m)return res.status(404).json({error:'NOT_FOUND',message:'Linha estratégica não encontrada.'});
 if(!['VALIDATED','APPROVED'].includes(m.status) && req.user.role!=='ADMIN')
   return res.status(409).json({error:'STRATEGY_NOT_APPROVED',message:'A matriz precisa estar VALIDATED ou APPROVED para gerar campanha.'});
 const existing=(await pool.query('SELECT * FROM campaigns WHERE message_matrix_id=$1 ORDER BY created_at DESC LIMIT 1',[id])).rows[0];
 if(existing)return res.json({data:existing,created:false,message:'Já existe campanha para esta linha.'});
 const name=clean(req.body.name,180)||`${m.product_name||'G3Soft'} • ${m.segment_name||m.icp_name||'Estratégia'}`;
 const objective=`${m.message} ${m.benefit||''}`.trim();
 const landing=(process.env.G3_PUBLIC_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'')+(m.landing_page_path||'/g3soft');
 const r=await pool.query(`INSERT INTO campaigns(id,name,description,status,created_by,objective,budget_cents,target_segment,landing_page_url,strategy_id,message_matrix_id)
 VALUES($1,$2,$3,'DRAFT',$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
 [crypto.randomUUID(),name,`Campanha criada da matriz: ${m.icp_name||'—'} → ${m.segment_name||'—'} → ${m.product_name||'—'} → ${m.pain}.`,req.user.id,objective,Math.max(0,Number(req.body?.budget_cents||0)),m.segment_name||null,landing,m.strategy_id,id]);
 await pool.query(`UPDATE message_matrix SET campaign_id=$1,updated_at=NOW() WHERE id=$2`,[r.rows[0].id,id]);
 await audit(req,{action:'CREATE_FROM_MESSAGE_MATRIX',entity:'campaign',entityId:r.rows[0].id,afterData:r.rows[0]});
 res.status(201).json({data:r.rows[0],created:true,matrix:m});
}catch(e){next(e)}});

admin.post('/strategy/matrix/lp-draft',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const id=uuid(req.body?.matrix_id); if(!id)return res.status(400).json({error:'INVALID_MATRIX'});
 const m=(await pool.query(`SELECT m.*,s.name segment_name,p.name product_name,p.key product_key,i.name icp_name
 FROM message_matrix m LEFT JOIN segments s ON s.id=m.segment_id LEFT JOIN products p ON p.id=m.product_id LEFT JOIN icps i ON i.id=m.icp_id WHERE m.id=$1`,[id])).rows[0];
 if(!m)return res.status(404).json({error:'NOT_FOUND',message:'Linha estratégica não encontrada.'});
 const base=(m.segment_name||m.product_key||'nova-landing').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 const key=`strategy-${base}`;
 const pathValue=`/estrategias/${base}`;
 const existing=(await pool.query('SELECT * FROM marketing_landing_pages WHERE key=$1 OR path=$2',[key,pathValue])).rows[0];
 if(existing)return res.json({data:existing,created:false,message:'Landing Page já cadastrada para esta estratégia.'});
 const config={status:'DRAFT',strategy_id:m.strategy_id,message_matrix_id:id,icp:m.icp_name,segment:m.segment_name,product:m.product_key,pain:m.pain,need:m.need,message:m.message,benefit:m.benefit,offer:m.offer,cta:m.cta,seo:{title:`${m.product_name||'G3Soft'} para ${m.segment_name||'sua empresa'} | G3Soft`,description:m.message}};
 const r=await pool.query(`INSERT INTO marketing_landing_pages(id,key,name,path,type,active,strategy_id,message_matrix_id,status,draft_config)
 VALUES($1,$2,$3,$4,'OTHER',FALSE,$5,$6,'DRAFT',$7) RETURNING *`,
 [crypto.randomUUID(),key,`${m.product_name||'G3Soft'} • ${m.segment_name||'Estratégia'}`,pathValue,m.strategy_id,id,JSON.stringify(config)]);
 await pool.query(`UPDATE message_matrix SET landing_page_id=$1,updated_at=NOW() WHERE id=$2`,[r.rows[0].id,id]);
 await audit(req,{action:'CREATE_LANDING_DRAFT_FROM_MATRIX',entity:'marketing_landing_page',entityId:r.rows[0].id,afterData:r.rows[0]});
 res.status(201).json({data:r.rows[0],created:true,config});
}catch(e){next(e)}});

admin.post('/strategy/campaign-draft',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const id=uuid(req.body?.strategy_item_id); if(!id)return res.status(400).json({error:'INVALID_STRATEGY_ITEM',message:'Selecione uma estratégia.'});
 const srow=(await pool.query(`SELECT s.*,p.name AS landing_page_name,p.path AS landing_page_path
 FROM growth_strategy_items s LEFT JOIN marketing_landing_pages p ON p.key=s.landing_page_key
 WHERE s.id=$1 AND s.active=true`,[id])).rows[0];
 if(!srow)return res.status(404).json({error:'NOT_FOUND',message:'Estratégia não encontrada.'});
 const existing=(await pool.query('SELECT * FROM campaigns WHERE strategy_item_id=$1 ORDER BY created_at DESC LIMIT 1',[id])).rows[0];
 if(existing)return res.status(200).json({data:existing,created:false,message:'Campanha já existente para esta estratégia.'});
 const name=clean(req.body.name,180)||`${srow.campaign_key||srow.product_key||'g3soft'} • ${srow.segment}`;
 const objective=`${srow.message} Oferta: ${srow.offer||'Diagnóstico'}. CTA: ${srow.cta||'Falar com especialista'}.`;
 const landing=(process.env.G3_PUBLIC_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'')+(srow.landing_page_path||'/g3soft');
 const r=await pool.query(`INSERT INTO campaigns(id,name,description,status,created_by,objective,budget_cents,target_segment,landing_page_url,strategy_item_id)
 VALUES($1,$2,$3,'DRAFT',$4,$5,$6,$7,$8,$9) RETURNING *`,
 [crypto.randomUUID(),name,`Campanha criada a partir da Estratégia G3Soft: ${srow.icp} → ${srow.segment} → ${srow.pain_point}.`,req.user.id,objective,Math.max(0,Number(req.body?.budget_cents||0)),srow.segment,landing,id]);
 await audit(req,{action:'CREATE_FROM_STRATEGY',entity:'campaign',entityId:r.rows[0].id,afterData:r.rows[0]});
 res.status(201).json({data:r.rows[0],created:true,strategy:srow});
}catch(e){next(e)}});

admin.get('/leads/:id/timeline',async(req,res,next)=>{try{if(!uuid(req.params.id))return res.status(400).json({error:'INVALID_ID'});const r=await pool.query('SELECT * FROM marketing_touchpoints WHERE lead_id=$1 ORDER BY created_at DESC LIMIT 200',[req.params.id]);const q=await pool.query('SELECT id,channel,destination,status,scheduled_at,sent_at,last_error,created_at FROM marketing_message_queue WHERE lead_id=$1 ORDER BY created_at DESC',[req.params.id]);res.json({data:{touchpoints:r.rows,messages:q.rows}});}catch(e){next(e)}});
admin.get('/messages',async(req,res,next)=>{try{const r=await pool.query(`SELECT q.*,l.name AS lead_name,l.whatsapp,t.name AS template_name FROM marketing_message_queue q LEFT JOIN leads l ON l.id=q.lead_id LEFT JOIN whatsapp_templates t ON t.id=q.template_id ORDER BY q.created_at DESC LIMIT 200`);res.json({data:r.rows});}catch(e){next(e)}});
admin.get('/templates',async(req,res,next)=>{try{const r=await pool.query('SELECT * FROM whatsapp_templates WHERE active=true ORDER BY name');res.json({data:r.rows});}catch(e){next(e)}});
admin.get('/automations',async(req,res,next)=>{try{const r=await pool.query(`SELECT a.*,t.name AS template_name,t.provider_template_name FROM marketing_automations a LEFT JOIN whatsapp_templates t ON t.id=a.template_id ORDER BY a.created_at`);res.json({data:r.rows});}catch(e){next(e)}});
admin.post('/automations/:id/toggle',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{if(!uuid(req.params.id))return res.status(400).json({error:'INVALID_ID'});const r=await pool.query('UPDATE marketing_automations SET active=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[Boolean(req.body?.active),req.params.id]);if(!r.rowCount)return res.status(404).json({error:'NOT_FOUND'});res.json({data:r.rows[0]});}catch(e){next(e)}});

// v1.0.27 — Content Engine 6 Months
admin.get('/content-engine',async(req,res,next)=>{try{
  const week=Math.max(0,Number(req.query.week||0)), channel=clean(req.query.channel,60), status=clean(req.query.status,30);
  const params=[]; const where=[];
  if(week){params.push(week);where.push(`a.week_no=$${params.length}`);}
  if(channel){params.push(channel);where.push(`a.channel_key=$${params.length}`);}
  if(status){params.push(status);where.push(`a.status=$${params.length}`);}
  const clause=where.length?`WHERE ${where.join(' AND ')}`:'';
  const [assets,summary]=await Promise.all([
    pool.query(`SELECT a.*,g.theme,g.start_date,g.end_date,g.funnel_stage,g.primary_objective,
      c.name campaign_name,lp.name landing_page_name,lp.path landing_page_path
      FROM growth_content_assets a
      LEFT JOIN growth_calendar_items g ON g.id=a.calendar_item_id
      LEFT JOIN campaigns c ON c.id=a.campaign_id
      LEFT JOIN marketing_landing_pages lp ON lp.id=a.landing_page_id
      ${clause} ORDER BY a.week_no,a.channel_key`,params),
    pool.query(`SELECT COUNT(*)::int total,COUNT(*) FILTER(WHERE status='DRAFT')::int draft,
      COUNT(*) FILTER(WHERE status='APPROVED')::int approved,
      COUNT(*) FILTER(WHERE status='SCHEDULED')::int scheduled,
      COUNT(*) FILTER(WHERE status='PUBLISHED')::int published,
      COUNT(DISTINCT week_no)::int weeks,COUNT(DISTINCT channel_key)::int channels
      FROM growth_content_assets`)
  ]);
  res.json({data:{assets:assets.rows,summary:summary.rows[0]}});
}catch(e){next(e)}});
admin.patch('/content-engine/:id/status',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
  if(!uuid(req.params.id))return res.status(400).json({error:'INVALID_ID'});
  const allowed=['DRAFT','REVIEW','APPROVED','SCHEDULED','PUBLISHED','ARCHIVED'];
  const status=String(req.body?.status||'').toUpperCase();
  if(!allowed.includes(status))return res.status(400).json({error:'INVALID_STATUS'});
  const r=await pool.query(`UPDATE growth_content_assets SET status=$1,updated_at=NOW(),publish_at=CASE WHEN $1='SCHEDULED' AND publish_at IS NULL THEN NOW() ELSE publish_at END WHERE id=$2 RETURNING *`,[status,req.params.id]);
  if(!r.rowCount)return res.status(404).json({error:'NOT_FOUND'});
  await audit(req,{action:'UPDATE_CONTENT_ENGINE_STATUS',entity:'growth_content_asset',entityId:req.params.id,afterData:r.rows[0]});
  res.json({data:r.rows[0]});
}catch(e){next(e)}});


// v1.0.28 — Growth Relationship Center operational endpoints
admin.get('/relationship-center',async(req,res,next)=>{try{
  const [modules,playbooks,leadStages,signals,conversations,nps,queue]=await Promise.all([
    pool.query('SELECT * FROM relationship_modules WHERE active=true ORDER BY sort_order'),
    pool.query('SELECT * FROM relationship_playbooks WHERE active=true ORDER BY module,name'),
    pool.query(`SELECT status,COUNT(*)::int total FROM leads GROUP BY status ORDER BY status`),
    pool.query(`SELECT module_key,severity,COUNT(*)::int total FROM relationship_signals WHERE status='OPEN' GROUP BY module_key,severity ORDER BY module_key,severity`),
    pool.query(`SELECT status,COUNT(*)::int total,COUNT(*) FILTER(WHERE sla_due_at IS NOT NULL AND sla_due_at<NOW() AND status<>'CLOSED')::int sla_breached FROM relationship_conversations GROUP BY status ORDER BY status`),
    pool.query(`SELECT COUNT(*)::int total,COALESCE(ROUND(AVG(score),1),0)::numeric avg_score,COUNT(*) FILTER(WHERE score<=6)::int detractors,COUNT(*) FILTER(WHERE score>=9)::int promoters FROM relationship_experience_events`),
    pool.query(`SELECT status,COUNT(*)::int total FROM marketing_message_queue GROUP BY status ORDER BY status`)
  ]);
  const stageMap=Object.fromEntries(leadStages.rows.map(x=>[x.status,x.total]));
  res.json({data:{
    modules:modules.rows,
    playbooks:playbooks.rows,
    metrics:{
      leads:stageMap.NEW||0,mql:stageMap.MQL||0,sql:stageMap.SQL||0,demo:stageMap.DEMO||0,won:stageMap.WON||0,
      open_signals:signals.rows.reduce((n,x)=>n+x.total,0),
      conversations_open:conversations.rows.filter(x=>x.status==='OPEN').reduce((n,x)=>n+x.total,0),
      sla_breached:conversations.rows.reduce((n,x)=>n+x.sla_breached,0),
      nps_avg:nps.rows[0]?.avg_score||0,nps_detractors:nps.rows[0]?.detractors||0,nps_promoters:nps.rows[0]?.promoters||0,
      queue_pending:queue.rows.filter(x=>!['SENT','FAILED'].includes(x.status)).reduce((n,x)=>n+x.total,0)
    },
    signals:signals.rows,
    conversations:conversations.rows,
    nps:nps.rows[0]||{total:0,avg_score:0,detractors:0,promoters:0}
  }});
}catch(e){next(e)}});

admin.patch('/relationship-center/playbooks/:id',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
  const id=uuid(req.params.id); if(!id)return res.status(400).json({error:'INVALID_ID'});
  const active=Boolean(req.body?.active);
  const r=await pool.query('UPDATE relationship_playbooks SET active=$1,updated_at=NOW() WHERE id=$2 RETURNING *',[active,id]);
  if(!r.rowCount)return res.status(404).json({error:'NOT_FOUND'});
  await audit(req,{action:'UPDATE_RELATIONSHIP_PLAYBOOK',entity:'relationship_playbook',entityId:id,afterData:r.rows[0]});
  res.json({data:r.rows[0]});
}catch(e){next(e)}});

admin.post('/relationship-center/signals',async(req,res,next)=>{try{
  const title=clean(req.body?.title,220); if(!title)return res.status(400).json({error:'TITLE_REQUIRED'});
  const leadId=uuid(req.body?.lead_id)||null;
  const moduleKey=clean(req.body?.module_key,80)||'INTELLIGENCE';
  const severity=clean(req.body?.severity,20)||'INFO';
  const r=await pool.query(`INSERT INTO relationship_signals(id,lead_id,module_key,signal_type,severity,title,description,metadata) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [crypto.randomUUID(),leadId,moduleKey,clean(req.body?.signal_type,100)||'MANUAL',severity,title,clean(req.body?.description,2000)||null,req.body?.metadata||{}]);
  res.status(201).json({data:r.rows[0]});
}catch(e){next(e)}});

admin.post('/relationship-center/nps',async(req,res,next)=>{try{
  const score=Number(req.body?.score); if(!Number.isInteger(score)||score<0||score>10)return res.status(400).json({error:'INVALID_SCORE'});
  const contactId=uuid(req.body?.contact_id)||null,companyId=uuid(req.body?.company_id)||null;
  const category=score<=6?'DETRACTOR':score<=8?'PASSIVE':'PROMOTER';
  const r=await pool.query(`INSERT INTO relationship_experience_events(id,contact_id,company_id,score,category,feedback,owner_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [crypto.randomUUID(),contactId,companyId,score,category,clean(req.body?.feedback,4000)||null,uuid(req.body?.owner_id)||null]);
  res.status(201).json({data:r.rows[0]});
}catch(e){next(e)}});

admin.post('/relationship-center/conversations',async(req,res,next)=>{try{
  const leadId=uuid(req.body?.lead_id)||null,contactId=uuid(req.body?.contact_id)||null;
  const r=await pool.query(`INSERT INTO relationship_conversations(id,lead_id,contact_id,channel,status,priority,owner_id,subject,sla_due_at,metadata) VALUES($1,$2,$3,$4,'OPEN',$5,$6,$7,$8,$9) RETURNING *`,
    [crypto.randomUUID(),leadId,contactId,clean(req.body?.channel,40)||'WHATSAPP',clean(req.body?.priority,20)||'NORMAL',uuid(req.body?.owner_id)||null,clean(req.body?.subject,220)||null,req.body?.sla_due_at||null,req.body?.metadata||{}]);
  res.status(201).json({data:r.rows[0]});
}catch(e){next(e)}});

module.exports={admin,publicRouter};

// v1.0.26 — Growth Calendar / Traffic / Relationship center
admin.get('/growth-calendar',async(req,res,next)=>{try{
 const [channels,blueprints,calendar,playbooks]=await Promise.all([
  pool.query('SELECT * FROM growth_channel_plans WHERE active=true ORDER BY traffic_type,channel_name'),
  pool.query('SELECT * FROM growth_campaign_blueprints WHERE status<>\'ARCHIVED\' ORDER BY month_no,name'),
  pool.query('SELECT * FROM growth_calendar_items ORDER BY week_no'),
  pool.query('SELECT * FROM relationship_playbooks WHERE active=true ORDER BY module,name')
 ]);
 res.json({data:{channels:channels.rows,blueprints:blueprints.rows,calendar:calendar.rows,playbooks:playbooks.rows}});
}catch(e){next(e)}});

admin.post('/growth-calendar/campaigns/:id/create',requireRole('ADMIN','MANAGER'),async(req,res,next)=>{try{
 const id=uuid(req.params.id); if(!id)return res.status(400).json({error:'INVALID_ID'});
 const b=(await pool.query('SELECT * FROM growth_campaign_blueprints WHERE id=$1',[id])).rows[0];
 if(!b)return res.status(404).json({error:'NOT_FOUND',message:'Blueprint de campanha não encontrado.'});
 const existing=(await pool.query('SELECT * FROM campaigns WHERE name=$1 LIMIT 1',[b.name])).rows[0];
 if(existing)return res.json({data:existing,created:false,message:'Campanha já criada a partir deste blueprint.'});
 const r=await pool.query(`INSERT INTO campaigns(id,name,description,status,created_by,objective,target_segment,landing_page_url)
 VALUES($1,$2,$3,'DRAFT',$4,$5,$6,$7) RETURNING *`,[
  crypto.randomUUID(),b.name,`Campanha criada do calendário G3Soft: ${b.message} Oferta: ${b.offer}.`,req.user.id,b.objective,b.audience,b.landing_page_key?`${(process.env.G3_PUBLIC_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'')}/${b.landing_page_key}`:null
 ]);
 for(const channel of (b.channels||[])) await pool.query(`INSERT INTO campaign_channels(id,campaign_id,channel,budget_cents) VALUES($1,$2,$3,0) ON CONFLICT(campaign_id,channel) DO NOTHING`,[crypto.randomUUID(),r.rows[0].id,channel]);
 await audit(req,{action:'CREATE_FROM_CALENDAR_BLUEPRINT',entity:'campaign',entityId:r.rows[0].id,afterData:r.rows[0]});
 res.status(201).json({data:r.rows[0],created:true,blueprint:b});
}catch(e){next(e)}});
