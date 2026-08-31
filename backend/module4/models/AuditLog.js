const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  companyId:{type:String,required:true,index:true,immutable:true},
  actor:{id:{type:String,required:true,immutable:true},type:{type:String,required:true,immutable:true},name:{type:String,default:'',immutable:true}},
  entityType:{type:String,required:true,index:true,immutable:true}, entityId:{type:String,required:true,index:true,immutable:true},
  action:{type:String,required:true,immutable:true}, before:{type:mongoose.Schema.Types.Mixed,default:null,immutable:true},
  after:{type:mongoose.Schema.Types.Mixed,default:null,immutable:true}, previousHash:{type:String,default:null,immutable:true},
  hash:{type:String,required:true,immutable:true,index:true}
},{timestamps:{createdAt:true,updatedAt:false},versionKey:false});
function reject(next){ next(new Error('Audit logs are append-only. Update/delete operations are not allowed.')); }
['updateOne','updateMany','findOneAndUpdate','deleteOne','deleteMany','findOneAndDelete'].forEach(h=>schema.pre(h,reject));
module.exports = mongoose.model('AuditLog',schema);
