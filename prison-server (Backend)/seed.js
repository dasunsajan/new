import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Staff from "./models/staff.js";

dotenv.config();

const createTestStaff = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("admin123", 10);

  await Staff.create({
    username: "admin",
    password: hashedPassword,
    fullName: "Prison Administrator",
    role: "admin",
  });

  console.log("Test staff account created -> username: admin, password: admin123");
  process.exit();
};

createTestStaff();