import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error("❌ FATAL ERROR: MONGO_URI is not defined.");
  process.exit(1);
}

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

// --- 2. DB CONNECTION ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// --- 3. SCHEMAS ---

// User Schema
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String }, 
  password: { type: String, required: true },
  role: { type: String, default: 'Agent' }, 
  status: { type: String, default: 'Active' }, 
  bio: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", UserSchema);

// [NEW] Lead Schema
const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  source: { type: String, default: 'Website' }, // Website, Referral, Social Media
  status: { type: String, default: 'New' },     // New, Contacted, Qualified, Lost
  createdAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model("Lead", LeadSchema);

// Enquiry Schema
const EnquirySchema = new mongoose.Schema({
  name: String, email: String, phone: String, interest: String, message: String, date: { type: Date, default: Date.now },
});
const Enquiry = mongoose.model("Enquiry", EnquirySchema);

// Property Schema
const PropertySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Office' },
  tag: String,
  location: String,
  address: String,
  nearby: String,
  images: [String], 
  videos: [String], 
  imageUrl: String, 
  videoUrl: String,
  price: String, 
  description: String,
  details: mongoose.Schema.Types.Mixed,
  financials: mongoose.Schema.Types.Mixed,
  legal: mongoose.Schema.Types.Mixed,
  floors: [{ title: String, area: String, availability: String, image: String, notes: String }],
  createdAt: { type: Date, default: Date.now }
});
const Property = mongoose.model("Property", PropertySchema);

// --- 4. AUTH MIDDLEWARE ---
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token expired or invalid" });
    req.user = user;
    next();
  });
}

// --- 5. ROUTES ---

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ 
        $or: [{ username: username }, { email: username }] 
    });

    if (!user) return res.status(400).json({ error: "User not found" });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });
    
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, user: { name: user.name, role: user.role } });
  } catch (err) { res.status(500).json({ error: "Login failed" }); }
});

// =========================================================
// LEAD MANAGEMENT ROUTES (NEW)
// =========================================================

// GET Leads
app.get("/admin/leads", authenticateToken, async (req, res) => {
    try {
        const leads = await Lead.find().sort({ createdAt: -1 });
        res.json(leads);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

// CREATE Lead
app.post("/admin/leads", authenticateToken, async (req, res) => {
    try {
        const newLead = new Lead(req.body);
        await newLead.save();
        res.json({ message: "Lead created successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE Lead
app.put("/admin/leads/:id", authenticateToken, async (req, res) => {
    try {
        await Lead.findByIdAndUpdate(req.params.id, req.body);
        res.json({ message: "Lead updated" });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// DELETE Lead
app.delete("/admin/leads/:id", authenticateToken, async (req, res) => {
    try {
        await Lead.findByIdAndDelete(req.params.id);
        res.json({ message: "Lead deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// =========================================================
// USER MANAGEMENT ROUTES
// =========================================================

// GET Users
app.get("/admin/users", authenticateToken, async (req, res) => {
    try {
        const users = await User.find().select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

// CREATE User
app.post("/admin/users", authenticateToken, async (req, res) => {
    try {
        const { name, email, password, role, status, bio } = req.body;
        
        const existing = await User.findOne({ email });
        if(existing) return res.status(400).json({ error: "Email already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            username: email, 
            password: hashedPassword,
            role,
            status,
            bio
        });

        await newUser.save();
        res.json({ message: "User created successfully" });
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

// UPDATE User
app.put("/admin/users/:id", authenticateToken, async (req, res) => {
    try {
        const { password, ...updates } = req.body;
        if(password && password.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password, salt);
        }
        await User.findByIdAndUpdate(req.params.id, updates);
        res.json({ message: "User updated" });
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// DELETE User
app.delete("/admin/users/:id", authenticateToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "User deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// =========================================================
// PROPERTY ROUTES
// =========================================================

app.get("/api/properties", async (req, res) => {
    try {
        const properties = await Property.find().sort({ createdAt: -1 });
        res.json(properties);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});

app.post("/admin/properties", authenticateToken, async (req, res) => {
    try {
        const newProperty = new Property(req.body);
        await newProperty.save();
        res.json({ message: "Created successfully" });
    } catch (err) { 
        console.error("Create Error:", err.message);
        res.status(500).json({ error: "Create failed: " + err.message }); 
    }
});

app.put("/admin/properties/:id", authenticateToken, async (req, res) => {
    try {
        await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: "Updated successfully" });
    } catch (err) { 
        console.error("Update Error:", err.message);
        res.status(500).json({ error: "Update failed: " + err.message }); 
    }
});

app.delete("/admin/properties/:id", authenticateToken, async (req, res) => {
    try {
        await Property.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted successfully" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// Enquiries & Emails
app.get("/admin/enquiries", authenticateToken, async (req, res) => {
  try {
    const data = await Enquiry.find().sort({ date: -1 });
    res.json(data);
  } catch(e) { res.status(500).json({error: "Error fetching enquiries"}); }
});
app.post("/send-email", async (req, res) => {
  try {
      const newEnquiry = new Enquiry(req.body);
      await newEnquiry.save();
      res.json({ message: "Saved" });
  } catch(e) { res.status(500).json({error: "Error saving enquiry"}); }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));