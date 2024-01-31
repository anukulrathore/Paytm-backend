const express = require("express");
const router = express.Router();
const zod = require('zod')
const jwt = require("jsonwebtoken")
const {User,Account} = require("../db")
const bcrypt = require("bcrypt")
const {authMiddleware} = require("../middlewares/middleware")

const signupBody = zod.object({
    username:zod.string().email(),
    firstname:zod.string(),
    lastname:zod.string(),
    password:zod.string(),
})

router.post("/signup", async (req,res) => {
    
    const { success } = signupBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            message:"invalid input"
        })
    }

    const existinguser = await User.findOne({username:req.body.username})
    if(existinguser){
        return res.status(411).json({
            message: "Email already taken"
        })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    try{
        const user = await User.create({
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        password: hashedPassword,
        })
        const userId = user._id;
        await Account.create({
            userId,
            balance:1+Math.random()*10000,
        })
        
        const token = jwt.sign({
            userId
        },process.env.JWT_SECRET);
        res.json({
            message:"User created successfully",
            token: token
        })
    }
    catch(err){
        console.log(err);
    }
})

const signinBody = zod.object({
    username:zod.string().email(),
    password:zod.string(),
})

router.post("/signin", async (req,res)=>{
    const {success} = signinBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            message:"Invalid inputs"
        })
    }

    const user = await User.findOne({username:req.body.username});
    const userpassword = req.body.password;
    try{
        const passwordmatch = await bcrypt.compare(userpassword, user.password)
        if(passwordmatch){
            const userId = user._id
            const token = jwt.sign({
                userId
            },process.env.JWT_SECRET);
            res.json({
                token:token,
            })
            return;
        }
        res.status(411).json({
            message:"Signin failed"
        })
    }
    catch(err){
        console.log(err);
    }
})

const updateBody = zod.object({
    firstname: zod.string().optional(),
    lastname: zod.string().optional(),
    password: zod.string().optional()
})

router.put("/", authMiddleware, async (req,res)=>{
    const { success } = updateBody.safeParse(req.body)
    if(!success){
        res.status(411).json({
            message:"Error while updating information"
        })
    }

    try {
        await User.updateOne(req.body, {
            id: req.userId
        })
        res.json({message: "Update successful"});
    } catch (error) {
        console.log(error)
    }    

})


router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";
    try{
        const users = await User.find({
            $or: [{
                firstname: {
                    "$regex": filter
                }
            }, {
                lastname: {
                    "$regex": filter
                }
            }]
        })

        res.json({
            user: users.map(user => ({
                username: user.username,
                firstname: user.firstname,
                lastname: user.lastname,
                _id: user._id

            }))
            
        })
    }
    catch(err){
        console.log(err);
    }
})

module.exports=router