import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// --- CONFIGURATION ---
// Change these values to set your admin credentials
const NEW_ADMIN_USERNAME = "admin";
const NEW_ADMIN_PASSWORD = "password123"; 

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log('✅ Connected to MongoDB');

        // Check if user exists
        const existingUser = await User.findOne({ username: NEW_ADMIN_USERNAME });
        if (existingUser) {
            console.log(`⚠️ User "${NEW_ADMIN_USERNAME}" already exists.`);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(NEW_ADMIN_PASSWORD, 10);
        
        // Create user
        const newUser = new User({ 
            username: NEW_ADMIN_USERNAME, 
            password: hashedPassword 
        });

        await newUser.save();
        console.log(`🎉 Admin user "${NEW_ADMIN_USERNAME}" created successfully!`);
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err);
        process.exit(1);
    });