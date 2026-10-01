const mongoose = require("mongoose");


const musicSchema = new mongoose.Schema({
    uri:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    artist:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    //likes count 
    likes:{
        type:Number,
        default:0
    },
    //listens count
    listens:{
        type:Number,
        default:0
    },
    //dislikes count
    dislikes:{
        type:Number,
        default:0
    }
    
    
})
const musicModel = mongoose.model("music",musicSchema)
module.exports = musicModel