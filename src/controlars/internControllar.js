const internModel=require("../model/internModel")
const {isValid}=require('../validation/valid')
const collegeModel=require('../model/collegeModel')

const createIntern=async function (req,res){
try{
    const internData=req.body
    if(!Object.keys(internData).length)return res.status(400).send({status:false,message:"request body is empty,fill all this name,email,mobile,collegName to create intern"})

    const internValiditySchema={
        name: {
            type:String,
            required:"name is mandatory",
            regex:[/^[a-zA-Z ]{3,}$/,"enter valid name"]
        },
        email : {
            type : String,
            required : "Email is required",
            unique : " email already axist",
            Trim:true,
            lowercase:true,
            regex:[/^([a-z-_\.0-9]{2,})@([a-z0-9]{3,6})\.([a-z]{2,6})(\.[a-z]{2,6})?$/,"enter valid email address"]
          },
        mobile: {
            type:Number,
            required:"mobile number required",
            unique:" this mobile number already exist",
            regex:[/^[6-9][0-9]{9}$/,"enter valid indian mobile number"]
        }, 
        collegeName: {
                 type: "String",
                required: true,
                dbcall:"college not found",
                Trim: true,
                lowercase: true,
                regex:[/^[a-zA-Z]{3,}$/,"name is invalid"]
        }
    }
    const filter = {}

    let result = [];
    
    for (let i in internValiditySchema) {
        let { dbcall, required, Trim, unique, lowercase,regex } = internValiditySchema[i]
        let temp={[i]:internData[i]}
        if (required && !isValid(temp[i])) { result.push(i);continue }
        if(typeof temp[i]==="string")temp[i]=temp[i].split(/\s+/).join(" ")
        if(regex && !regex[0].test(`${temp[i]}`)){ 
            result = regex[1]; break }

        if(Trim){temp[i]=temp[i].trim()}
        if(lowercase){temp[i]=temp[i].toLowerCase()}
        if (unique) {
            const data = await internModel.findOne({ [i]: temp[i],isDeleted:false})
            if (data) { result =temp[i]+ unique; break }
        }
        if(dbcall){
            const data = await collegeModel.findOne({ "name": temp[i],isDeleted:false})
            if (!data) { result = dbcall; break }
            i="collegeId"
            temp[i]=data._id

        }
        filter[i] = temp[i]
    }

    if (Array.isArray(result) && result.length) {

        let k = result.length > 1 ? ["are", "s"] : ['is', ""]
        return res.status(400).send({ status: false, message: result + ` this ${k[0]} the required field${k[1]} to create college document` })

    } else if (typeof result === "string") {
        return res.status(400).send({ status: false, message: result })
    }

    const internDoc=await internModel.create(filter)
    const {_id,name,email,mobile,collegeId}=internDoc
res.status(201).send({status:true,message:"Intern creation has successful!🎉🎊😁👍",internDocument:{_id,name,email,mobile,collegeId}})
}catch(err){
    res.status(500).send({status:false,message:err.message})
}
}


module.exports={createIntern}