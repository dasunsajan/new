import jwt from "jsonwebtoken";
import Staff from "../models/staff.js";

export const requireAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Not logged in" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Staff.findById(decoded.id || decoded._id || decoded.userId).select("-password");

    if (!user || !["admin", "officer"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired session" });
  }
};

export const requireAdmin = (req, res, next) =>
  req.user.role === "admin" ? next() : res.status(403).json({ message: "Admin only" });