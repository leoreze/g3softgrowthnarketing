function requireAuth(req,res,next){ if(!req.session.user) return res.status(401).json({error:'AUTH_REQUIRED',message:'Autenticação necessária.'}); req.user=req.session.user; next(); }
function requireRole(...roles){ return (req,res,next)=>roles.includes(req.user?.role) ? next() : res.status(403).json({error:'FORBIDDEN',message:'Permissão insuficiente.'}); }
function requireFreshSession(req,res,next){
  if(!req.session?.user) return res.status(401).json({error:'AUTH_REQUIRED',message:'Autenticação necessária.'});
  if(req.session.createdAt && Date.now()-req.session.createdAt > 12*60*60*1000) return res.status(401).json({error:'SESSION_EXPIRED',message:'Sessão expirada.'});
  next();
}
module.exports={requireAuth,requireRole,requireFreshSession};
