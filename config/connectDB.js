import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const connectToDB = async (url) => {
    return await mongoose.connect(url);
}


export {
    connectToDB
}
