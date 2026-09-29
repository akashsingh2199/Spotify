const musicModel = require("../model/music.model");
const jwt = require("jsonwebtoken");

async function uploadMusic(req,res) {
    const token = req.cookies.token;
    if (!token){
        return res.status(401).json({
            success:false,
            message:"Unauthorized"
        })
    }
    try {
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET)
        if (decodedToken.role !== "artist"){
            return res.status(403).json({
                success:false,
                message:"Unauthorized"
            })
        }
    } catch (error) {
        return res.status(401).json({
            success:false,
            message:"Internal server error"
        })
    }
    const {title} = req.body;
    const file = req.file
    
}
module.exports = {uploadMusic}