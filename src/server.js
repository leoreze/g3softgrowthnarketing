const app=require('./app');
const env=require('./config/env');
const pkg=require('../package.json');
const pool=require('./db/pool');
const {runAutomations}=require('./services/automation');
const {processMessageQueue}=require('./services/marketing');

let automationTimer=null;
let automationEnabled=false;
async function canRunAutomations(){
  try{
    const r=await pool.query("SELECT to_regclass('public.automation_rules') AS automation_rules, to_regclass('public.notifications') AS notifications, to_regclass('public.automation_runs') AS automation_runs");
    const ready=Boolean(r.rows[0]?.automation_rules&&r.rows[0]?.notifications&&r.rows[0]?.automation_runs);
    if(!ready) console.warn('[automation] schema not ready; scheduler disabled until migrations are applied.');
    return ready;
  }catch(error){console.warn(`[automation] preflight unavailable: ${error.message}`);return false;}
}
async function tick(){if(!automationEnabled) return;try{await runAutomations();await processMessageQueue()}catch(error){console.error(`[automation] ${error.message}`)}}
async function start(){
  const server=app.listen(env.port,'0.0.0.0',async()=>{
    console.log(`G3Soft Growth OS v${pkg.version} running on http://localhost:${env.port}`);
    automationEnabled=await canRunAutomations();
    if(automationEnabled){await tick();automationTimer=setInterval(tick,5*60*1000);}
  });
  async function shutdown(signal){
    console.log(`${signal}: shutting down`);if(automationTimer)clearInterval(automationTimer);
    server.close(async()=>{await pool.end().catch(()=>{});process.exit(0)});
    setTimeout(async()=>{await pool.end().catch(()=>{});process.exit(1)},10000).unref();
  }
  process.on('SIGTERM',()=>shutdown('SIGTERM'));process.on('SIGINT',()=>shutdown('SIGINT'));
}
start().catch(async error=>{console.error(error);await pool.end().catch(()=>{});process.exit(1)});
