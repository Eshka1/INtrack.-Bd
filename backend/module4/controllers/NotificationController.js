const Notification=require('../models/Notification');
class NotificationController{
 static async list(req,res){try{const items=await Notification.find({companyId:req.companyId}).sort({createdAt:-1}).limit(100).lean();return res.json(items);}catch(error){return res.status(500).json({message:error.message});}}
 static async markRead(req,res){try{const item=await Notification.findOneAndUpdate({_id:req.params.id,companyId:req.companyId},{read:true},{new:true});if(!item)return res.status(404).json({message:'Notification not found.'});return res.json(item);}catch(error){return res.status(500).json({message:error.message});}}
}
module.exports=NotificationController;
