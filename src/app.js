const path=require('path');
const fs=require('fs');
const crypto=require('crypto');
const express=require('express');
const helmet=require('helmet');
const session=require('express-session');
const pgSession=require('connect-pg-simple')(session);
const rateLimit=require('express-rate-limit');
const pool=require('./db/pool');
const env=require('./config/env');
const pkg=require('../package.json');
const app=express();
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY || 1));

const csp={defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'"],imgSrc:["'self'",'data:'],connectSrc:["'self'"],fontSrc:["'self'"],objectSrc:["'none'"],frameAncestors:["'none'"],baseUri:["'self'"],formAction:["'self'"]};
app.use(helmet({contentSecurityPolicy:{directives:csp},hsts:env.isProduction?{maxAge:31536000,includeSubDomains:true,preload:true}:false,referrerPolicy:{policy:'strict-origin-when-cross-origin'},crossOriginOpenerPolicy:{policy:'same-origin'},crossOriginResourcePolicy:{policy:'same-origin'},permissionsPolicy:{features:{camera:[],microphone:[],geolocation:[],payment:[]}}}));
app.use((req,res,next)=>{req.id=crypto.randomUUID();res.setHeader('X-Request-ID',req.id);if(req.path.startsWith('/api/'))res.setHeader('Cache-Control','no-store');next();});
app.use(express.json({limit:'200kb'}));
app.use(express.urlencoded({extended:false,limit:'50kb'}));

const sessionCookieName=env.isProduction?'__Host-g3sid':'g3sid';
app.use(session({name:sessionCookieName,store:new pgSession({pool,tableName:'user_sessions',createTableIfMissing:!env.isProduction}),secret:env.sessionSecret,resave:false,saveUninitialized:false,rolling:true,cookie:{httpOnly:true,sameSite:'lax',secure:env.isProduction,path:'/',maxAge:12*60*60*1000}}));

const apiLimiter=rateLimit({windowMs:60*1000,limit:240,standardHeaders:'draft-8',legacyHeaders:false,message:{error:'RATE_LIMITED',message:'Muitas requisições. Tente novamente em instantes.'}});
app.use('/api',apiLimiter);

const unsafeMethods=new Set(['POST','PUT','PATCH','DELETE']);
app.use('/api',(req,res,next)=>{
  if(!unsafeMethods.has(req.method) || req.path==='/auth/login') return next();
  const origin=req.get('origin');
  if(origin && !env.allowedOrigins.includes(origin)) return res.status(403).json({error:'ORIGIN_FORBIDDEN',message:'Origem não autorizada.'});
  next();
});

app.get('/api/health',async(req,res)=>{try{await pool.query('SELECT 1');res.json({data:{status:'ok',version:pkg.version,requestId:req.id}})}catch(e){res.status(503).json({error:'DB_UNAVAILABLE',message:'Serviço temporariamente indisponível.',requestId:req.id})}});
app.get('/api/ready',async(req,res)=>{try{const r=await pool.query("SELECT to_regclass('public.schema_migrations') AS schema_migrations, to_regclass('public.automation_rules') AS automation_rules, to_regclass('public.notifications') AS notifications, to_regclass('public.task_acceptance_criteria') AS task_acceptance_criteria, to_regclass('public.task_evidence_requirements') AS task_evidence_requirements, to_regclass('public.task_evidence') AS task_evidence, EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='tasks' AND column_name='execution_type') AS task_execution_type");const row=r.rows[0];const checks={schemaMigrations:Boolean(row.schema_migrations),automationRules:Boolean(row.automation_rules),notifications:Boolean(row.notifications),taskAcceptanceCriteria:Boolean(row.task_acceptance_criteria),taskEvidenceRequirements:Boolean(row.task_evidence_requirements),taskEvidence:Boolean(row.task_evidence),taskExecutionType:Boolean(row.task_execution_type)};const ready=Object.values(checks).every(Boolean);let migrationRequired=null;if(!ready&&checks.schemaMigrations){const m=await pool.query("SELECT 1 FROM schema_migrations WHERE version='015'");if(!m.rowCount)migrationRequired='016_task_execution_schema_repair';}res.status(ready?200:503).json({data:{status:ready?'ready':'not_ready',version:pkg.version,requestId:req.id,checks,migrationRequired}})}catch(e){res.status(503).json({error:'NOT_READY',message:'Dependências ainda não estão prontas.',requestId:req.id})}});

app.use('/api/auth',require('./routes/auth'));app.use('/api/campaigns',require('./routes/campaigns'));app.use('/api/phases',require('./routes/phases'));app.use('/api/tasks',require('./routes/tasks'));
app.use('/api/work',require('./routes/work-management'));app.use('/api/calendar',require('./routes/calendar'));app.use('/api/calendar-events',require('./routes/calendar-events'));app.use('/api/dashboard',require('./routes/dashboard'));app.use('/api/audit',require('./routes/audit'));app.use('/api/approvals',require('./routes/approvals'));app.use('/api/workflows',require('./routes/workflows'));app.use('/api/content',require('./routes/content'));app.use('/api/analytics',require('./routes/analytics'));app.use('/api/notifications',require('./routes/notifications'));app.use('/api/automations',require('./routes/automations'));app.use('/api/diagnostics',require('./routes/diagnostics'));
app.get(/^\/g3soft\/?$/, (req,res)=>{
  res.sendFile(path.join(__dirname,'../public/g3soft/index.html'));
});
const landingSlugs=new Set(['g3erp','g3control','g3food','g3pedidos','g3small','varejo','supermercados','restaurantes','lojas','conveniencias','multilojas','descubra-seu-g3','calculadora-de-perdas']);
const landingSeo=JSON.parse(fs.readFileSync(path.join(__dirname,'../public/landing/landing-seo.json'),'utf8'));
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
app.get(/^\/(g3erp|g3control|g3food|g3pedidos|g3small|varejo|supermercados|restaurantes|lojas|conveniencias|multilojas|descubra-seu-g3|calculadora-de-perdas)\/?$/, (req,res)=>{
  const slug=req.path.replace(/^\/+|\/+$/g,'').toLowerCase();
  const meta=landingSeo[slug]||landingSeo.g3erp;
  const publicUrl=(process.env.G3_PUBLIC_URL||`${req.protocol}://${req.get('host')}`).replace(/\/$/,'');
  const canonical=`${publicUrl}/${slug}`;
  const template=fs.readFileSync(path.join(__dirname,'../public/landing/index.html'),'utf8');
  const html=template.replace('<title>G3Soft | Gestão que transforma dados em crescimento</title>',`<title>${escapeHtml(meta.title)}</title>`)
    .replace('<meta name="description" content="G3Soft — tecnologia de gestão para transformar operação, informação e dados em crescimento.">',`<meta name="description" content="${escapeHtml(meta.description)}">`)
    .replace('<meta property="og:title" content="G3Soft | Gestão que transforma dados em crescimento">',`<meta property="og:title" content="${escapeHtml(meta.title)}">`)
    .replace('<meta property="og:description" content="Soluções de gestão para empresas que querem mais controle, clareza e capacidade de crescer.">',`<meta property="og:description" content="${escapeHtml(meta.description)}">`)
    .replace('<link rel="canonical" href="/g3erp">',`<link rel="canonical" href="${escapeHtml(canonical)}">`);
  res.type('html').send(html);
});
app.use(express.static(path.join(__dirname,'../public'),{extensions:['html'],maxAge:env.isProduction?'1h':0,fallthrough:true}));
app.use((req,res,next)=>req.path.startsWith('/api/')?res.status(404).json({error:'NOT_FOUND',message:'Endpoint não encontrado.',requestId:req.id}):res.sendFile(path.join(__dirname,'../public/index.html')));
app.use((err,req,res,next)=>{console.error(`[${new Date().toISOString()}] request=${req.id||'unknown'} error=${err.message}`);const status=Number(err.status)||500;res.status(status).json({error:status>=400&&status<500?'REQUEST_ERROR':'INTERNAL_ERROR',message:status<500?err.message:'Erro interno.',requestId:req.id});});
module.exports=app;
