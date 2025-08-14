import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try {
        const connection_instance = await mongoose.connect(
            `${process.env.MONGO_URI}/${DB_NAME}`,//Getting it from the mongo dob atlas compas and adding the database name

        )

        console.log(`MongoDB connected : ${connection_instance.connection.host}`);

    } catch (error) {
        console.log("mongoDb connection error :    ", error);
        process.exit(1);
    }
}



export default connectDB
