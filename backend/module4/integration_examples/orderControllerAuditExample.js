// Call this pattern after a successful Order/PO update in the existing Order controller.
const AuditService=require('../services/auditService');
async function exampleAfterOrderUpdate({req,orderBefore,orderAfter}){return AuditService.logAudit({companyId:req.user.company_id,actor:{id:req.user.id,type:req.user.role||'Manager',name:req.user.name||''},entityType:'Order',entityId:orderAfter._id,action:'PO_UPDATE',before:orderBefore,after:orderAfter});}
module.exports={exampleAfterOrderUpdate};
