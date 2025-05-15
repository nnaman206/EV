import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import Admin from "./admin.js";
import User from "./user.js";
import connectDb from "./server.js";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

connectDb(); // ✅ Connect to MongoDB

// Admin Registration
app.post("/api/admin/register", async (req, res) => {
  try {
    const { name, email, password, address, slotData } = req.body;
    if (!name || !email || !password || !address || !slotData) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Admin.findOne({ email });
    if (exists) return res.status(409).json({ message: "Admin already exists" });

    const newAdmin = new Admin({ name, email, password, address, slotData });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// User Registration
app.post("/api/user/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "User already exists" });

    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email, password });
  if (!admin) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "Admin login successful", user: admin });
});

// User Login
app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  res.json({ message: "User login successful", user });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
