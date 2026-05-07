import mongoose from 'mongoose';
import express from 'express'
import dotenv from 'dotenv';
import connectDB from './bd/db.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
connectDB();
app.get("/",(req,res) =>{
    res.send("Hello world");
})

app.listen(PORT,()=>{
    console.log("Server is connected on PORT : "+PORT);
})


