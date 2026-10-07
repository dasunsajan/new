import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const inputClass =
  "w-full border border-slate-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";

const SECTIONS = [
  { title: "Officer Verification", fields: [
    { name: "badgeNumber", label: "Badge Number" },
    { name: "inviteCode", label: "Invite Code (from Admin)" },
  ]},
  { title: "Personal Details", fields: [
    { name: "fullName", label: "Full Name" },
    { name: "rank", label: "Rank" },
    { name: "nic", label: "NIC Number", pattern: "([0-9]{9}[vVxX]|[0-9]{12})", title: "e.g. 123456789V or 200012345678" },
    { name: "phone", label: "Phone Number", pattern: "0[0-9]{9}", title: "10 digits, e.g. 0771234567" },
    { name: "email", label: "Email (optional)", type: "email", optional: true, span: true },
  ]},
  { title: "Login Details", fields: [
    { name: "username", label: "Username", span: true },
    { name: "password", label: "Password", type: "password", minLength: 6 },
    { name: "confirmPassword", label: "Confirm Password", type: "password", minLength: 6 },
  ]},
];

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    badgeNumber: "", inviteCode: "", fullName: "", rank: "", nic: "", phone: "",
    email: "", username: "", password: "", confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form };
      delete payload.confirmPassword;
      await api.post("/register", payload);
      alert("Account created successfully! Please login.");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 py-10">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏛️</div>
          <h1 className="text-2xl font-bold text-slate-800">Officer Registration</h1>
          <p className="text-slate-500 text-sm mt-1">Prison of Welikada · IT Section only</p>
          <p className="text-slate-400 text-xs mt-2">
            You need a one-time invite code from the system administrator.
          </p>
        </div>

        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-semibold text-slate-700 mt-4 mb-2">{s.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              {s.fields.map((f) => (
                <div key={f.name} className={`mb-3 ${f.span ? "md:col-span-2" : ""}`}>
                  <label className="block text-sm text-slate-600 mb-1">{f.label}</label>
                  <input
                    name={f.name}
                    type={f.type || "text"}
                    value={form[f.name]}
                    onChange={handleChange}
                    required={!f.optional}
                    pattern={f.pattern}
                    title={f.title}
                    minLength={f.minLength}
                    className={inputClass}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {error && <p className="text-red-500 text-sm my-3 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-medium transition disabled:opacity-50 mt-2"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{" "}
          <Link to="/" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;