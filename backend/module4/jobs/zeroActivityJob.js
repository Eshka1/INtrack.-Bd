const cron=require('node-cron');const ActivityService=require('../services/activityService');
class ZeroActivityJob{static start(){return cron.schedule('0 1 * * *',async()=>{try{await ActivityService.runZeroActivityCheck();}catch(error){console.error('[Module4] Zero-activity job failed:',error);}});}}
module.exports=ZeroActivityJob;
