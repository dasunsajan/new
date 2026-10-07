import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const authCfg = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const CARDS = [
  { type: "prisoner", labelKey: "tabPrisoners", icon: "🧍", color: "bg-blue-100 text-blue-700" },
  { type: "doctor", labelKey: "tabDoctors", icon: "🩺", color: "bg-green-100 text-green-700" },
  { type: "visitor", labelKey: "tabVisitors", icon: "🤝", color: "bg-amber-100 text-amber-700" },
  { type: "officer", labelKey: "tabOfficers", icon: "👮", color: "bg-purple-100 text-purple-700" },
  { type: "staff", labelKey: "tabStaff", icon: "🧑‍🔧", color: "bg-rose-100 text-rose-700" },
];

function DashboardHome() {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({});

  // translation key nathnam fallback text eka penwanawa
  const tr = (key, fallback) => {
    const v = t(key);
    return v && v !== key ? v : fallback;
  };

  useEffect(() => {
    CARDS.forEach(async (c) => {
      try {
        const res = await api.get(`/people/${c.type}`, authCfg());
        setCounts((prev) => ({ ...prev, [c.type]: res.data.length }));
      } catch {
        setCounts((prev) => ({ ...prev, [c.type]: "–" }));
      }
    });
  }, []);

  const total = Object.values(counts).reduce((a, v) => a + (typeof v === "number" ? v : 0), 0);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? tr("greetMorning", "Good morning")
    : hour < 18 ? tr("greetAfternoon", "Good afternoon")
    : tr("greetEvening", "Good evening");

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow p-5 mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">{greeting} 👋</h2>
        <div className="text-right">
          <div className="text-3xl font-bold text-slate-800">{total}</div>
          <div className="text-sm text-slate-500">{tr("totalRecords", "Total records")}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CARDS.map((c) => (
          <Link key={c.type} to={`/dashboard?type=${c.type}`}
            className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${c.color}`}>
              {c.icon}
            </div>
            <div className="text-2xl font-bold text-slate-800">{counts[c.type] ?? "…"}</div>
            <div className="text-sm text-slate-500">{t(c.labelKey)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DashboardHome;