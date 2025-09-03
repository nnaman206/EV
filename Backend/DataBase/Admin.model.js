// In file: ./DataBase/Admin.model.js

import mongoose from 'mongoose';

// Schema for the object that represents a single booking
const bookingInfoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    slotNumber: { type: String, required: true }
}, { _id: false });

const slotSchema = new mongoose.Schema({
    time: {
        type: String,
        required: true
    },
    totalSlots: {
        type: Number,
        required: true
    },
    // ✅ RENAMED and SCHEMA CORRECTED
    bookedSlots: {
        type: [bookingInfoSchema],
        default: []
    }
});

const adminSchema = new mongoose.Schema({
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
        required: true,
    },
    address: {
        type: String,
        required: true
    },
    slotData: {
        type: [slotSchema],
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);