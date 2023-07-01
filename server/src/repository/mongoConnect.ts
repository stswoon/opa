import mongoose from "mongoose";
import {config} from "../utils";
import mongoUnit from "mongo-unit";

//https://www.npmjs.com/package/serverless-mongodb-local
const startLocalMongo = async () => {
    console.log("Local Mongo starting...");
    try {
        await mongoUnit.start();
        console.log("Local Mongo is started, url = ", mongoUnit.getUrl())
        process.env.MONGO_URL = mongoUnit.getUrl()
    } catch (e) {
        console.error("Local Mongo start error: ", e);
        throw e;
    }
    // return mongoUnit.stop()
}

//https://www.npmjs.com/package/mongodb
export const mongoConnect = async () => {
    try {
        if (config.isLocalMongo()) {
            await startLocalMongo();
        }
        console.log(`Connecting to mongoUrl = ${process.env.MONGO_URL}`);
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is empty, please add the MONGO_URL environment variable");
        }
        await mongoose.connect(process.env.MONGO_URL);
    } catch (e) {
        console.error("Failed to connect to db", e)
        throw e;
    }
}
