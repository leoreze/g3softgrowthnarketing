const crypto=require('crypto');
const pool=require('../db/pool');

function clean(v,max=500){if(v===undefined||v===null)return null;const s=String(v).trim();return s?s.slice(0,max):null;}
function digits(v){return String(v||'').replace(/\D/g,'').slice(0,20);}
function normalizeEmail(v){const s=clean(v,180);return s?s.toLowerCase():null;}
function sourceType({source,medium,referrer}){
  const s=String(source||'').toLowerCase(), m=String(medium||'').toLowerCase(), r=String(referrer||'').toLowerCase();
  if(s.includes('google')&&(m.includes('cpc')||m.includes('ppc')||m.includes('paid')||m.includes('ads')))return 'GOOGLE_ADS';
  if(s.includes('google')||r.includes('google.'))return 'GOOGLE_ORGANIC';
  if(s.includes('instagram'))return m.includes('paid')||m.includes('cpc')?'META_ADS':'INSTAGRAM';
  if(s.includes('facebook')||s.includes('meta'))return m.includes('paid')||m.includes('cpc')?'META_ADS':'FACEBOOK';
  if(s.includes('linkedin'))return 'LINKEDIN';
  if(s.includes('youtube'))return 'YOUTUBE';
  if(s.includes('whatsapp'))return 'WHATSAPP';
  if(s)return 'OTHER';
  if(r)return 'REFERRAL';
  return 'WEBSITE';
}
function hashIp(ip){return crypto.createHash('sha256').update(`${process.env.ATTRIBUTION_HASH_SALT||'g3soft-attribution'}:${ip||''}`).digest('hex');}
function attributionFrom(input={}){
  return {
    source:clean(input.utm_source||input.source,120),medium:clean(input.utm_medium||input.medium,120),campaign:clean(input.utm_campaign||input.campaign,180),term:clean(input.utm_term||input.term,180),content:clean(input.utm_content||input.content,180),
    referrer:clean(input.referrer_url||input.referrer,2000),gclid:clean(input.gclid,180),fbclid:clean(input.fbclid,180),msclkid:clean(input.msclkid,180),ttclid:clean(input.ttclid,180),
    landing_page_key:clean(input.landing_page_key,160),landing_page_path:clean(input.landing_page_path||input.landing_page_url,500),visitor_id:clean(input.visitor_id,120),session_id:clean(input.session_id,120),tracking_link_code:clean(input.g3_link||input.tracking_link_code,32)
  };
}
async function resolveLink(code){if(!code)return null;const r=await pool.query(`SELECT l.*,p.key AS landing_page_key,p.path AS landing_page_path FROM marketing_tracking_links l LEFT JOIN marketing_landing_pages p ON p.id=l.landing_page_id WHERE l.code=$1 AND l.active=true`,[code]);return r.rows[0]||null;}
async function resolveSourceId(type){const r=await pool.query('SELECT id FROM lead_sources WHERE type=$1 AND active=true ORDER BY name LIMIT 1',[type]);return r.rows[0]?.id||null;}
async function queueLeadMessages(lead,event){
  const rules=(await pool.query(`SELECT a.*,t.name template_name,t.body,t.provider_template_name FROM marketing_automations a LEFT JOIN whatsapp_templates t ON t.id=a.template_id WHERE a.active=true AND a.trigger_event=$1 ORDER BY a.created_at`,[event])).rows;
  for(const rule of rules){
    const destination=digits(lead.whatsapp||lead.phone); if(rule.channel==='WHATSAPP'&&!destination)continue;
    await pool.query(`INSERT INTO marketing_message_queue(id,lead_id,automation_id,template_id,channel,destination,payload,scheduled_at) VALUES($1,$2,$3,$4,$5,$6,$7,NOW()+($8||' minutes')::interval)`,[crypto.randomUUID(),lead.id,rule.id,rule.template_id,rule.channel,destination,JSON.stringify({name:lead.name,product_interest:lead.product_interest||'',segment:lead.segment||'',template_name:rule.template_name,provider_template_name:rule.provider_template_name}),String(rule.delay_minutes)]);
  }
}
async function createOrUpdatePublicLead(input,req){
  const a=attributionFrom(input); const link=await resolveLink(a.tracking_link_code);
  if(link){
    a.source=a.source||link.source;a.medium=a.medium||link.medium;a.campaign=a.campaign||link.campaign;a.term=a.term||link.term;a.content=a.content||link.content;a.landing_page_key=a.landing_page_key||link.landing_page_key;a.landing_page_path=a.landing_page_path||link.landing_page_path;
  }
  const sourceTypeValue=sourceType(a); const sourceId=await resolveSourceId(sourceTypeValue);
  const email=normalizeEmail(input.email); const whatsapp=digits(input.whatsapp||input.phone); const name=clean(input.name,180); const companyName=clean(input.company,180);
  if(!name||(!email&&!whatsapp))throw Object.assign(new Error('Nome e e-mail ou WhatsApp são obrigatórios.'),{status:400});
  let companyId=null;
  if(companyName){const cr=await pool.query(`SELECT id FROM companies WHERE lower(trade_name)=lower($1) ORDER BY updated_at DESC LIMIT 1`,[companyName]);if(cr.rowCount)companyId=cr.rows[0].id;else{const nc=await pool.query(`INSERT INTO companies(id,trade_name,email,whatsapp,status) VALUES($1,$2,$3,$4,'PROSPECT') RETURNING id`,[crypto.randomUUID(),companyName,email,whatsapp||null]);companyId=nc.rows[0].id;}}
  const existing=(await pool.query(`SELECT * FROM leads WHERE ($1::text IS NOT NULL AND lower(email)=lower($1)) OR ($2::text <> '' AND regexp_replace(COALESCE(whatsapp,phone,''),'\\D','','g')=$2) ORDER BY updated_at DESC LIMIT 1`,[email,whatsapp])).rows[0];
  let lead,created=false;
  if(existing){
    const r=await pool.query(`UPDATE leads SET company_id=COALESCE($1,company_id),name=$2,email=COALESCE($3,email),whatsapp=COALESCE(NULLIF($4,''),whatsapp),phone=COALESCE(NULLIF($4,''),phone),product_interest=COALESCE($5,product_interest),segment=COALESCE($6,segment),source_id=COALESCE($7,source_id),campaign_id=COALESCE($8,campaign_id),tracking_link_id=COALESCE($9,tracking_link_id),landing_page_key=COALESCE($10,landing_page_key),landing_page_path=COALESCE($11,landing_page_path),referrer_url=COALESCE($12,referrer_url),utm_source=COALESCE($13,utm_source),utm_medium=COALESCE($14,utm_medium),utm_campaign=COALESCE($15,utm_campaign),utm_term=COALESCE($16,utm_term),utm_content=COALESCE($17,utm_content),gclid=COALESCE($18,gclid),fbclid=COALESCE($19,fbclid),msclkid=COALESCE($20,msclkid),ttclid=COALESCE($21,ttclid),visitor_id=COALESCE($22,visitor_id),session_id=COALESCE($23,session_id),last_touch_at=NOW(),attribution=attribution||$24::jsonb,notes=COALESCE(NULLIF($25,''),notes),updated_at=NOW() WHERE id=$26 RETURNING *`,[companyId,name,email,whatsapp,clean(input.product_interest,80),clean(input.segment,100),sourceId,input.campaign_id||link?.campaign_id||null,link?.id||null,a.landing_page_key,a.landing_page_path,a.referrer,a.source,a.medium,a.campaign,a.term,a.content,a.gclid,a.fbclid,a.msclkid,a.ttclid,a.visitor_id,a.session_id,JSON.stringify(a),clean(input.challenge,5000),existing.id]);
    lead=r.rows[0];
  }else{
    lead=(await pool.query(`INSERT INTO leads(id,company_id,name,email,phone,whatsapp,product_interest,segment,status,score,source_id,campaign_id,tracking_link_id,landing_page_key,landing_page_path,referrer_url,utm_source,utm_medium,utm_campaign,utm_term,utm_content,gclid,fbclid,msclkid,ttclid,visitor_id,session_id,first_touch_at,last_touch_at,attribution,consent_marketing,notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,'NEW',10,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,NOW(),NOW(),$27,$28,$29) RETURNING *`,[crypto.randomUUID(),companyId,name,email,whatsapp||null,whatsapp||null,clean(input.product_interest,80),clean(input.segment,100),sourceId,input.campaign_id||link?.campaign_id||null,link?.id||null,a.landing_page_key,a.landing_page_path,a.referrer,a.source,a.medium,a.campaign,a.term,a.content,a.gclid,a.fbclid,a.msclkid,a.ttclid,a.visitor_id,a.session_id,JSON.stringify(a),Boolean(input.consent_marketing),clean(input.challenge,5000)] )).rows[0];
    created=true;
  }
  if(!lead.contact_id){const cr=await pool.query(`INSERT INTO contacts(id,company_id,name,email,phone,whatsapp,status) VALUES($1,$2,$3,$4,$5,$6,'ACTIVE') RETURNING id`,[crypto.randomUUID(),companyId,name,email,whatsapp||null,whatsapp||null]);await pool.query('UPDATE leads SET contact_id=$1,updated_at=NOW() WHERE id=$2',[cr.rows[0].id,lead.id]);lead=(await pool.query('SELECT * FROM leads WHERE id=$1',[lead.id])).rows[0];}
  await pool.query(`INSERT INTO marketing_touchpoints(id,lead_id,visitor_id,session_id,event_type,landing_page_key,landing_page_path,referrer_url,source,medium,campaign,term,content,channel,tracking_link_id,campaign_id,gclid,fbclid,msclkid,ttclid,metadata,ip_hash,user_agent) VALUES($1,$2,$3,$4,'FORM_SUBMIT',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,[crypto.randomUUID(),lead.id,a.visitor_id,a.session_id,a.landing_page_key,a.landing_page_path,a.referrer,a.source,a.medium,a.campaign,a.term,a.content,sourceTypeValue,link?.id||null,input.campaign_id||link?.campaign_id||null,a.gclid,a.fbclid,a.msclkid,a.ttclid,JSON.stringify({challenge:clean(input.challenge,1000),page_title:clean(input.page_title,300)}),hashIp(req.ip),clean(req.get('user-agent'),1000)]);
  if(link)await pool.query('UPDATE marketing_tracking_links SET clicks=clicks+1,updated_at=NOW() WHERE id=$1',[link.id]);
  await pool.query(`INSERT INTO lead_history(id,lead_id,event_type,description,metadata) VALUES($1,$2,'ACQUISITION','Lead capturado por ${sourceTypeValue}', $3)`,[crypto.randomUUID(),lead.id,JSON.stringify({source:sourceTypeValue,attribution:a,created})]);
  if(created)await queueLeadMessages(lead,'LEAD_CREATED');
  const salesNumber=digits(process.env.WHATSAPP_SALES_NUMBER);
  const wa= salesNumber ? `https://wa.me/${salesNumber}?text=${encodeURIComponent(`Olá, sou ${name}. Acabei de solicitar contato pela G3Soft${a.landing_page_key?` (${a.landing_page_key})`:''}.`)}` : null;
  return {lead,created,source_type:sourceTypeValue,whatsapp_url:wa};
}
async function trackTouchpoint(input,req){
  const a=attributionFrom(input); const link=await resolveLink(a.tracking_link_code); if(link){a.source=a.source||link.source;a.medium=a.medium||link.medium;a.campaign=a.campaign||link.campaign;a.term=a.term||link.term;a.content=a.content||link.content;a.landing_page_key=a.landing_page_key||link.landing_page_key;a.landing_page_path=a.landing_page_path||link.landing_page_path;}
  const source=sourceType(a); const id=crypto.randomUUID();
  if(!lead.contact_id){const cr=await pool.query(`INSERT INTO contacts(id,company_id,name,email,phone,whatsapp,status) VALUES($1,$2,$3,$4,$5,$6,'ACTIVE') RETURNING id`,[crypto.randomUUID(),companyId,name,email,whatsapp||null,whatsapp||null]);await pool.query('UPDATE leads SET contact_id=$1,updated_at=NOW() WHERE id=$2',[cr.rows[0].id,lead.id]);lead=(await pool.query('SELECT * FROM leads WHERE id=$1',[lead.id])).rows[0];}
  await pool.query(`INSERT INTO marketing_touchpoints(id,visitor_id,session_id,event_type,landing_page_key,landing_page_path,referrer_url,source,medium,campaign,term,content,channel,tracking_link_id,campaign_id,gclid,fbclid,msclkid,ttclid,metadata,ip_hash,user_agent) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`,[id,a.visitor_id,a.session_id,clean(input.event_type,40)||'PAGE_VIEW',a.landing_page_key,a.landing_page_path,a.referrer,a.source,a.medium,a.campaign,a.term,a.content,source,link?.id||null,input.campaign_id||link?.campaign_id||null,a.gclid,a.fbclid,a.msclkid,a.ttclid,JSON.stringify(input.metadata||{}),hashIp(req.ip),clean(req.get('user-agent'),1000)]);
  if(link&&String(input.event_type||'').toUpperCase()==='LINK_CLICK')await pool.query('UPDATE marketing_tracking_links SET clicks=clicks+1,updated_at=NOW() WHERE id=$1',[link.id]);
  return {id,source_type:source};
}
async function processMessageQueue(){
  const rows=(await pool.query(`SELECT q.*,t.provider_template_name,t.language_code,t.body, l.name,l.product_interest,l.segment FROM marketing_message_queue q LEFT JOIN whatsapp_templates t ON t.id=q.template_id LEFT JOIN leads l ON l.id=q.lead_id WHERE q.status='PENDING' AND q.scheduled_at<=NOW() ORDER BY q.scheduled_at LIMIT 20`)).rows;
  const token=process.env.WHATSAPP_CLOUD_TOKEN, phoneId=process.env.WHATSAPP_PHONE_NUMBER_ID, apiVersion=process.env.WHATSAPP_API_VERSION||'v23.0'; let sent=0,failed=0;
  for(const q of rows){
    await pool.query("UPDATE marketing_message_queue SET status='SENDING',attempts=attempts+1,updated_at=NOW() WHERE id=$1",[q.id]);
    try{
      if(q.channel==='WHATSAPP'){
        if(!token||!phoneId||!q.provider_template_name)throw new Error('WhatsApp Cloud API não configurada ou template aprovado ausente.');
        const body=q.body.replace(/\{\{1\}\}/g,q.name||'').replace(/\{\{2\}\}/g,q.product_interest||q.segment||'sua operação');
        const payload={messaging_product:'whatsapp',to:q.destination,type:'template',template:{name:q.provider_template_name,language:{code:q.language_code||'pt_BR'},components:[{type:'body',parameters:[{type:'text',text:q.name||'cliente'},{type:'text',text:q.product_interest||q.segment||'sua operação'}]}]}};
        const response=await fetch(`https://graph.facebook.com/${apiVersion}/${phoneId}/messages`,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(payload)});
        const data=await response.json(); if(!response.ok)throw new Error(data?.error?.message||'WhatsApp API error');
        await pool.query("UPDATE marketing_message_queue SET status='SENT',sent_at=NOW(),provider_message_id=$1,updated_at=NOW() WHERE id=$2",[data?.messages?.[0]?.id||null,q.id]);sent++;
      }else{await pool.query("UPDATE marketing_message_queue SET status='SENT',sent_at=NOW(),updated_at=NOW() WHERE id=$1",[q.id]);sent++;}
    }catch(e){failed++;await pool.query("UPDATE marketing_message_queue SET status='FAILED',last_error=$1,updated_at=NOW() WHERE id=$2",[e.message.slice(0,1000),q.id]);}
  }
  return {processed:rows.length,sent,failed};
}
module.exports={attributionFrom,sourceType,resolveLink,createOrUpdatePublicLead,trackTouchpoint,processMessageQueue};
