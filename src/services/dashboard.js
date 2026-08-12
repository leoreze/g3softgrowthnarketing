const pool=require('../db/pool');
async function summary(){
 const r=await pool.query(`SELECT
 (SELECT COUNT(*) FROM phases)::int phases,
 (SELECT COUNT(*) FROM tasks)::int tasks,
 (SELECT COUNT(*) FROM tasks WHERE status='IN_PROGRESS')::int in_progress,
 (SELECT COUNT(*) FROM tasks WHERE status='PENDING_APPROVAL')::int pending_approvals,
 (SELECT COUNT(*) FROM tasks WHERE status='DONE')::int done_tasks,
 (SELECT COUNT(*) FROM tasks WHERE due_date<CURRENT_DATE AND status NOT IN('DONE','APPROVED'))::int overdue_tasks`);
 const phase=await pool.query(`SELECT p.id,p.phase_order,p.name,p.short_name,p.color,p.start_date,p.end_date,p.objective,COUNT(t.id)::int task_count,COUNT(t.id) FILTER(WHERE t.status IN('DONE','APPROVED'))::int done_count FROM phases p LEFT JOIN tasks t ON t.phase_id=p.id GROUP BY p.id ORDER BY p.phase_order`);
 const s=r.rows[0]; s.progress=Number(s.tasks)?Math.round((Number(s.done_tasks)/Number(s.tasks))*100):0; return {summary:s,phases:phase.rows};
}
module.exports={summary};
