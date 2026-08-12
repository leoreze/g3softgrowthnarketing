const migrate = require('./migrate');
const seed = require('./seed');
const pool = require('./pool');

async function setup(){
  await migrate();
  await seed();
  console.log('Database setup OK');
}

if(require.main===module){
  setup().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>pool.end());
}

module.exports=setup;
