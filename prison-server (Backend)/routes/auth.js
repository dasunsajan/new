import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import Staff from "../models/staff.js";
import Invite from "../models/invite.js";
import peopleRoutes from "./people.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// ---------------- LOGIN (7. c: role check eka methana) ----------------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
      return res.status(400).json({ message: "Please enter username and password" });
    }

    const user = await Staff.findOne({ username: username.trim() });
    if (!user) return res.status(401).json({ message: "Invalid username or password" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid username or password" });

    // (c) admin saha officers witharai login wenna puluwan
    if (!["admin", "officer"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied. IT section officers only." });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "8h" });

    res.json({
      token,
      user: { id: user._id, fullName: user.fullName, username: user.username, role: user.role },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- (b) PEOPLE routes ----------------
router.use("/people", peopleRoutes);

const hashCode = (c) => crypto.createHash("sha256").update(c).digest("hex");

// ---------------- (b) ADMIN: invite code ----------------
router.post("/admin/invites", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { badgeNumber, fullName } = req.body;
    if (!badgeNumber?.trim() || !fullName?.trim()) {
      return res.status(400).json({ message: "Badge number and full name are required" });
    }
    const bn = badgeNumber.trim();

    if (await Staff.findOne({ badgeNumber: bn })) {
      return res.status(409).json({ message: "This badge number already has an account" });
    }

    await Invite.deleteMany({ badgeNumber: bn, used: false });
    const code = crypto.randomBytes(6).toString("hex").toUpperCase();
    await Invite.create({
      badgeNumber: bn,
      fullName: fullName.trim(),
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      createdBy: req.user._id,
    });

    res.status(201).json({ code, expiresInHours: 48 });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

// ---------------- (b) REGISTER ----------------
router.post("/register", async (req, res) => {
  let claimed = null;
  try {
    const { fullName, nic, phone, email, rank, badgeNumber, inviteCode, username, password } = req.body;

    const required = [fullName, nic, phone, rank, badgeNumber, inviteCode, username, password];
    if (required.some((v) => typeof v !== "string" || v.trim() === "")) {
      return res.status(400).json({ message: "Please fill in all required fields" });
    }

    const cleanUsername = username.trim();
    const cleanNic = nic.trim().toUpperCase();
    const cleanBadge = badgeNumber.trim();

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (!/^([0-9]{9}[VX]|[0-9]{12})$/.test(cleanNic)) {
      return res.status(400).json({ message: "Invalid NIC number" });
    }
    if (!/^0[0-9]{9}$/.test(phone.trim())) {
      return res.status(400).json({ message: "Phone number must be 10 digits (e.g. 0771234567)" });
    }

    const existing = await Staff.findOne({
      $or: [{ username: cleanUsername }, { nic: cleanNic }, { badgeNumber: cleanBadge }],
    });
    if (existing) {
      return res.status(409).json({ message: "Username, NIC or badge number is already registered" });
    }

    claimed = await Invite.findOneAndUpdate(
      {
        badgeNumber: cleanBadge,
        codeHash: hashCode(inviteCode.trim().toUpperCase()),
        used: false,
        expiresAt: { $gt: new Date() },
      },
      { used: true }
    );
    if (!claimed) {
      return res.status(403).json({ message: "Invalid or expired invite code" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await Staff.create({
      username: cleanUsername,
      password: hashedPassword,
      fullName: fullName.trim(),
      nic: cleanNic,
      phone: phone.trim(),
      email,
      rank: rank.trim(),
      badgeNumber: cleanBadge,
      role: "officer",
      section: "IT",
    });

    res.status(201).json({ message: "Account created successfully" });
  } catch (error) {
    if (claimed) await Invite.findByIdAndUpdate(claimed._id, { used: false });
    if (error.code === 11000) {
      return res.status(409).json({ message: "Username, NIC or badge number is already registered" });
    }
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;