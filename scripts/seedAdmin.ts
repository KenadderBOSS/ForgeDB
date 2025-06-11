const dbConnect = require("../src/lib/mongodb").default;
const User = require("../src/models/User").default;
const { hashPassword } = require("../src/lib/password");

async function seedAdmin() {
  try {
    await dbConnect();

    const adminEmail = "admin@forgedb.com";
    const adminPassword = "AdminPass123!"; // Change this in production

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    const adminUser = new User({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
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
