import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";

const FEATURES = [
  { icon: "🗂️", titleKey: "feature1Title", descKey: "feature1Desc" },
  { icon: "🌐", titleKey: "feature2Title", descKey: "feature2Desc" },
  { icon: "🔒", titleKey: "feature3Title", descKey: "feature3Desc" },
];

function Login() {
  const { t, lang, changeLang } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (username.trim() === "" || password.trim() === "") {
      setError(t("enterCredentials"));
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { username, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      {/* LEFT: photo + description */}
      <div
        className="hidden lg:flex lg:w-1/2 relative bg-cover bg-center text-white"
        style={{
          backgroundImage:
            "linear-gradient(to bottom right, rgba(15,23,42,0.88), rgba(30,58,138,0.78)), url('/welikada.jpg')",
        }}
      >
        <div className="flex flex-col justify-between p-12 w-full">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl border border-white/20">
              🏛️
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">{t("prisonName")}</div>
              <div className="text-xs text-blue-200 tracking-wide uppercase">{t("heroTag")}</div>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold leading-tight mb-4">{t("heroTitle")}</h1>
            <p className="text-blue-100 leading-relaxed mb-8">{t("heroDesc")}</p>

            <div className="space-y-4">
              {FEATURES.map((f) => (
                <div key={f.titleKey} className="flex gap-4 items-start">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-semibold">{t(f.titleKey)}</div>
                    <div className="text-sm text-blue-200">{t(f.descKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-blue-200/80">
            © {new Date().getFullYear()} {t("prisonName")} · {t("footerText")}
          </div>
        </div>
      </div>

      {/* RIGHT: login form */}
      <div className="flex-1 relative flex items-center justify-center bg-slate-50 px-6 py-10">
        {/* Language switcher */}
        <div className="absolute top-5 right-5">
          <select
            translate="no"
            value={lang}
            onChange={(e) => changeLang(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm cursor-pointer shadow-sm"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
        </div>

        <div className="w-full max-w-md">
          {/* Mobile brand (photo panel hidden) */}
          <div className="lg:hidden text-center mb-8">
            <div className="text-5xl mb-2">🏛️</div>
            <div className="font-bold text-slate-800 text-xl">{t("prisonName")}</div>
          </div>

          <h2 className="text-3xl font-bold text-slate-800">{t("welcomeBack")}</h2>
          <p className="text-slate-500 mt-1 mb-8">{t("loginSubtitle")}</p>

          <form onSubmit={handleLogin}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t("username")}</label>
            <input
              type="text"
              placeholder={t("username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-slate-300 bg-white text-slate-800 p-3 mb-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label className="block text-sm font-medium text-slate-700 mb-1">{t("password")}</label>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 bg-white text-slate-800 p-3 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
            >
              {loading ? t("loggingIn") : t("login")}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            {t("noAccount")}{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              {t("createAccount")}
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 mt-10">🔒 {t("authorizedOnly")}</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
