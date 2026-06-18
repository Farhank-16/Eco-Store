import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to database");

    const email = "admin@example.com";
    const passwordText = "Password123!";
    const hashedPassword = await bcrypt.hash(passwordText, 12);

    let user = await User.findOne({ email });
    if (user) {
      user.role = "admin";
      user.password = hashedPassword;
      await user.save();
      console.log("Updated existing admin user: admin@example.com with password: Password123!");
    } else {
      user = new User({
        name: "Admin User",
        email,
        password: hashedPassword,
        role: "admin"
      });
      await user.save();
      console.log("Created new admin user: admin@example.com with password: Password123!");
    }
  } catch (error) {
    console.error("Error updating admin user:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from database");
  }
}

run();
