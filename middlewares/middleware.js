require('dotenv').config();
const jwt_secret = process.env.JWT_SECRET
const jwt = require("jsonwebtoken")

const authMiddleware = (req,res,next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(403).json({message:"Authorization error"})
    }

    const authToken = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(authToken, jwt_secret);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(403).json({message:"middleware error"});
    }
}

module.exports = {
    authMiddleware
}