import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // bcrypt hash

    fullName: { type: String, required: true },
    nic: { type: String, unique: true, sparse: true },
    phone: String,
    email: String,

    role: { type: String, enum: ["admin", "officer"], default: "officer" },
    section: { type: String, default: "IT" },
    rank: String,
    badgeNumber: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);