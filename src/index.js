import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { app } from './app.js';
import connectDB from './bd/db.js';
dotenv.config();


const PORT = process.env.PORT || 8080;
connectDB()
.then(() =>{
    app.listen(PORT,()=> {
        console.log(`Server is running on PORT`,PORT);
    })
})
.catch((err)=>{
    console.log("ERROR MONGODB connection failed:",err)
})



