import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import cors from 'cors';
import session from 'express-session';
import FileStoreFactory from 'session-file-store';
import { connectDB } from './DataBase/db.js';
import Admin from "./DataBase/Admin.model.js";
import User from "./DataBase/User.model.js";

const FileStore = FileStoreFactory(session);

// Initialize database connection();
connectDB();

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// --- Session Middleware Setup ---
app.use(session({
    store: new FileStore({
        path: './sessions',
        ttl: 10 * 60, // Session time to live: 10 minutes
        retries: 5,
        logFn: () => {}
    }),
    secret: 'a_very_secret_key_that_is_long_and_random',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 10, // 10 minutes
        secure: false, // Set to true if using HTTPS in production
        httpOnly: true
    }
}));

// --- Admin Routes ---

app.post("/api/admin/register", async (req, res) => {
    try {
        let { name, email, password, address, slotData } = req.body;

        if (!name || !email || !password || !address || !slotData) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        if (!Array.isArray(slotData) || slotData.length === 0) {
            return res.status(400).json({ message: "slotData must be a non-empty array!" });
        }

        for (let slot of slotData) {
            if (!slot.time || typeof slot.totalSlots !== 'number') {
                return res.status(400).json({ message: "Each slot must have 'time' and 'totalSlots' (number)" });
            }
        }

        let existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(409).json({ message: "Admin with this email already exists!" });
        }

        let hashedPassword = await bcrypt.hash(password, 10);
        let adminCreated = await Admin.create({
            name,
            email,
            password: hashedPassword,
            address,
            slotData,
        });

        res.status(201).json({
            message: "Admin created successfully!",
            admin: {
                id: adminCreated._id,
                name: adminCreated.name,
                email: adminCreated.email,
                address: adminCreated.address,
                slotData: adminCreated.slotData
            }
        });
    } catch (error) {
        console.error('❌ Error creating admin:', error.message, error.stack);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


app.post("/api/admin/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required!" });
        }
        const existingAdmin = await Admin.findOne({ email });
        if (!existingAdmin) {
            return res.status(404).json({ message: "Admin with this email does not exist! Please Register" });
        }
        const isPasswordValid = await bcrypt.compare(password, existingAdmin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }
        
        req.session.admin = {
            _id: existingAdmin._id,
            name: existingAdmin.name,
            email: existingAdmin.email,
        };

        console.log(`Admin session created for: ${existingAdmin.name}`);
        res.status(200).json({
            message: "Login successful!",
            admin: existingAdmin
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

app.get("/api/admin/session", (req, res) => {
    if (req.session.admin) {
        res.status(200).json({ admin: req.session.admin });
    } else {
        res.status(401).json({ message: "No active admin session." });
    }
});

app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: "Could not log out." });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully." });
    });
});


// --- User Routes ---
app.post("/api/user/register", async (req, res) => {
    try {
        let { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User with this email already exists!" });
        }

        let hashedPassword = await bcrypt.hash(password, 10);
        let userCreated = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.status(201).json({
            message: "User registered successfully!",
            user: {
                id: userCreated._id,
                name: userCreated.name,
                email: userCreated.email
            }
        });
    } catch (error) {
        console.error('❌ Error creating user:', error);
        res.status(500).json({ message: "Server error, please try again later." });
    }
});

app.post("/api/user/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            console.log('Email or password missing in request body');
            return res.status(400).json({ message: "Email and password are required!" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            console.log(`No user found with email: ${email}`);
            return res.status(404).json({ message: "User with this email does not exist! Please Register" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password!" });
        }
        
        req.session.user = {
            id: existingUser._id,
            name: existingUser.name,
            email: existingUser.email
        };

        console.log(`Hello User, ${existingUser.name}`);
        res.status(200).json({
            message: "Login successful!",
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email,
                currentBooking: existingUser.currentBooking
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login." });
    }
});

app.get("/api/user/details", async (req, res) => {
    if (req.session.user) {
        try {
            const user = await User.findById(req.session.user.id);
            if (user) {
                res.status(200).json({ user });
            } else {
                res.status(404).json({ message: "User not found." });
            }
        } catch (error) {
            console.error("Error fetching user details from database:", error);
            res.status(500).json({ message: "Server error." });
        }
    } else {
        res.status(401).json({ message: "Unauthorized. Please log in." });
    }
});

app.post("/api/user/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).json({ message: "Could not log out." });
        }
        res.status(200).json({ message: "Logged out successfully." });
    });
});


