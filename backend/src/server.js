import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { exchangeCodeForToken, sendMail } from "./smtpClient.js";

dotenv.config();

// --- CONFIGURATION ---
const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error("❌ FATAL ERROR: MONGO_URI is not defined in .env file.");
  process.exit(1);
}

const app = express();

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "5mb" }));
app.use(express.json({ limit: "5mb" }));

// --- DATABASE ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch((err) => console.error("❌ DB Error:", err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", UserSchema);

const EnquirySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  interest: String,
  message: String,
  date: { type: Date, default: Date.now },
});
const Enquiry = mongoose.model("Enquiry", EnquirySchema);

// --- NEW: PROPERTY SCHEMA ---
const PropertySchema = new mongoose.Schema({
    title: String,
    price: String,
    location: String,
    imageUrl: String,
    description: String,
    tag: String, // e.g., "For Lease" or "For Sale"
    date: { type: Date, default: Date.now }
});
const Property = mongoose.model("Property", PropertySchema);


// --- MIDDLEWARE ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// --- ROUTES ---

app.get("/", (req, res) => res.send("ARKA Backend is Running!"));

// Login
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// --- ENQUIRY ROUTES ---
app.post("/send-email", async (req, res) => {
  const { name, email, phone, interest, message, to, subject } = req.body;
  if (!name || !email || !phone) return res.status(400).json({ error: "Missing fields" });

  let dbSaved = false;
  try {
    const newEnquiry = new Enquiry({ name, email, phone, interest, message });
    await newEnquiry.save();
    dbSaved = true;
  } catch (dbError) { console.error("DB Save Error:", dbError); }

  try {
    const recipient = to || process.env.SENDER_EMAIL;
    const emailSubject = subject || `Enquiry: ${interest}`;
    const htmlBody = `<h3>New Enquiry</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Phone:</strong> ${phone}</p><p><strong>Interest:</strong> ${interest}</p><p><strong>Message:</strong><br>${message}</p>`;
    
    await sendMail(recipient, emailSubject, htmlBody);
    res.json({ message: "Enquiry processed" });
  } catch (emailError) {
    if (dbSaved) return res.status(200).json({ message: "Saved to DB, email failed" });
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/admin/send-reply", authenticateToken, async (req, res) => {
    const { to, subject, message } = req.body;
    try {
        await sendMail(to, subject, message);
        res.json({ message: "Reply sent" });
    } catch (err) { res.status(500).json({ error: "Failed to send" }); }
});

app.get("/admin/enquiries", authenticateToken, async (req, res) => {
  const enquiries = await Enquiry.find().sort({ date: -1 });
  res.json(enquiries);
});

app.delete("/admin/enquiries/:id", authenticateToken, async (req, res) => {
  await Enquiry.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});


// --- NEW: PROPERTY ROUTES ---

// 1. Get All Properties (Public - for properties.html)
app.get("/api/properties", async (req, res) => {
    try {
        const properties = await Property.find().sort({ date: -1 });
        res.json(properties);
    } catch (err) { res.status(500).json({ error: "Failed to fetch properties" }); }
});

// 2. Add Property (Protected - for Dashboard)
app.post("/admin/properties", authenticateToken, async (req, res) => {
    try {
        const newProperty = new Property(req.body);
        await newProperty.save();
        res.json({ message: "Property added successfully" });
    } catch (err) { res.status(500).json({ error: "Failed to add property" }); }
});

// 3. Delete Property (Protected - for Dashboard)
app.delete("/admin/properties/:id", authenticateToken, async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: "Property deleted" });
    } catch (err) { res.status(500).json({ error: "Failed to delete" }); }
});


// Auth Helpers
app.get("/auth/login", (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.CLIENT_ID,
    response_type: "code",
    redirect_uri: process.env.REDIRECT_URI,
    response_mode: "query",
    scope: "offline_access openid https://outlook.office.com/SMTP.Send",
    prompt: "consent",
  });
  res.redirect(`https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`);
});

app.get("/auth/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code");
  try {
    await exchangeCodeForToken(code);
    res.send(`<h3>Success!</h3><p>Backend authorized. You can close this window.</p>`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Auth failed.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});