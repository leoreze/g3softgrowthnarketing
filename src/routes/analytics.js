const express=require('express');
const {requireAuth}=require('../middleware/auth');
const {analytics}=require('../services/analytics');
const router=express.Router();
router.use(requireAuth);
router.get('/',async(req,res,next)=>{try{res.json({data:await analytics(req.query)})}catch(e){next(e)}});
module.exports=router;
