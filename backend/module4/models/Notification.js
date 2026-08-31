const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  companyId:{type:String,required:true,index:true}, type:{type:String,enum:['ZERO_ACTIVITY'],required:true},
  message:{type:String,required:true}, dateKey:{type:String,required:true}, read:{type:Boolean,default:false}
},{timestamps:true,versionKey:false});
schema.index({companyId:1,type:1,dateKey:1},{unique:true});
module.exports = mongoose.model('Notification',schema);
