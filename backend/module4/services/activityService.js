const {Company}=require('../adapters/coreModels'); const AuditLog=require('../models/AuditLog'); const Notification=require('../models/Notification'); const holidays=require('../config/holidays');
class ActivityService{
  static dateKey(d=new Date()){return d.toISOString().slice(0,10);} static isConfiguredHoliday(d=new Date()){return holidays.includes(ActivityService.dateKey(d));}
  static async runZeroActivityCheck(now=new Date()){
    if(ActivityService.isConfiguredHoliday(now)) return {skipped:true,reason:'CONFIGURED_HOLIDAY',notificationsCreated:0};
    const cutoff=new Date(now.getTime()-24*60*60*1000),companies=await Company.find().lean(); let notificationsCreated=0;
    for(const company of companies){ const companyId=String(company.company_id||company._id), latest=await AuditLog.findOne({companyId}).sort({createdAt:-1}).lean(); const inactive=!latest||new Date(latest.createdAt).getTime()<cutoff.getTime(); if(!inactive)continue; const r=await Notification.updateOne({companyId,type:'ZERO_ACTIVITY',dateKey:ActivityService.dateKey(now)},{$setOnInsert:{companyId,type:'ZERO_ACTIVITY',dateKey:ActivityService.dateKey(now),read:false,message:`No meaningful activity was logged for company "${company.company_name||companyId}" during the previous 24 hours.`}},{upsert:true}); if(r.upsertedCount===1)notificationsCreated++; }
    return {skipped:false,notificationsCreated};
  }
}
module.exports=ActivityService;