// --- General & Slot Management Routes ---

app.put("/api/user/update/:userId", async (req, res) => {
    const { userId } = req.params;
    const { stationName, stationAddress, time, slotNumber, stationId } = req.body;

    if (!req.session.user || req.session.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized action." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        
        user.currentBooking = { stationName, stationAddress, time, slotNumber, stationId };
        await user.save();

        res.status(200).json({ message: "Booking updated successfully", bookingId: user.currentBooking._id });

    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Error updating booking", error: error.message });
    }
});

app.put("/api/admin/update/slot/:stationId", async (req, res) => {
    const { stationId } = req.params;
    const { slotId, userId, userName, slotNumber } = req.body;
    
    if (!req.session.user || req.session.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized action." });
    }
    
    if (!slotId || !userId || !userName || !slotNumber) {
        return res.status(400).json({ message: "Missing required fields for slot update." });
    }

    try {
        const adminUpdate = await Admin.updateOne(
            { _id: stationId, "slotData._id": slotId },
            {
                $push: {
                    "slotData.$.bookedSlots": { userId, userName, slotNumber }
                }
            }
        );

        if (adminUpdate.matchedCount === 0) {
            return res.status(404).json({ message: "Station or slot not found" });
        }

        res.status(200).json({ message: "Booking updated successfully", adminUpdate });
    } catch (error) {
        console.error("Error updating booking:", error);
        res.status(500).json({ message: "Error updating booking", error: error.message });
    }
});


