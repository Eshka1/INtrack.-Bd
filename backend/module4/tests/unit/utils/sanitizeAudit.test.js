const {sanitizeAuditValue}=require('../../../utils/sanitizeAudit');
describe('sanitizeAuditValue',()=>{test('removes sensitive keys recursively',()=>{expect(sanitizeAuditValue({name:'A',password:'x',nested:{token:'y',value:1}})).toEqual({name:'A',nested:{value:1}});});test('sanitizes arrays',()=>{expect(sanitizeAuditValue([{pass:'x',name:'A'}])).toEqual([{name:'A'}]);});});
