import mongoose from "mongoose";

const personSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["prisoner", "doctor", "visitor", "staff"], required: true },
    fullName: { type: String, required: true },
    nic: String,
    phone: String,
    address: String,
    dateOfBirth: Date,
    details: { type: mongoose.Schema.Types.Mixed, default: {} }, // type eka anuwa wenas wenawa
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

export default mongoose.model("Person", personSchema);