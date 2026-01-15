import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/db.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const { name, email, password } = {
      name: process.argv[2] || "Admin",
      email: process.argv[3] || "admin@example.com",
      password: process.argv[4] || "admin123",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email, role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists with this email!");
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name,
      email,
      password,
      role: "admin",
      isActive: true,
      isApproved: true,
      isBlocked: false,
    });

    console.log("✅ Admin user created successfully!");
    console.log(`Email: ${admin.email}`);
    console.log(`Name: ${admin.name}`);
    console.log("\nYou can now login at /admin-login");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();

