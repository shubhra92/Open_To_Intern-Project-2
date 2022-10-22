const express = require('express');
const mongoose=require('mongoose');
const {config}=require('dotenv')
const route=require('./Router/route')

const app=express()

//ENV
config()
const port=(process.env.PORT||3000) , mongoDB_Url=process.env.mongoDB_Url 

//CONNECT MongoDB
mongoose.connect(mongoDB_Url).then(()=>console.log("Establish connection to the mongoDB has successful!"),(err)=>console.log(err))

app.use(express.json())
//all Route
app.use(route)

//ERROR on route not found
app.use((req,res,next)=>{
    req.status=404
    const error=new Error("Route not found!")
    next(error)
})

//error handel
app.use((err,req,res,next)=>{
    res.status(req.status).send({
        status:false,
        message:err.message,
        // stack:err.stack
    })

})

app.listen(port,()=>console.log("server running on "+port))