const bcrypt=require('bcryptjs');
const crypto=require('crypto');
const pool=require('./pool');
const env=require('../config/env');

async function bootstrap(){
  if(env.isProduction && process.env.BOOTSTRAP_REMOTE_CONFIRM!=='YES') throw new Error('Production bootstrap requires BOOTSTRAP_REMOTE_CONFIRM=YES.');
  const email=String(process.env.BOOTSTRAP_ADMIN_EMAIL||process.env.SEED_ADMIN_EMAIL||'').trim().toLowerCase();
  const password=String(process.env.BOOTSTRAP_ADMIN_PASSWORD||process.env.SEED_ADMIN_PASSWORD||'');
  const name=String(process.env.BOOTSTRAP_ADMIN_NAME||'G3Soft Admin').trim();
  if(!email||!password) throw new Error('BOOTSTRAP_ADMIN_EMAIL (or SEED_ADMIN_EMAIL) and BOOTSTRAP_ADMIN_PASSWORD (or SEED_ADMIN_PASSWORD) are required.');
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Admin email is invalid.');
  const minimumPasswordLength = env.isProduction ? 12 : 8;
  if(password.length<minimumPasswordLength) throw new Error(`Admin password must have at least ${minimumPasswordLength} characters.`);
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    const hash=await bcrypt.hash(password,12);
    const existing=await client.query('SELECT id FROM users WHERE email=$1',[email]);
    let userId;
    if(existing.rowCount){
      userId=existing.rows[0].id;
      await client.query("UPDATE users SET name=$1,password_hash=$2,role='ADMIN',active=TRUE,updated_at=NOW() WHERE id=$3",[name,hash,userId]);
      console.log('Admin bootstrap updated.');
    }else{
      userId=crypto.randomUUID();
      await client.query("INSERT INTO users(id,name,email,password_hash,role,active) VALUES($1,$2,$3,$4,'ADMIN',TRUE)",[userId,name,email,hash]);
      console.log('Admin bootstrap created.');
    }
    if(await client.query("SELECT to_regclass('public.audit_logs') AS table_name").then(r=>r.rows[0].table_name)){
      await client.query("INSERT INTO audit_logs(id,user_id,action,entity,entity_id,after_data) VALUES($1,$2,'CREATE','USER',$3,$4)",[crypto.randomUUID(),userId,userId,JSON.stringify({role:'ADMIN',source:'bootstrap'})]);
    }
    await client.query('COMMIT');
  }catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();}
}
if(require.main===module)bootstrap().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>pool.end());
module.exports=bootstrap;
