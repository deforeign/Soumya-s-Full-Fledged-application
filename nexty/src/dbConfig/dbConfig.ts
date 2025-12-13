import mongoose from "mongoose";

export async function connect() {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is not defined");
        }

        await mongoose.connect(process.env.MONGO_URL);
        console.log("MongoDB database connected successfully");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
            process.exit(1);
        });

    } catch (error) {
        console.error("Error while connecting to MongoDB:", error);
        process.exit(1);
    }
}
