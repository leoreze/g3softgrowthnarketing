const bcrypt=require('bcryptjs');
const pool=require('../db/pool');

function isValidEmail(email){
  return typeof email==='string' && email.length<=180 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function authenticateUser(email,password){
  if(!isValidEmail(email)||typeof password!=='string'||password.length===0) return {ok:false};
  const result=await pool.query('SELECT id,name,email,password_hash,role,active FROM users WHERE LOWER(email)=LOWER($1) LIMIT 1',[email]);
  const user=result.rows[0];
  if(!user||!user.active) return {ok:false};
  let passwordMatches=false;
  try{ passwordMatches=await bcrypt.compare(password,user.password_hash); }catch{ passwordMatches=false; }
  if(!passwordMatches) return {ok:false};
  return {ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}};
}

module.exports={authenticateUser,isValidEmail};
