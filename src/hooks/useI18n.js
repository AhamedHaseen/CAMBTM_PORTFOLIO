import { useState, useEffect, useCallback } from "react";

function getInitialLanguage() {
  if (typeof window === "undefined") return "en";
  if (window.cambmGetLanguage) return window.cambmGetLanguage();
  try {
    const raw = localStorage.getItem("cambm_locale");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.language) return parsed.language;
    }
  } catch (e) {}
  return document.documentElement.lang || "en";
}

const PROJECT_KEY_MAP = {
  myra: "myra",
  uneeflow: "uneeflow",
  "al-fakhir": "alFakhir",
  alfakhir: "alFakhir",
  al_fakhir: "alFakhir",
  hijaz: "hijaz",
  mahanama: "mahanama",
  "lucky-darbar": "luckyDarbar",
  luckydarbar: "luckyDarbar",
  lucky_darbar: "luckyDarbar",
  "crane-shoes": "craneShoes",
  craneshoes: "craneShoes",
  crane_shoes: "craneShoes",
  "fly-bagdad": "flyBagdad",
  flybagdad: "flyBagdad",
  fly_bagdad: "flyBagdad",
};

export function useI18n() {
  const [lang, setLang] = useState(getInitialLanguage);

  useEffect(() => {
    const handleLocaleChange = (e) => {
      const newLang = e?.detail?.language || getInitialLanguage();
      setLang(newLang);
    };

    document.addEventListener("cambm:localechange", handleLocaleChange);

    // Also observe html lang attribute mutations as backup
    const observer = new MutationObserver(() => {
      const currentHtmlLang = document.documentElement.lang;
      if (currentHtmlLang && currentHtmlLang !== lang) {
        setLang(currentHtmlLang);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"],
    });

    return () => {
      document.removeEventListener("cambm:localechange", handleLocaleChange);
      observer.disconnect();
    };
  }, [lang]);

  const t = useCallback(
    (key, fallback = "") => {
      if (typeof window === "undefined") return fallback || key;
      if (window.cambmTranslate) {
        const val = window.cambmTranslate(key, lang);
        if (val) return val;
      }
      const dict = window.CAMBM_TRANSLATIONS?.[lang];
      if (dict && dict[key] != null && dict[key] !== "") {
        return dict[key];
      }
      const enDict = window.CAMBM_TRANSLATIONS?.en;
      if (enDict && enDict[key] != null && enDict[key] !== "") {
        return enDict[key];
      }
      return fallback || key;
    },
    [lang]
  );

  const translateProject = useCallback(
    (project) => {
      if (!project) return project;
      const rawId = String(project.id || project.slug || "").toLowerCase();
      const keyId = PROJECT_KEY_MAP[rawId] || rawId;

      const translatedOverview = t(`portfolio.project.${keyId}.overview`, "");
      const translatedChallenge = t(`portfolio.project.${keyId}.challenge`, "");
      const translatedApproach = t(`portfolio.project.${keyId}.approach`, "");
      const translatedDeliverables = t(`portfolio.project.${keyId}.deliverables`, "");
      const translatedTeaser = t(`portfolio.project.${keyId}.teaser`, "");

      // Translate industry if matching standard categories
      let translatedIndustry = project.industry;
      const indLower = (project.industry || "").toLowerCase();
      if (indLower.includes("beauty")) translatedIndustry = t("portfolio.industry.beauty", project.industry);
      else if (indLower.includes("food") || indLower.includes("fmcg") || indLower.includes("dining")) translatedIndustry = t("portfolio.industry.food", project.industry);
      else if (indLower.includes("tech") || indLower.includes("saas") || indLower.includes("ai")) translatedIndustry = t("portfolio.industry.technology", project.industry);
      else if (indLower.includes("hospitality")) translatedIndustry = t("portfolio.industry.hospitality", project.industry);
      else if (indLower.includes("education") || indLower.includes("training")) translatedIndustry = t("portfolio.industry.education", project.industry);
      else if (indLower.includes("retail") || indLower.includes("footwear")) translatedIndustry = t("portfolio.industry.retail", project.industry);
      else if (indLower.includes("aviation") || indLower.includes("travel")) translatedIndustry = t("portfolio.industry.aviation", project.industry);

      // Translate market if matching
      let translatedMarket = project.market;
      const mktLower = (project.market || "").toLowerCase();
      if (mktLower.includes("sri lanka") && mktLower.includes("uae")) translatedMarket = `${t("portfolio.market.sri-lanka", "Sri Lanka")} & ${t("portfolio.market.uae", "UAE")}`;
      else if (mktLower.includes("sri lanka") && mktLower.includes("india")) translatedMarket = `${t("portfolio.market.sri-lanka", "Sri Lanka")} & ${t("portfolio.market.india", "India")}`;
      else if (mktLower.includes("sri lanka")) translatedMarket = t("portfolio.market.sri-lanka", project.market);
      else if (mktLower.includes("saudi")) translatedMarket = t("portfolio.market.saudi-arabia", project.market);
      else if (mktLower.includes("uae") || mktLower.includes("gcc")) translatedMarket = t("portfolio.market.uae", project.market);
      else if (mktLower.includes("india")) translatedMarket = t("portfolio.market.india", project.market);
      else if (mktLower.includes("iraq")) translatedMarket = t("portfolio.market.iraq", project.market);

      return {
        ...project,
        overview: translatedOverview || project.overview || project.short_description || "",
        challenge: translatedChallenge || project.challenge || "",
        approach: translatedApproach || project.approach || "",
        deliverables: translatedDeliverables || project.deliverables || "",
        short_description: translatedTeaser || project.short_description || "",
        industry: translatedIndustry || project.industry || "Beauty & Wellness",
        market: translatedMarket || project.market || "Global",
      };
    },
    [t]
  );

  return {
    lang,
    isRtl: lang === "ar",
    t,
    translateProject,
  };
}
