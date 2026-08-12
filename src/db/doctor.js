const fs=require('fs');
const path=require('path');
const pool=require('./pool');
const env=require('../config/env');

async function doctor(){
  const r=await pool.query(`SELECT current_database() AS database,current_user AS user,current_setting('server_version') AS pg_version,to_regclass('public.schema_migrations') AS migrations_table,to_regclass('public.users') AS users_table,to_regclass('public.task_acceptance_criteria') AS task_acceptance_criteria,to_regclass('public.task_evidence_requirements') AS task_evidence_requirements,to_regclass('public.task_evidence') AS task_evidence,EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='execution_type') AS task_execution_type`);
  const x=r.rows[0];
  console.log(`Database: ${x.database}`);
  console.log(`User: ${x.user}`);
  console.log(`Host: ${env.databaseHost}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Local database: ${env.isLocalDatabase ? 'YES' : 'NO'}`);
  console.log(`PostgreSQL: ${x.pg_version}`);
  console.log(`schema_migrations: ${x.migrations_table ? 'YES' : 'NO'}`);
  console.log(`users table: ${x.users_table ? 'YES' : 'NO'}`);
  const acceptanceReady=Boolean(x.task_acceptance_criteria&&x.task_evidence_requirements&&x.task_evidence&&x.task_execution_type);
  console.log(`Execution/approval schema (015 + 016 + 017 reconciliation): ${acceptanceReady ? 'READY' : 'PENDING'}`);

  if(x.migrations_table){
    const migrations=await pool.query('SELECT version,name FROM schema_migrations ORDER BY version');
    const applied=new Set(migrations.rows.map(row=>row.version));
    const dir=path.join(__dirname,'migrations');
    const files=fs.readdirSync(dir).filter(f=>f.endsWith('.sql')).sort();
    const pending=files.filter(file=>!applied.has(file.split('_')[0]));
    if(pending.length) console.log(`Pending migrations: ${pending.join(', ')}`);
    else console.log('Pending migrations: none');
  }else{
    console.log('Pending migrations: all (schema_migrations does not exist)');
  }

  if(!x.users_table){console.log('ADMIN: NOT_READY (run npm run db:migrate first)');return;}
  const u=await pool.query("SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE role='ADMIN')::int AS admins, COUNT(*) FILTER (WHERE active)::int AS active FROM users");
  console.log(`Users: ${u.rows[0].total}`);
  console.log(`Active admins: ${u.rows[0].admins}`);
  console.log(`Active users: ${u.rows[0].active}`);
  if(Number(u.rows[0].admins)===0) console.log('ADMIN: NOT_PROVISIONED (run npm run db:bootstrap with explicit confirmation)');
  else console.log('ADMIN: READY');

  if(!acceptanceReady) console.log('ACTION: run npm run db:migrate to apply the execution schema repair (017_execution_schema_reconciliation).');
}
if(require.main===module)doctor().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>pool.end());
module.exports=doctor;
