// server.js
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/Ev_DataBase", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDb;



