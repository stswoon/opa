import mongoose from "mongoose";

//https://github.com/railwayapp-templates/expressjs-mongoose
//https://docs.railway.app/databases/mongodb
//todo docs how to add plugin and env variale
//todo local mongo
export const mongoConnect = async () => {
    //if (true) return;
    if (!process.env.MONGO_URL) {
        throw new Error("Please add the MONGO_URL environment variable");
    }
    console.log(`Connecting to ${process.env.MONGO_URL}`);
    try {
        await mongoose.connect(process.env.MONGO_URL);
    } catch (e) {
        console.error("Failed to connect to db", e)
    }
}
