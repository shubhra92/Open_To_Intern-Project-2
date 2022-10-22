function isValid(value){
    if(value===undefined || value===null)return false
    if(typeof value==='string' && value.trim()==='')return false
    return true
}

module.exports={isValid}