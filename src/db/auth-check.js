const bcrypt=require('bcryptjs');
const pool=require('./pool');
const env=require('../config/env');

async function authCheck(){
  const email=String(process.env.AUTH_CHECK_EMAIL||process.env.BOOTSTRAP_ADMIN_EMAIL||'').trim().toLowerCase();
  const password=String(process.env.AUTH_CHECK_PASSWORD||process.env.BOOTSTRAP_ADMIN_PASSWORD||'');
  if(!email) throw new Error('AUTH_CHECK_EMAIL is required.');
  if(!password) throw new Error('AUTH_CHECK_PASSWORD is required.');
  if(env.isProduction && process.env.BOOTSTRAP_REMOTE_CONFIRM!=='YES') throw new Error('Production auth check requires BOOTSTRAP_REMOTE_CONFIRM=YES.');
  if(env.isProduction && process.env.BOOTSTRAP_REMOTE_CONFIRM!=='YES') throw new Error('Production auth check requires BOOTSTRAP_REMOTE_CONFIRM=YES.');
  const r=await pool.query('SELECT id,name,email,role,active,password_hash FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1',[email]);
  if(!r.rowCount){ console.log('ACCOUNT: NOT_FOUND'); console.log('PASSWORD_MATCH: NO'); return; }
  const u=r.rows[0];
  const match=await bcrypt.compare(password,u.password_hash).catch(()=>false);
  console.log(`ACCOUNT: ${u.active?'ACTIVE':'INACTIVE'}`);
  console.log(`ROLE: ${u.role}`);
  console.log(`PASSWORD_MATCH: ${match?'YES':'NO'}`);
  console.log(`LOGIN_READY: ${u.active&&match?'YES':'NO'}`);
}
if(require.main===module)authCheck().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>pool.end());
module.exports=authCheck;
