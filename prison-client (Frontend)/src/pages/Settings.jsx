import { useState } from "react";
import api from "../api/axios";
import { useLanguage } from "../context/LanguageContext";
import { useTheme } from "../context/ThemeContext";

const authCfg = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 mb-4">
      <h2 className="font-semibold text-slate-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Choice({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border ${
        active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700 border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const { t, lang, changeLang } = useLanguage();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [msg, setMsg] = useState("");

  const changePassword = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      // backend route eka thawama hadala na nam eka passe hadamu
      await api.put("/change-password", pw, authCfg());
      setMsg(t("passwordChanged"));
      setPw({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setMsg(err.response?.data?.message || t("passwordChangeFailed"));
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">⚙️ {t("settingsTitle")}</h1>

      <Section title={t("appearance")}>
        <div className="flex gap-2">
          <Choice active={theme === "light"} onClick={() => setTheme("light")}>☀️ {t("lightMode")}</Choice>
          <Choice active={theme === "dark"} onClick={() => setTheme("dark")}>🌙 {t("darkMode")}</Choice>
        </div>
      </Section>

      <Section title={t("languageLabel")}>
        <div className="flex gap-2 flex-wrap" translate="no">
          <Choice active={lang === "en"} onClick={() => changeLang("en")}>English</Choice>
          <Choice active={lang === "si"} onClick={() => changeLang("si")}>සිංහල</Choice>
          <Choice active={lang === "ta"} onClick={() => changeLang("ta")}>தமிழ்</Choice>
        </div>
      </Section>

      <Section title={t("fontSizeLabel")}>
        <div className="flex gap-2">
          <Choice active={fontSize === "small"} onClick={() => setFontSize("small")}>{t("small")}</Choice>
          <Choice active={fontSize === "medium"} onClick={() => setFontSize("medium")}>{t("medium")}</Choice>
          <Choice active={fontSize === "large"} onClick={() => setFontSize("large")}>{t("large")}</Choice>
        </div>
      </Section>

      <Section title={t("changePassword")}>
        <form onSubmit={changePassword} className="space-y-3">
          <input
            type="password"
            required
            placeholder={t("currentPassword")}
            value={pw.currentPassword}
            onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            className="w-full border border-slate-300 p-2 rounded-lg"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder={t("newPassword")}
            value={pw.newPassword}
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            className="w-full border border-slate-300 p-2 rounded-lg"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            {t("saveBtn")}
          </button>
          {msg && <p className="text-sm text-slate-600">{msg}</p>}
        </form>
      </Section>
    </div>
  );
}