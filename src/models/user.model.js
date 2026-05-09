import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {
        type : String,
        require : true
    },
    phoneNumber : {
        type : Number,
    },
    email : {
        type : String,
        require : true,
    },
    password : {
        type : String,
        require : true,
    },
})