import mongoose from "mongoose";

export const mongoConnect = async () => {
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
