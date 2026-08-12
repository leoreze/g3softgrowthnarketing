const pool=require('../db/pool');
const {uuid}=require('../validators/common');

function dateRange(query){
  const from=query.from?String(query.from).slice(0,10):null;
  const to=query.to?String(query.to).slice(0,10):null;
  return {from,to};
}

async function analytics(query={}){
  const {from,to}=dateRange(query);
  const values=[]; const where=[];
  const add=(sql,val)=>{values.push(val);where.push(sql.replace('?',`$${values.length}`));};
  if(from) add('created_at >= ?::date',from);
  if(to) add('created_at < (?::date + INTERVAL \'1 day\')',to);
  const taskWhere=where.length?`WHERE ${where.join(' AND ')}`:'';

  const campaignValues=[]; const campaignWhere=[];
  if(query.campaign_id){campaignValues.push(uuid(query.campaign_id));campaignWhere.push(`c.id=$${campaignValues.length}`)}
  if(from){campaignValues.push(from);campaignWhere.push(`c.created_at >= $${campaignValues.length}::date`)}
  if(to){campaignValues.push(to);campaignWhere.push(`c.created_at < ($${campaignValues.length}::date + INTERVAL '1 day')`)}
  const cw=campaignWhere.length?`WHERE ${campaignWhere.join(' AND ')}`:'';

  const [overview,campaigns,channels,content,activity]=await Promise.all([
    pool.query(`SELECT
      (SELECT COUNT(*)::int FROM campaigns c ${cw}) campaigns,
      (SELECT COUNT(*)::int FROM campaigns c ${cw}${cw?' AND':'WHERE'} c.status='ACTIVE') active_campaigns,
      (SELECT COALESCE(SUM(c.budget_cents),0)::bigint FROM campaigns c ${cw}) budget_cents,
      (SELECT COUNT(*)::int FROM tasks t ${taskWhere}) tasks,
      (SELECT COUNT(*)::int FROM tasks t ${taskWhere}${taskWhere?' AND':'WHERE'} t.status IN ('DONE','APPROVED')) completed_tasks,
      (SELECT COUNT(*)::int FROM content_items ci ${from||to?'WHERE '+[from?`ci.created_at >= $${values.length+1}::date`:null,to?`ci.created_at < ($${values.length+(from?2:1)}::date + INTERVAL '1 day')`:null].filter(Boolean).join(' AND '):''}) content_items,
      (SELECT COUNT(*)::int FROM content_items ci ${from||to?'WHERE '+[from?`ci.created_at >= $${values.length+1}::date`:null,to?`ci.created_at < ($${values.length+(from?2:1)}::date + INTERVAL '1 day')`:null].filter(Boolean).join(' AND '):''} ${from||to?'AND':'WHERE'} ci.status='PUBLISHED') published_content,
      (SELECT COUNT(*)::int FROM approval_requests a WHERE a.status='PENDING') pending_approvals,
      (SELECT COUNT(*)::int FROM calendar_events e WHERE e.status='SCHEDULED') scheduled_events`,[...values,...(from?[from]:[]),...(to?[to]:[])]),
    pool.query(`SELECT c.id,c.name,c.status,c.budget_cents,c.target_segment,c.start_date,c.end_date,
      COUNT(DISTINCT t.id)::int task_count,
      COUNT(DISTINCT t.id) FILTER(WHERE t.status IN ('DONE','APPROVED'))::int completed_tasks,
      COUNT(DISTINCT ci.id)::int content_count,
      COUNT(DISTINCT ci.id) FILTER(WHERE ci.status='PUBLISHED')::int published_content,
      COUNT(DISTINCT ce.id)::int calendar_events
      FROM campaigns c
      LEFT JOIN phases p ON p.campaign_id=c.id
      LEFT JOIN tasks t ON t.phase_id=p.id
      LEFT JOIN content_items ci ON ci.campaign_id=c.id
      LEFT JOIN calendar_events ce ON ce.campaign_id=c.id
      ${cw} GROUP BY c.id ORDER BY c.created_at DESC`,campaignValues),
    pool.query(`SELECT cc.channel,COUNT(DISTINCT cc.campaign_id)::int campaigns,COALESCE(SUM(cc.budget_cents),0)::bigint budget_cents,
      COUNT(DISTINCT ci.id)::int content_count,
      COUNT(DISTINCT ci.id) FILTER(WHERE ci.status='PUBLISHED')::int published_content
      FROM campaign_channels cc
      LEFT JOIN content_items ci ON ci.campaign_id=cc.campaign_id AND ci.channel=cc.channel
      GROUP BY cc.channel ORDER BY budget_cents DESC,cc.channel`),
    pool.query(`SELECT status,COUNT(*)::int count FROM content_items GROUP BY status ORDER BY count DESC`),
    pool.query(`SELECT DATE_TRUNC('day',created_at)::date AS activity_date,COUNT(*)::int AS created FROM tasks GROUP BY 1 ORDER BY 1 DESC LIMIT 30`)
  ]);
  const o=overview.rows[0]||{};
  o.completion_rate=Number(o.tasks)?Math.round(Number(o.completed_tasks)/Number(o.tasks)*100):0;
  o.content_publish_rate=Number(o.content_items)?Math.round(Number(o.published_content)/Number(o.content_items)*100):0;
  return {overview:o,campaigns:campaigns.rows,channels:channels.rows,content:content.rows,activity:activity.rows,filters:{from,to,campaign_id:query.campaign_id||null}};
}
module.exports={analytics};
