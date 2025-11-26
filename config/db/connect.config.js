import mongoose from "mongoose";

export const connectMongoDB = async () => {
    try{
        await mongoose.connect('mongodb://127.0.0.1:27017/backend85635');
        console.log(`✅ Contectado a MongoDB de forma Exitosa.!!`)
    } catch(err){
        console.error(err);
        process.exit(1);
    }
}

export const connectAtlasMongoDB = async () => {
    try{
        await mongoose.connect('mongodb+srv://aleddistefano:RKFlB0qXvqjqQm8z@codehouse.cfacxsr.mongodb.net/');
        console.log(`✅ Contectado a MongoAtlasDB de forma Exitosa.!!`)
    } catch(err){
        console.error(err);
        process.exit(1);
    }
}