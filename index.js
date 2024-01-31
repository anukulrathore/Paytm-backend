const express = require("express");
const app = express();
const mainRouter = require('./routes/index')
const cors = require("cors")
require('dotenv').config();

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use("/api/v1", mainRouter);


app.listen(process.env.PORT, ()=>{
    console.log("server is listening on 3000");
})
