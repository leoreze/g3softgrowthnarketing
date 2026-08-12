const crypto=require('crypto');
const pool=require('../db/pool');
async function audit(req,{action,entity,entityId,beforeData=null,afterData=null}){
  const clean=(value)=>{ if(!value||typeof value!=='object') return value; const copy=JSON.parse(JSON.stringify(value)); for(const key of Object.keys(copy)){ if(/password|secret|token/i.test(key)) delete copy[key]; } return copy; };
  await pool.query('INSERT INTO audit_logs(id,user_id,action,entity,entity_id,before_data,after_data,ip,user_agent) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[crypto.randomUUID(),req.user?.id||null,action,entity,entityId||null,clean(beforeData),clean(afterData),req.ip,req.get('user-agent')||null]);
}
module.exports=audit;