app.post('/api/admin/slot/add', async (req, res) => {
    if (!req.session.admin || req.session.admin._id !== req.body.adminId) {
        return res.status(401).json({ message: "Unauthorized: You must be logged in as an admin." });
    }
    const { time, totalSlots, adminId } = req.body;

    if (!adminId || !time || totalSlots === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (isNaN(parseInt(totalSlots))) {
        return res.status(400).json({ message: "totalSlots must be a number" });
    }

    try {
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            {
                $push: {
                    slotData: {
                        time: time,
                        totalSlots: parseInt(totalSlots)
                    }
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedAdmin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const newSlot = updatedAdmin.slotData[updatedAdmin.slotData.length - 1];
        res.status(201).json({
            message: "New slot added successfully",
            newSlot: newSlot
        });
    } catch (error) {
        console.error("Error adding new slot:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.put('/api/admin/slot/update', async (req, res) => {
    const { adminId, slotId, time, totalSlots } = req.body;

    if (!req.session.admin || req.session.admin._id !== adminId) {
        return res.status(401).json({ message: "Unauthorized action." });
    }

    if (!slotId || !time || totalSlots === undefined) {
        return res.status(400).json({ message: "Missing required fields for slot update." });
    }

    try {
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found." });
        }

        const slot = admin.slotData.id(slotId);
        if (!slot) {
            return res.status(404).json({ message: "Slot not found." });
        }

        slot.time = time;
        slot.totalSlots = parseInt(totalSlots);
        await admin.save();

        res.status(200).json({ message: "Slot updated successfully", updatedSlot: slot });
    } catch (error) {
        console.error("Error updating slot:", error);
        res.status(500).json({ message: "Server error while updating slot." });
    }
});


app.get("/api/admins/station/:id", async (req, res) => {
    try {
        const station = await Admin.findById(req.params.id);
        if (!station) {
            return res.status(404).json({ error: "Station not found" });
        }
        res.json(station);
    } catch (err) {
        console.error("Error fetching station details by ID:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/admins/address", async (req, res) => {
    const { address } = req.query;

    if (!address) {
        return res.status(400).json({ message: "City or address is required!" });
    }

    try {
        const stationsDetails = await Admin.find({
            address: { $regex: address, $options: "i" }
        });

        if (!stationsDetails.length) {
            return res.status(200).json({
                message: "No stations found in this city/address!",
                addresses: []
            });
        }

        res.status(200).json({
            message: "Stations found!",
            addresses: stationsDetails
        });
    } catch (error) {
        console.error("Error fetching stations by address:", error);
        res.status(500).json({ message: "Server error while fetching stations." });
    }
});

app.delete("/api/user/booking/:userId/:bookingId", async (req, res) => {
    const { userId, bookingId } = req.params;
    
    if (!req.session.user || req.session.user.id !== userId) {
        return res.status(401).json({ message: "Unauthorized action." });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        if (!user.currentBooking || user.currentBooking._id.toString() !== bookingId) {
            return res.status(404).json({ message: "Booking not found." });
        }

        user.currentBooking = null;
        await user.save();
        
        res.status(200).json({ message: "Booking successfully deleted." });

    } catch (error) {
        console.error("Error deleting booking:", error);
        res.status(500).json({ message: "Server error while deleting booking." });
    }
});

app.put('/api/admin/update/slot/free/:stationId', async (req, res) => {
    const { stationId } = req.params;
    const { slotNumber, time } = req.body; 
    
    if (!stationId || !slotNumber || !time) {
        return res.status(400).json({ error: 'Missing required fields: stationId, slotNumber, or time.' });
    }
    
    try {
        const updateResult = await Admin.updateOne(
            {
                _id: stationId,
                "slotData.time": time
            },
            {
                $pull: {
                    "slotData.$.bookedSlots": { slotNumber: slotNumber }
                }
            }
        );

        if (updateResult.matchedCount === 0) {
            return res.status(404).json({ error: 'Admin station or slot time not found.' });
        }
        if (updateResult.modifiedCount === 0) {
            return res.status(404).json({ error: 'Booked slot not found to be freed.' });
        }

        res.status(200).json({ message: 'Slot freed successfully.' });
    } catch (error) {
        console.error('Error freeing admin slot:', error);
        res.status(500).json({ error: 'Failed to free slot.', details: error.message });
    }
});


app.get('/api/admin/:adminId/booked-users', async (req, res) => {
    const { adminId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return res.status(400).json({ message: "Invalid admin ID format" });
    }
    if (!req.session.admin || req.session.admin._id !== adminId) {
        return res.status(401).json({ message: "Unauthorized action." });
    }

    try {
        const bookedUsers = await User.find(
            { 'currentBooking.stationId': adminId },
            'name email currentBooking'
        );
        
        const formattedUsers = bookedUsers.map(user => ({
            _id: user._id,
            name: user.name,
            email: user.email,
            bookedSlotTime: user.currentBooking.time 
        }));

        res.status(200).json({ users: formattedUsers });
    } catch (error) {
        console.error("Error fetching booked users:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.delete('/api/admin/booking/remove', async (req, res) => {
    const { userId, adminId } = req.body;

    if (!req.session.admin || req.session.admin._id !== adminId) {
        return res.status(401).json({ message: "Unauthorized action." });
    }

    try {
        const user = await User.findById(userId);
        if (!user || !user.currentBooking || user.currentBooking.stationId.toString() !== adminId) {
            return res.status(404).json({ message: "Booking for this user not found at your station." });
        }

        const admin = await Admin.findById(adminId);
        const slotTime = user.currentBooking.time;
        
        const slot = admin.slotData.find(s => s.time === slotTime);
        if (slot) {
            slot.bookedSlots = slot.bookedSlots.filter(b => b.userId.toString() !== userId);
            await admin.save();
        }

        user.currentBooking = null;
        await user.save();

        res.status(200).json({ message: "Booking removed successfully." });

    } catch (error) {
        console.error("Error removing booking by admin:", error);
        res.status(500).json({ message: "Server error while removing booking." });
    }
});


// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

