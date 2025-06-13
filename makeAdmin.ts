// scripts/makeAdmin.ts
import dotenv from "dotenv";
dotenv.config();
import dbConnect from "./src/lib/mongodb";
import User from "./src/models/User";
import { hashPassword } from "./src/lib/password";


async function seedAdmin() {
  try {
    await dbConnect();

    const adminEmail = "admin@forgedb.com";
    const adminPassword = "AdminPass123!"; // Cambia en producción

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const hashedPassword = await hashPassword(adminPassword);
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
