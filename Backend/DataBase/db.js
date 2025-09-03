// In file: ./DataBase/db.js

import mongoose from "mongoose";

// Create and export a named function called connectDB
export const connectDB = async () => {
    try {
        // Use await to wait for the connection to complete
        await mongoose.connect('mongodb://127.0.0.1:27017/HElloEV', {
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ MongoDB connection error:', err);
        // Exit the process with an error code if the connection fails
        process.exit(1);
    }
};