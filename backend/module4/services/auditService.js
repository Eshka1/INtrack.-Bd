const crypto=require('crypto'); const AuditLog=require('../models/AuditLog'); const {sanitizeAuditValue}=require('../utils/sanitizeAudit');
class AuditService{
  static stableStringify(v){ if(v===null||typeof v!=='object')return JSON.stringify(v); if(Array.isArray(v))return `[${v.map(AuditService.stableStringify).join(',')}]`; const k=Object.keys(v).sort(); return `{${k.map(x=>`${JSON.stringify(x)}:${AuditService.stableStringify(v[x])}`).join(',')}}`; }
  static createHash(payload){ return crypto.createHash('sha256').update(AuditService.stableStringify(payload)).digest('hex'); }
  static async logAudit({companyId,actor,entityType,entityId,action,before=null,after=null}){
    if(!companyId) throw new Error('companyId is required.'); if(!entityType||!entityId||!action) throw new Error('entityType, entityId and action are required.');
    const cid=String(companyId); const previous=await AuditLog.findOne({companyId:cid}).sort({createdAt:-1}).lean();
    const cleanBefore=sanitizeAuditValue(before), cleanAfter=sanitizeAuditValue(after), timestamp=new Date().toISOString();
    const payload={companyId:cid,actor:{id:String(actor?.id||'system'),type:actor?.type||'System',name:actor?.name||''},entityType,entityId:String(entityId),action,before:cleanBefore,after:cleanAfter,previousHash:previous?.hash||null,timestamp};
    return AuditLog.create({...payload,timestamp:undefined,hash:AuditService.createHash(payload)});
  }
}
module.exports=AuditService;
