class TenantContext{
  static getCompanyId(req){return req.user?.company_id||req.user?.companyId||req.headers['x-company-id']||null;}
  static requireTenant(req,res,next){const id=TenantContext.getCompanyId(req);if(!id)return res.status(401).json({message:'Authenticated tenant/company context is required.'});req.companyId=String(id);return next();}
}
module.exports=TenantContext;
