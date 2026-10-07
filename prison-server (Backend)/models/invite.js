import mongoose from "mongoose";

const inviteSchema = new mongoose.Schema(
  {
    badgeNumber: { type: String, required: true },
    fullName: String,
    codeHash: { type: String, required: true }, // code eka plain text widiyata save karanne na
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

export default mongoose.model("Invite", inviteSchema);