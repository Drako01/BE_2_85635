import mongoose from "mongoose";
import dotenv from 'dotenv';
dotenv.config();

const baseMongooseOpts = {
    serverSelectionTimeoutMS: 10000,
}

export const connectMongoDB = async () => {
    try{
        const url = process.env.MONGO_URL;
        await mongoose.connect(url, baseMongooseOpts);
        console.log(`✅ Contectado a MongoDB de forma Exitosa.!!`)
    } catch(err){
        console.error(err);
        process.exit(1);
    }
}

export const connectAtlasMongoDB = async () => {
    try{
        const url = process.env.MONGO_ATLAS_URL;
        await mongoose.connect(url, baseMongooseOpts);
        console.log(`✅ Contectado a MongoAtlasDB de forma Exitosa.!!`)
    } catch(err){
        console.error(err);
        process.exit(1);
    }
}

export const connectAuto = async () => {
    const target = (process.env.MONGO_TARGET || 'LOCAL').toUpperCase();
    if(target === 'ATLAS') return connectAtlasMongoDB();
    return connectMongoDB();
}