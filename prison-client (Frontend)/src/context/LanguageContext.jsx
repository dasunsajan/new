import { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext();

const SUPPORTED = ["en", "si", "ta"];

export function LanguageProvider({ children }) {
  const saved = localStorage.getItem("lang");
  const [lang, setLang] = useState(SUPPORTED.includes(saved) ? saved : "en");

  // html tag eke lang attribute eka update karanawa (Chrome translate confuse wenne na)
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const changeLang = (newLang) => {
    if (!SUPPORTED.includes(newLang)) return;
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const t = (key) =>
    translations[lang]?.[key] || translations.en?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}