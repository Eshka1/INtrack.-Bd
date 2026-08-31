class SuperAdminGuard{static requireSuperAdmin(req,res,next){const role=String(req.user?.role||'').toLowerCase();if(role!=='superadmin'&&req.user?.isSuperAdmin!==true)return res.status(403).json({message:'Super Admin access required.'});return next();}}
module.exports=SuperAdminGuard;
