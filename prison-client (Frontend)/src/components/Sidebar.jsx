import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { getPhoto } from "../utils/profile";

const ITEMS = [
  { to: "/dashboard", type: null, icon: "🏠", labelKey: "sidebarDashboard" },
  { to: "/dashboard?type=prisoner", type: "prisoner", icon: "🧍", labelKey: "tabPrisoners" },
  { to: "/dashboard?type=doctor", type: "doctor", icon: "🩺", labelKey: "tabDoctors" },
  { to: "/dashboard?type=visitor", type: "visitor", icon: "🤝", labelKey: "tabVisitors" },
  { to: "/dashboard?type=officer", type: "officer", icon: "👮", labelKey: "tabOfficers" },
  { to: "/dashboard?type=staff", type: "staff", icon: "🧑‍💼", labelKey: "tabStaff" },
];

export default function Sidebar() {
  const { t } = useLanguage();
  const { search, pathname } = useLocation();
  const current = new URLSearchParams(search).get("type");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [photo, setPhoto] = useState(getPhoto(user));

  useEffect(() => {
    const update = () => setPhoto(getPhoto(user));
    window.addEventListener("profile-updated", update);
    return () => window.removeEventListener("profile-updated", update);
  }, []);

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 text-xl font-bold border-b border-slate-800">🏛️ Prison MS</div>

      {/* Profile card */}
      <Link
        to="/profile"
        className={`mx-3 mt-3 flex items-center gap-3 p-3 rounded-xl border border-slate-800 ${
          pathname === "/profile" ? "bg-slate-800" : "hover:bg-slate-800"
        }`}
      >
        {photo ? (
          <img src={photo} alt="" className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-500" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold ring-2 ring-blue-400">
            {(user?.fullName || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <div className="font-semibold truncate">{user?.fullName}</div>
          <div className="text-xs text-slate-400 capitalize">{user?.role}</div>
        </div>
      </Link>

      <nav className="flex-1 p-3 space-y-1">
        {ITEMS.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
              pathname === "/dashboard" && current === it.type
                ? "bg-blue-600"
                : "hover:bg-slate-800 text-slate-300"
            }`}
          >
            <span>{it.icon}</span>
            <span>{t(it.labelKey)}</span>
          </Link>
        ))}
      </nav>

      <Link
        to="/settings"
        className={`mx-3 mb-2 flex items-center gap-3 px-4 py-3 rounded-lg ${
          pathname === "/settings" ? "bg-blue-600" : "hover:bg-slate-800 text-slate-300"
        }`}
      >
        <span>⚙️</span>
        <span>{t("sidebarSettings")}</span>
      </Link>

      <div className="p-4 text-sm text-slate-400 border-t border-slate-800">
        {t("loggedInAs")} {user?.role}
      </div>
    </aside>
  );
}