const express=require('express');
const rateLimit=require('express-rate-limit');
const pool=require('../db/pool');
const {authenticateUser}=require('../services/auth');
const {requireAuth}=require('../middleware/auth');

const router=express.Router();
const loginLimit=rateLimit({
  windowMs:15*60*1000,
  limit:20,
  standardHeaders:'draft-8',
  legacyHeaders:false,
  message:{error:'RATE_LIMITED',message:'Muitas tentativas. Tente novamente mais tarde.'}
});

router.post('/login',loginLimit,async(req,res,next)=>{
  try{
    const email=String(req.body?.email??'').trim().toLowerCase();
    const password=String(req.body?.password??'');
    if(!email||!password)return res.status(400).json({error:'INVALID_INPUT',message:'E-mail e senha são obrigatórios.'});

    const result=await authenticateUser(email,password);
    if(!result.ok){
      // Never expose whether the account exists, is inactive, or has a bad password.
      return res.status(401).json({error:'INVALID_CREDENTIALS',message:'Credenciais inválidas.'});
    }

    req.session.regenerate(err=>{
      if(err)return next(err);
      req.session.user=result.user;req.session.createdAt=Date.now();
      req.session.save(async saveError=>{
        if(saveError)return next(saveError);
        try{
          await pool.query('UPDATE users SET last_login_at=NOW(),updated_at=NOW() WHERE id=$1',[result.user.id]);
        }catch(e){
          // Session is already valid; do not turn a successful login into a 500 because
          // a non-critical timestamp update failed.
          console.error('[AUTH_LOGIN_METADATA_UPDATE]',e.message);
        }
        return res.json({data:{user:req.session.user}});
      });
    });
  }catch(e){next(e)}
});

router.post('/logout',(req,res,next)=>req.session.destroy(e=>e?next(e):(res.clearCookie('g3sid'),res.status(204).end())));
router.get('/me',(req,res)=>res.json({data:{user:req.session.user||null}}));
router.get('/users',requireAuth,async(req,res,next)=>{try{if(req.user.role!=='ADMIN')return res.status(403).json({error:'FORBIDDEN',message:'Permissão insuficiente.'});const r=await pool.query('SELECT id,name,email,role,active FROM users ORDER BY name');res.json({data:r.rows});}catch(e){next(e)}});
module.exports=router;
