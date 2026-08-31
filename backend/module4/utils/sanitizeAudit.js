const SENSITIVE = new Set(['password','pass','accessToken','refreshToken','token','secret']);
function sanitizeAuditValue(value){
  if(value===null||value===undefined) return value;
  if(Array.isArray(value)) return value.map(sanitizeAuditValue);
  if(typeof value==='object'){
    const plain=typeof value.toObject==='function'?value.toObject():value, clean={};
    for(const [k,v] of Object.entries(plain)){ if(!SENSITIVE.has(k)) clean[k]=sanitizeAuditValue(v); }
    return clean;
  }
  return value;
}
module.exports={sanitizeAuditValue};
