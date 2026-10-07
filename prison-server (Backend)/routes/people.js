import express from "express";
import Person from "../models/person.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();
router.use(requireAuth); // login wela inna officer/admin kenekta witharai

const DETAIL_FIELDS = {
  prisoner: [
    "caseNumber", "cellNumber", "offence", "offenceSi", "offenceTa",
    "admissionDate", "sentenceYears",
    "guardianName", "guardianNic", "guardianPhone", "guardianAddress",
  ],
  doctor: [
    "specialization", "licenseNumber",
    "emergencyContactName", "emergencyContactNic", "emergencyContactPhone", "emergencyContactAddress",
  ],
  visitor: [
    "visitingPrisoner", "relationship", "visitDate", "purpose",
    "emergencyContactName", "emergencyContactNic", "emergencyContactPhone", "emergencyContactAddress",
  ],
  staff: [
    "department", "jobTitle",
    "emergencyContactName", "emergencyContactNic", "emergencyContactPhone", "emergencyContactAddress",
  ],
};
const REQUIRED_DETAIL = { prisoner: "caseNumber", doctor: "licenseNumber" };
const NIC_RE = /^([0-9]{9}[VX]|[0-9]{12})$/;

function clean(type, body) {
  const { fullName, nic, phone, address, dateOfBirth, details } = body;
  if (typeof fullName !== "string" || !fullName.trim()) return { error: "Full name is required" };

  const data = { fullName: fullName.trim(), address: address || "" };

  if (nic) {
    const n = String(nic).trim().toUpperCase();
    if (!NIC_RE.test(n)) return { error: "Invalid NIC number" };
    data.nic = n;
  }
  if (phone) {
    if (!/^0[0-9]{9}$/.test(String(phone).trim())) return { error: "Phone must be 10 digits (e.g. 0771234567)" };
    data.phone = String(phone).trim();
  }
  if (dateOfBirth) {
    const d = new Date(dateOfBirth);
    if (isNaN(d) || d > new Date()) return { error: "Invalid birthday" };
    data.dateOfBirth = d;
  }

  data.details = {};
  for (const key of DETAIL_FIELDS[type]) {
    const v = details?.[key];
    if (v !== undefined && v !== "") data.details[key] = v;
  }
  const must = REQUIRED_DETAIL[type];
  if (must && !data.details[must]) return { error: `${must} is required for ${type}` };

  return { data };
}

const validType = (req, res, next) =>
  DETAIL_FIELDS[req.params.type] ? next() : res.status(400).json({ message: "Invalid record type" });

router.get("/:type", validType, async (req, res) => {
  try {
    const filter = { type: req.params.type };
    const q = (req.query.q || "").trim();
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ fullName: rx }, { nic: rx }];
    }
    res.json(await Person.find(filter).sort({ createdAt: -1 }));
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/:type", validType, async (req, res) => {
  try {
    const { data, error } = clean(req.params.type, req.body);
    if (error) return res.status(400).json({ message: error });
    const person = await Person.create({ ...data, type: req.params.type, createdBy: req.user._id });
    res.status(201).json(person);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:type/:id", validType, async (req, res) => {
  try {
    const { data, error } = clean(req.params.type, req.body);
    if (error) return res.status(400).json({ message: error });
    const person = await Person.findOneAndUpdate(
      { _id: req.params.id, type: req.params.type },
      data,
      { new: true }
    );
    if (!person) return res.status(404).json({ message: "Record not found" });
    res.json(person);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:type/:id", validType, async (req, res) => {
  try {
    const person = await Person.findOneAndDelete({ _id: req.params.id, type: req.params.type });
    if (!person) return res.status(404).json({ message: "Record not found" });
    res.json({ message: "Record deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;