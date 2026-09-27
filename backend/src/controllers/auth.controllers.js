const UserModel = require("../model/user.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

async function registerUser(req, res) {
    const {username , email , password , role} = req.body;
  const isUserExist = await UserModel.findOne({
    $or:[
        {email},
        {username}
    ]
  })
  if (isUserExist){
    return res.status(409).json({
        success:false,
        message:"User already exists"
    })
  } 
  const hash = await bcrypt.hash(password,10)
  const User = await UserModel.create({
    username,
    email,
    password:hash,
    role
  })

  const token = JWT.sign({
    id:User._id,
    role:User.role
  },process.env.JWT_SECRET)
  res.cookie("token",token) 
  res.status(201).json({
    success:true,
    message:"User registered successfully",
    user:{
        id:User._id,
        email:User.email,
        username:User.username,
        role:User.role
    }
  })
}
async function LoginUser(req, res) {
    const {email,password,username} = req.body;
    const user = await UserModel.findOne({
        $or:[{email},{username}]
    })
    if (!user){
        return res.status(404).json({
            success:false,
            message:"User not found"
        })
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if (!isMatch){
        return res.status(401).json({
            success:false,
            message:"Invalid credentials"
        })
    }
    const token = JWT.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET)
    res.cookie("token",token)
    res.status(200).json({
        success:true,
        message:"User logged in successfully",
        user:{
            id:user._id,
            email:user.email,
            username:user.username,
            role:user.role
        }
    })
    
}
module.exports = {registerUser}