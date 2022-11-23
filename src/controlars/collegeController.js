const { findOne } = require('../model/collegeModel')
const collegeModel = require('../model/collegeModel')
const internModel = require('../model/internModel')
const { isValid } = require('../validation/valid')

const createCollege = async function (req, res) {
    try {
        const collegeData = req.body
        if(!Object.keys(collegeData).length)return res.status(400).send({status:false,message:"request is empty, fill the data of name,fullName,logoLink"})

        const colValidSchema = {
            name: {
                type: String,
                required: true,
                Trim: true,
                unique: "The name already exist",
                lowercase: true,
                regex:[/^[a-zA-Z]{3,}$/,"name is invalid"]
            },
            fullName: {
                type: String,
                Trim: true,
                required: true,
                regex:[/^[ a-zA-Z]{3,}$/,"fullName is invalid"]

            },
            logoLink: {
                required: true,
                type: String,
                regex:[/^https?:\/\/(www\.)?[a-z0-9-_]{2,}((\.[a-z0-9-_]{2,}){1,})?\.[a-z]{2,4}(\.[a-z]{2,4})?((\/[^ \{\}\[\]]{3,})?){1,}$/,"invalid link"]
            }
        }

        const filter = {}

        let result = [];
        
        for (let i in colValidSchema) {
            let { type, required, Trim, unique, lowercase,regex } = colValidSchema[i]

            if (required && !isValid(collegeData[i])) { result.push(i);continue }
            if(typeof collegeData[i]==="string")collegeData[i]=collegeData[i].split(/\s+/).join(" ")
            if(regex && !regex[0].test(collegeData[i])){ 
                result = regex[1]; break }

            if(Trim){collegeData[i]=collegeData[i].trim()}
            if(lowercase){collegeData[i]=collegeData[i].toLowerCase()}
            if (unique) {
                const data = await collegeModel.findOne({ [i]: collegeData[i],isDeleted:false})
                if (data) { result = unique; break }
            }
            if(i==="name"){
                ((x)=>{let rgx=`^${x.split("").map(a=>a+"[a-z]{1,}").join("( [a-z]{1,3})? ")}$`;
                colValidSchema.fullName.regex=[new RegExp(rgx,'i'),`${collegeData["fullName"]} is not fullName of ${collegeData[i]}`]
            })(collegeData[i])
                }
            filter[i] = collegeData[i]
        }

        if (Array.isArray(result) && result.length) {

            let k = result.length > 1 ? ["are", "s"] : ['is', ""]
            return res.status(400).send({ status: false, message: result + ` this ${k[0]} the required field${k[1]} to create college document` })

        } else if (typeof result === "string") {
            return res.status(400).send({ status: false, message: result })
        }


        let docData=await collegeModel.create(filter)
        const {_id,name,fullName,logoLink}=docData
        res.status(201).send({status:true,message:"College document creation successful! 😁👍🎊🎉",Document:{name,fullName,logoLink,_id}})


    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}


const getCollegeDetail=async function(req,res){
try{
    if(!Object.keys(req.query).length)return res.status(400).send({status:false.valueOf,message:"you can search college details by the collegeName"})
    let collegeName=req.query.collegeName
    if(!isValid(collegeName))return res.status(400).send({status:false,message:"college searching possible by collegeName"})
    if(!/^[a-zA-Z]{3,}$/.test(`${collegeName}`))return res.status(400).send({status:false,message:"plz enter valid college name"})
    collegeName=collegeName.toLowerCase()
    const collegeDoc=await collegeModel.findOne({"name":`${collegeName}`,isDeleted:false}).select({"isDeleted":0,"__v":0,"updatedAt":0,"createdAt":0}).lean()
    if(!collegeDoc)return res.status(400).send({status:false,message:"no college found with this name "+collegeName+" 👽😢"})
    let allLinkedInternsDoc=await internModel.find({collegeId:collegeDoc._id,isDeleted:false}).select({isDeleted:0,createdAt:0,updatedAt:0,__v:0})
    let k=allLinkedInternsDoc.length
    if(!k)allLinkedInternsDoc="no intern"
    else {allLinkedInternsDoc={NumberOfInter:k,Documents:allLinkedInternsDoc}}
    res.status(200).send({status:true,message:`Here ${collegeDoc.fullName} college full detail what you asked!👍✅`,
    CollegeDocument:{...collegeDoc,AllIntens:allLinkedInternsDoc}
})

}catch(err){
    res.status(500).send({status:false,message:err.message})
}
}




module.exports={createCollege,getCollegeDetail}