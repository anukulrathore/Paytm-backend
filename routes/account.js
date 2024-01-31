const express = require("express");
const { authMiddleware } = require("../middlewares/middleware");
const { Account } = require("../db");
const router = express.Router();
const mongoose = require("mongoose")
router.get("/balance", authMiddleware, async (req,res)=>{
    
    try {
        const account = await Account.findOne({userId:req.userId});
        
        res.json({
            balance:account.balance,
        })
    } catch (error) {
        console.log(error);
    }
})



router.post("/transfer", authMiddleware, async(req,res)=>{
    const { to, amount } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const account = await Account.findOne({userId:req.userId}).session(session);
        console.log(account.balance);
        if(!account || account.balance<amount){
            await session.abortTransaction();
            res.status(400).json({
                message:"Insufficient Balance"
            })
            return
        }
        const payee = await Account.findOne({userId:to}).session(session);
        if(!payee){
            await session.abortTransaction();
            res.status(400).json({message:"Invalid Account number"});
            return
        }
        await Account.updateOne({ userId:req.userId},{$inc:{balance: -amount}}).session(session);
        await Account.updateOne({userId:to},{$inc:{balance:amount}}).session(session);
        await session.commitTransaction();
        res.json({message:"Transaction successful"});
    } catch (error) {
        await session.abortTransaction();
        console.log(error)
    }
    finally{
        session.endSession(); 
    }
})

module.exports = router