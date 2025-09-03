// In file: ./DataBase/User.model.js

import mongoose from "mongoose";

// A schema for the single, active booking a user can have
const currentBookingSchema = new mongoose.Schema({
    stationName: { type: String, required: true },
    stationAddress: { type: String, required: true },
    time: { type: String, required: true },
    slotNumber: { type: String, required: true },
    stationId: { type: mongoose.Schema.Types.ObjectId, required: true },
    // This bookingId is generated automatically by mongoose (_id)
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    // ✅ ADDED THIS FIELD
    currentBooking: {
        type: currentBookingSchema,
        default: null
    }
}, { timestamps: true });

export default mongoose.model("User", userSchema);