import express from "express";

const router = express.Router();

const LANG_CODES = {
  si: "si",
  ta: "ta",
  en: "en",
};

router.post("/translate", async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ message: "text and targetLang are required" });
    }

    const langPair = `en|${LANG_CODES[targetLang] || targetLang}`;

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`
    );
    const data = await response.json();

    const translated = data?.responseData?.translatedText || text;

    res.json({ translatedText: translated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Translation failed" });
  }
});

export default router;