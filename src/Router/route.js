const route=require('express').Router();
const {createCollege,getCollegeDetail}=require("../controlars/collegeController")
const {createIntern}=require('../controlars/internControllar')

//--------------college API--------------------
route.post("/functionup/colleges",createCollege)
route.get("/functionup/colleges",getCollegeDetail)


//--------------intern API----------------------
route.post("/functionup/interns",createIntern)

module.exports=route