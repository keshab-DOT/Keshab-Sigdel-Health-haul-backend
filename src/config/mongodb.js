import mongoose from "mongoose";
import config from "./config.js"; 

export const connectDB = async () => {
  if (!config.mongoDBUrl) {
    throw new Error("MongoDB URL is not defined. Check your .env file.");
  }

  try {
    await mongoose.connect(config.mongoDBUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
};
