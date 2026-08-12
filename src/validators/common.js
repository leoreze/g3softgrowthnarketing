function text(value,max=500,required=true){ if(value===undefined||value===null||value===''){if(required)throw Object.assign(new Error('Campo obrigatório.'),{status:400});return null;} if(typeof value!=='string'||value.trim().length>max)throw Object.assign(new Error('Campo inválido.'),{status:400});return value.trim(); }
function uuid(value){ if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value)))throw Object.assign(new Error('Identificador inválido.'),{status:400});return value; }
const oneOf=(value,values)=>{if(!values.includes(value))throw Object.assign(new Error('Valor inválido.'),{status:400});return value;};
module.exports={text,uuid,oneOf};
