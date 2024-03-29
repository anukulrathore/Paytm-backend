const mongoose = require("mongoose");
const { number } = require("zod");
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)

const userSchema = mongoose.Schema({
    username:String,
    password: String,
    firstname: String,
    lastname: String,
})

const User = mongoose.model('User', userSchema)

const accountSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    balance:{
        type:Number,
        required:true,
    },
})

const Account = mongoose.model("Account", accountSchema)


module.exports={User,Account}   
