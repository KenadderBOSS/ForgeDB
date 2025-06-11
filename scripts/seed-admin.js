require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://mongodb:27017/forgedb';

async function seedAdmin() {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Using URI:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@')); // Hide credentials
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB');

    const adminEmail = "admin@forgedb.com";
    const adminPassword = "AdminPass123!"; // Change this in production

    // Define User Schema
    const UserSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['user', 'admin'], default: 'user' },
      createdAt: { type: Date, default: Date.now },
    });

    // Get User model (or create if it doesn't exist)
    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists");
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    // Create admin user
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedAdmin();
