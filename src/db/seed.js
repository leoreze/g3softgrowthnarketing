const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('./pool');
const env = require('../config/env');
const id = () => crypto.randomUUID();

async function seed() {
  if (env.isProduction) throw new Error('db:seed is blocked in production. Use db:bootstrap with explicit secrets.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const pass = process.env.SEED_ADMIN_PASSWORD || '';
    const minimumPasswordLength = env.isProduction ? 12 : 8;
    if (pass.length < minimumPasswordLength) throw new Error(`SEED_ADMIN_PASSWORD is required and must have at least ${minimumPasswordLength} characters.`);
    const users = [
      ['admin@g3soft.local', 'G3Soft Admin', 'ADMIN'],
      ['stakeholder@g3soft.local', 'G3Soft Stakeholder', 'STAKEHOLDER'],
      ['manager@g3soft.local', 'G3Soft Manager', 'MANAGER'],
      ['user@g3soft.local', 'G3Soft User', 'USER']
    ];
    const userIds = {};
    for (const [email, name, role] of users) {
      const r = await client.query('SELECT id FROM users WHERE email=$1', [email]);
      userIds[role] = r.rows[0]?.id || id();
      const passwordHash = await bcrypt.hash(pass, 12);
      if (!r.rowCount) {
        await client.query(
          'INSERT INTO users(id,name,email,password_hash,role,active) VALUES($1,$2,$3,$4,$5,TRUE)',
          [userIds[role], name, email, passwordHash, role]
        );
      } else {
        // Development seed is intentionally idempotent and also repairs the
        // known bootstrap credential drift that can otherwise cause 401s.
        await client.query(
          'UPDATE users SET name=$1,password_hash=$2,role=$3,active=TRUE,updated_at=NOW() WHERE id=$4',
          [name, passwordHash, role, userIds[role]]
        );
      }
    }
    let r = await client.query('SELECT id FROM campaigns WHERE name=$1', ['G3Soft Growth Marketing 180 Dias']);
    const campaignId = r.rows[0]?.id || id();
    if (!r.rowCount) await client.query('INSERT INTO campaigns(id,name,description,status,start_date,end_date,created_by) VALUES($1,$2,$3,$4,$5,$6,$7)', [campaignId, 'G3Soft Growth Marketing 180 Dias', 'Roadmap operacional de Growth Marketing para 180 dias.', 'ACTIVE', '2026-08-17', '2027-02-12', userIds.ADMIN]);
    const phases = [
      ['Fundação','0–30 DIAS','2026-08-17','2026-09-15','Construir a base sólida para o crescimento.','#168BFF'],
      ['Conversão','31–60 DIAS','2026-09-16','2026-10-15','Transformar tráfego em oportunidades.','#72C92B'],
      ['Aquisição','61–90 DIAS','2026-10-16','2026-11-14','Aumentar o volume de leads qualificados.','#FFB000'],
      ['Otimização','91–120 DIAS','2026-11-15','2026-12-14','Transformar dados em eficiência e previsibilidade.','#A14DCC'],
      ['Automação','121–150 DIAS','2026-12-15','2027-01-13','Automatizar processos e aumentar eficiência comercial.','#1689A8'],
      ['Escala','151–180 DIAS','2027-01-14','2027-02-12','Escalar o que funciona e acelerar o crescimento.','#D92B52']
    ];
    const phaseIds=[];
    for (let i=0;i<phases.length;i++) {
      r=await client.query('SELECT id FROM phases WHERE campaign_id=$1 AND phase_order=$2',[campaignId,i+1]);
      const pid=r.rows[0]?.id||id(); phaseIds.push(pid);
      if(!r.rowCount) await client.query('INSERT INTO phases(id,campaign_id,phase_order,name,short_name,start_date,end_date,objective,color,status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)',[pid,campaignId,i+1,...phases[i],'PLANNED']);
    }
    const tasks=[
      ['Auditoria completa do site, SEO, anúncios e CRM','HIGH',0],['Definição de ICP e personas','HIGH',0],['Arquitetura de analytics e dashboard','HIGH',0],
      ['Criação das primeiras landing pages','HIGH',1],['Implementação de tracking e eventos','CRITICAL',1],['Campanhas Google Ads de alta intenção','HIGH',2],
      ['Campanhas Meta Ads','MEDIUM',2],['SEO on-page e conteúdo estratégico','MEDIUM',2],['Lead scoring e qualificação automática','HIGH',3],
      ['Dashboard executivo de performance','HIGH',3],['Automação CRM + WhatsApp + E-mail','HIGH',4],['Recuperação de leads perdidos','MEDIUM',4],
      ['Escala das campanhas Top Performers','HIGH',5],['Programa de indicação e prova social','MEDIUM',5]
    ];
    for (const [title,priority,pi] of tasks) {
      const exists=await client.query('SELECT 1 FROM tasks WHERE phase_id=$1 AND title=$2',[phaseIds[pi],title]);
      if(!exists.rowCount) await client.query('INSERT INTO tasks(id,phase_id,title,status,priority,assignee_id,reviewer_id,created_by,due_date) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id(),phaseIds[pi],title,'BACKLOG',priority,userIds.MANAGER,userIds.STAKEHOLDER,userIds.ADMIN,phases[pi][3]]);
    }
    const events=[
      ['Kickoff do Growth OS','MEETING','2026-08-17T13:00:00Z','2026-08-17T14:00:00Z','Sala de estratégia',phaseIds[0]],
      ['Demo interna da nova landing page','DEMO','2026-08-20T16:00:00Z','2026-08-20T16:45:00Z','Google Meet',phaseIds[0]],
      ['Follow-up de oportunidade prioritária','FOLLOW_UP','2026-08-24T13:30:00Z','2026-08-24T14:00:00Z','WhatsApp',phaseIds[0]],
      ['Deadline — tracking e analytics','DEADLINE','2026-08-28T20:00:00Z','2026-08-28T20:30:00Z','',phaseIds[0]]
    ];
    for(const [title,type,start,end,location,phaseId] of events){
      const exists=await client.query('SELECT 1 FROM calendar_events WHERE title=$1 AND start_at=$2',[title,start]);
      if(!exists.rowCount) await client.query('INSERT INTO calendar_events(id,campaign_id,phase_id,owner_id,title,event_type,start_at,end_at,location,status,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)',[id(),campaignId,phaseId,userIds.MANAGER,title,type,start,end,location||null,'SCHEDULED',userIds.ADMIN]);
    }
    const channels=['SEO','GOOGLE_ADS','META_ADS','YOUTUBE'];
    for(const channel of channels){const exists=await client.query('SELECT 1 FROM campaign_channels WHERE campaign_id=$1 AND channel=$2',[campaignId,channel]);if(!exists.rowCount)await client.query('INSERT INTO campaign_channels(id,campaign_id,channel,budget_cents) VALUES($1,$2,$3,$4)',[id(),campaignId,channel,0]);}
    const contentTitle='Case G3Soft — Conteúdo de demonstração';
    const contentExists=await client.query('SELECT id FROM content_items WHERE title=$1 AND campaign_id=$2',[contentTitle,campaignId]);
    if(!contentExists.rowCount){await client.query('INSERT INTO content_items(id,campaign_id,phase_id,title,format,channel,status,copy,cta,scheduled_at,owner_id,created_by) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',[id(),campaignId,phaseIds[0],contentTitle,'LINKEDIN','LINKEDIN','IDEA','Conteúdo inicial para validar o Content Planner do Growth OS.','Quero conhecer a G3Soft',null,userIds.MANAGER,userIds.ADMIN]);}
    await client.query('COMMIT'); console.log('Seed OK');
  } catch(e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}
if(require.main===module) seed().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>pool.end());
module.exports=seed;
