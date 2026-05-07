import mongoose from 'mongoose'
import { DB_Name } from '../constants.js';

const connectDB = async() => {
       try{
        mongoose.connection.on("connected",()=>
            console.log("database connected")
        );
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_Name}`)
        console.log(`MONGODB is connected !! HOST : ${connectionInstance.connection.host}`);
       }
       catch(error){
        console.log("ERROR :", error);
        process.exit(1)
       }

}

export default connectDB