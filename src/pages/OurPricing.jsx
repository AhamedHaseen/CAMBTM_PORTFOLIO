import React, { useState, useEffect, useMemo, useCallback } from "react";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import CtaSection from "../components/CtaSection";
import { I18N_SERVICES } from "../components/ServicesSection";
import "../css/our-pricing.css";

const I18N_PRICING_PAGE = {
  en: {
    heroTitle: "Pricing",
    heroCta: "Explore Packages",
    customizeQuestion: "Wanna build your own package?",
    hideOptions: "Hide Options ↑",
    customizeBtn: "Customise →",
    scopeEyebrow: "CUSTOMISE YOUR SCOPE",
    scopeTitle: "Select the exact capabilities your business needs",
    scopeDesc: "Click the + icon on the right side of any service to add it to your custom plan.",
    scopeSummaryTitle: "Your Selected Custom Scope",
    servicesSelectedSingular: "Service Selected",
    servicesSelectedPlural: "Services Selected",
    reset: "Reset",
    confirm: "Confirm",
  },
  es: {
    heroTitle: "Precios y Planes",
    heroCta: "Explorar Paquetes",
    customizeQuestion: "¿Quieres crear tu propio paquete?",
    hideOptions: "Ocultar Opciones ↑",
    customizeBtn: "Personalizar →",
    scopeEyebrow: "PERSONALIZA TU ALCANCE",
    scopeTitle: "Selecciona las capacidades exactas que tu empresa necesita",
    scopeDesc: "Haz clic en el icono + a la derecha de cualquier servicio para añadirlo a tu plan personalizado.",
    scopeSummaryTitle: "Tu Selección Personalizada",
    servicesSelectedSingular: "Servicio Seleccionado",
    servicesSelectedPlural: "Servicios Seleccionados",
    reset: "Restablecer",
    confirm: "Confirmar",
  },
  ar: {
    heroTitle: "الأسعار والباقات",
    heroCta: "استكشف الباقات",
    customizeQuestion: "هل تريد بناء باقتك الخاصة؟",
    hideOptions: "إخفاء الخيارات ↑",
    customizeBtn: "تخصيص →",
    scopeEyebrow: "تخصيص نطاق عملك",
    scopeTitle: "حدد الإمكانيات والخدمات التي يحتاجها عملك التجاري بدقة",
    scopeDesc: "انقر فوق علامة + على يمين أي خدمة لإضافتها إلى خطتك المخصصة.",
    scopeSummaryTitle: "نطاق الخدمات المخصص الذي اخترته",
    servicesSelectedSingular: "خدمة محددة",
    servicesSelectedPlural: "خدمات محددة",
    reset: "إعادة ضبط",
    confirm: "تأكيد",
  },
  si: {
    heroTitle: "මිල ගණන් සහ පැකේජ",
    heroCta: "පැකේජ ගවේෂණය කරන්න",
    customizeQuestion: "ඔබේම පැකේජයක් සාදා ගැනීමට අවශ්‍යද?",
    hideOptions: "විකල්ප සඟවන්න ↑",
    customizeBtn: "අභිරුචිකරණය →",
    scopeEyebrow: "ඔබේ අවශ්‍යතාවයට අනුව සකසන්න",
    scopeTitle: "ඔබේ ව්‍යාපාරයට අවශ්‍ය නිශ්චිත සේවාවන් තෝරන්න",
    scopeDesc: "ඔබගේ සැලැස්මට එක් කිරීමට ඕනෑම සේවාවක දකුණු පස ඇති + ලකුණ ක්ලික් කරන්න.",
    scopeSummaryTitle: "ඔබ තෝරාගත් අභිරුචි සේවා එකතුව",
    servicesSelectedSingular: "සේවාවක් තෝරාගෙන ඇත",
    servicesSelectedPlural: "සේවාවන් තෝරාගෙන ඇත",
    reset: "යළි සකසන්න",
    confirm: "තහවුරු කරන්න",
  },
  ta: {
    heroTitle: "விலை மற்றும் தொகுப்புகள்",
    heroCta: "தொகுப்புகளை ஆராய்க",
    customizeQuestion: "உங்கள் சொந்த தொகுப்பை உருவாக்க விரும்புகிறீர்களா?",
    hideOptions: "விருப்பங்களை மறைக்க ↑",
    customizeBtn: "தனிப்பயனாக்க →",
    scopeEyebrow: "உங்கள் திட்டத்தை தனிப்பயனாக்குங்கள்",
    scopeTitle: "உங்கள் வணிகத்திற்குத் தேவையான சரியான சேவைகளைத் தேர்ந்தெடுக்கவும்",
    scopeDesc: "உங்கள் தனிப்பயன் திட்டத்தில் சேர்க்க எந்தவொரு சேவையின் வலது பக்கத்திலும் உள்ள + குறியீட்டைக் கிளிக் செய்யவும்.",
    scopeSummaryTitle: "நீங்கள் தேர்ந்தெடுத்த தனிப்பயன் சேவைகள்",
    servicesSelectedSingular: "சேவை தேர்ந்தெடுக்கப்பட்டது",
    servicesSelectedPlural: "சேவைகள் தேர்ந்தெடுக்கப்பட்டன",
    reset: "மீட்டமை",
    confirm: "உறுதிப்படுத்து",
  },
};

const getSavedLang = () => {
  if (typeof window !== "undefined" && typeof window.cambmGetLanguage === "function") {
    const l = window.cambmGetLanguage();
    if (l && I18N_SERVICES[l]) return l;
  }
  try {
    const saved = localStorage.getItem("cambm_lang");
    if (saved && I18N_SERVICES[saved]) return saved;
  } catch (e) { }
  if (typeof document !== "undefined" && document.documentElement && document.documentElement.lang) {
    const docLang = document.documentElement.lang;
    if (I18N_SERVICES[docLang]) return docLang;
  }
  return "en";
};

export default function OurPricing() {
  const [currentLang, setCurrentLang] = useState(() => getSavedLang());
  const [showCustomize, setShowCustomize] = useState(false);
  const [builderTab, setBuilderTab] = useState("build");
  const [selectedServices, setSelectedServices] = useState([]);

  // Dynamic Services & Combos from Admin / API / LocalStorage
  const [dynamicServices, setDynamicServices] = useState(() => {
    try {
      const cached = localStorage.getItem("cambm_services") || localStorage.getItem("cambm_admin_services");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });

  const [dynamicCombos, setDynamicCombos] = useState(() => {
    try {
      const cached = localStorage.getItem("cambm_combos") || localStorage.getItem("cambm_admin_combos");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) { }
    return [];
  });

  const loadDynamicData = useCallback(() => {
    // 1. Load Services from API
    fetch("/api/services")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = data?.services || data?.data;
        if (data && data.success && Array.isArray(list) && list.length > 0) {
          setDynamicServices(list);
          try {
            localStorage.setItem("cambm_services", JSON.stringify(list));
            localStorage.setItem("cambm_admin_services", JSON.stringify(list));
          } catch (e) { }
        }
      })
      .catch(() => { });

    // 2. Load Combos from API
    fetch("/api/combos")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = data?.combos || data?.data;
        if (data && data.success && Array.isArray(list) && list.length > 0) {
          setDynamicCombos(list);
          try {
            localStorage.setItem("cambm_combos", JSON.stringify(list));
            localStorage.setItem("cambm_admin_combos", JSON.stringify(list));
          } catch (e) { }
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    loadDynamicData();

    const handleServicesUpdate = () => {
      try {
        const saved = localStorage.getItem("cambm_services") || localStorage.getItem("cambm_admin_services");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setDynamicServices(parsed);
        }
      } catch (e) { }
      loadDynamicData();
    };

    const handleCombosUpdate = () => {
      try {
        const saved = localStorage.getItem("cambm_combos") || localStorage.getItem("cambm_admin_combos");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setDynamicCombos(parsed);
        }
      } catch (e) { }
      loadDynamicData();
    };

    window.addEventListener("cambm_services_updated", handleServicesUpdate);
    window.addEventListener("cambm_combos_updated", handleCombosUpdate);
    window.addEventListener("storage", handleServicesUpdate);
    window.addEventListener("storage", handleCombosUpdate);

    return () => {
      window.removeEventListener("cambm_services_updated", handleServicesUpdate);
      window.removeEventListener("cambm_combos_updated", handleCombosUpdate);
      window.removeEventListener("storage", handleServicesUpdate);
      window.removeEventListener("storage", handleCombosUpdate);
    };
  }, [loadDynamicData]);

  // Sync language with global locale switcher & document observer
  useEffect(() => {
    const handleLocaleChange = (e) => {
      const newLang = e?.detail?.language || getSavedLang();
      if (I18N_SERVICES[newLang]) {
        setCurrentLang((prev) => (prev !== newLang ? newLang : prev));
      }
    };

    document.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);

    const observer = new MutationObserver(() => {
      const currentHtmlLang = document.documentElement.lang || getSavedLang();
      if (currentHtmlLang && I18N_SERVICES[currentHtmlLang]) {
        setCurrentLang((prev) => (prev !== currentHtmlLang ? currentHtmlLang : prev));
      }
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang", "dir"],
      });
    }

    return () => {
      document.removeEventListener("cambm:localechange", handleLocaleChange);
      window.removeEventListener("cambm:localechange", handleLocaleChange);
      window.removeEventListener("storage", handleLocaleChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
    if (window.initI18n) {
      window.initI18n();
    }
  }, [currentLang]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
      window.__cambmLenis.scrollTo(0, { immediate: true });
    }

    const headerEl = document.getElementById("header");
    if (headerEl) {
      headerEl.classList.remove("scrolled");
    }

    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
    if (window.initI18n) {
      window.initI18n();
    }
    document.dispatchEvent(new CustomEvent("cambm:revealed"));

    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.style.height = "";
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
      if (window.__cambmLenis && typeof window.__cambmLenis.start === "function") {
        window.__cambmLenis.start();
      }
    };
  }, []);

  useEffect(() => {
    if (window.__cambmLenis && typeof window.__cambmLenis.resize === "function") {
      window.__cambmLenis.resize();
    }
  }, [showCustomize, builderTab, selectedServices]);

  const getServiceName = useCallback((item, lang = currentLang) => {
    if (!item) return "";
    const localeData = I18N_SERVICES[lang] || I18N_SERVICES.en;
    const cat = (item.category || "").toLowerCase();
    const catServices = localeData[cat]?.services || [];
    const found = catServices.find((s) => s.num === item.num || s.id === item.id || s.key === item.key);
    if (found && found.name) return found.name;
    return item.name || "";
  }, [currentLang]);

  const CANONICAL_PACKAGES = {
    video: "Videography Package",
    web: "Website Package",
    pos: "POS Package",
    custom: "Custom",
  };

  const getCanonicalPackageName = (cardOrId) => {
    if (!cardOrId) return "Custom";
    if (typeof cardOrId === "object") {
      if (cardOrId.id && CANONICAL_PACKAGES[cardOrId.id]) return CANONICAL_PACKAGES[cardOrId.id];
      const t = (cardOrId.title || "").toLowerCase();
      if (t.includes("video") || t.includes("வீடியோ") || t.includes("වීඩියෝ") || t.includes("فيديو")) return "Videography Package";
      if (t.includes("web") || t.includes("வலைத்தள") || t.includes("වෙබ්") || t.includes("sitio") || t.includes("موقع")) return "Website Package";
      if (t.includes("pos") || t.includes("பாயிண்ட்")) return "POS Package";
      return cardOrId.title || "Custom";
    }
    const idStr = String(cardOrId).toLowerCase();
    if (CANONICAL_PACKAGES[idStr]) return CANONICAL_PACKAGES[idStr];
    if (idStr.includes("video") || idStr.includes("வீடியோ") || idStr.includes("වීඩියෝ") || idStr.includes("فيديو")) return "Videography Package";
    if (idStr.includes("web") || idStr.includes("வலைத்தள") || idStr.includes("වෙබ්") || idStr.includes("sitio") || idStr.includes("موقع")) return "Website Package";
    if (idStr.includes("pos")) return "POS Package";
    return cardOrId;
  };

  const activeLocaleData = useMemo(() => {
    return I18N_SERVICES[currentLang] || I18N_SERVICES.en;
  }, [currentLang]);

  const pricingPageContent = useMemo(() => {
    return I18N_PRICING_PAGE[currentLang] || I18N_PRICING_PAGE.en;
  }, [currentLang]);

  const getServiceKey = (svc, category) => {
    if (svc.key) return svc.key;
    const cat = category || svc.category || "build";
    const identifier = svc.id || svc.num || svc.name;
    return `${cat}-${identifier}`;
  };

  const toggleService = (svc, category) => {
    const cat = category || svc.category || builderTab;
    const serviceKey = getServiceKey(svc, cat);
    setSelectedServices((prev) => {
      const exists = prev.some(
        (item) => item.key === serviceKey || (item.num === svc.num && item.category === cat)
      );
      if (exists) {
        return prev.filter(
          (item) => item.key !== serviceKey && !(item.num === svc.num && item.category === cat)
        );
      } else {
        return [
          ...prev,
          {
            key: serviceKey,
            id: svc.id || svc.num || svc.name,
            num: svc.num,
            name: svc.name,
            category: cat,
          },
        ];
      }
    });
  };

  const isServiceSelected = (svc, category) => {
    const cat = category || svc.category || builderTab;
    const serviceKey = getServiceKey(svc, cat);
    return selectedServices.some(
      (item) => item.key === serviceKey || (item.num === svc.num && item.category === cat)
    );
  };

  const removeService = (keyToRemove) => {
    setSelectedServices((prev) => prev.filter((item) => item.key !== keyToRemove));
  };

  const handleToggleCustomize = (e) => {
    if (e) e.preventDefault();
    setShowCustomize((prev) => {
      const nextState = !prev;
      setTimeout(() => {
        if (window.__cambmLenis && typeof window.__cambmLenis.resize === "function") {
          window.__cambmLenis.resize();
        }
        if (nextState) {
          const el = document.getElementById("pricing-custom-builder");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return nextState;
    });
  };

  const handleConfirmCustomScope = (e) => {
    if (e) e.preventDefault();
    if (selectedServices.length === 0) return;

    // Filter selected services by category
    const buildItems = selectedServices.filter((s) => s.category.toLowerCase() === "build");
    const growItems = selectedServices.filter((s) => s.category.toLowerCase() === "grow");
    const createItems = selectedServices.filter((s) => s.category.toLowerCase() === "create");

    const buildLabel = activeLocaleData.tabs?.build || "Build";
    const growLabel = activeLocaleData.tabs?.grow || "Grow";
    const createLabel = activeLocaleData.tabs?.create || "Create";

    const formatCategory = (categoryTitle, items) => {
      if (items.length > 0) {
        return `${categoryTitle}\n${items.map((s) => `• ${getServiceName(s, currentLang)}`).join("\n")}`;
      }
      return `${categoryTitle}\n• No services selected`;
    };

    const notesContent = [
      formatCategory(buildLabel, buildItems),
      formatCategory(growLabel, growItems),
      formatCategory(createLabel, createItems),
      "Additional Notes:",
    ].join("\n\n");

    const pkg = "Custom";

    const calConfig = {
      layout: "month_view",
      "Select-a-package": pkg,
      "Select a package": pkg,
      "Select a package*": pkg,
      "select-a-package": pkg,
      "select_a_package": pkg,
      package: pkg,
      notes: notesContent,
      "additional-notes": notesContent,
      "additional_notes": notesContent,
      "Additional notes": notesContent,
      "Additional Notes": notesContent,
      "Additional Notes*": notesContent,
    };

    const calParams = new URLSearchParams({
      "Select-a-package": pkg,
      "select-a-package": pkg,
      package: pkg,
      notes: notesContent,
      "additional-notes": notesContent,
    }).toString();

    if (window.Cal) {
      if (typeof window.Cal.ns === "object" && window.Cal.ns["strategy-call"]) {
        window.Cal.ns["strategy-call"]("modal", {
          calLink: `cambridge.marketing?${calParams}`,
          config: calConfig,
        });
      } else {
        window.Cal("modal", {
          calLink: `cambridge.marketing?${calParams}`,
          config: calConfig,
        });
      }
    } else {
      const calBtn = document.querySelector(".btn-primary.js-open-cal");
      if (calBtn) {
        calBtn.setAttribute("data-cal-config", JSON.stringify(calConfig));
        calBtn.click();
      } else {
        window.open(
          `https://cal.com/cambridge.marketing?${calParams}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    }
  };

  const openCalModal = (cardOrName, e) => {
    if (e && e.preventDefault) e.preventDefault();
    const pkg = getCanonicalPackageName(cardOrName);
    const notesContent = "";

    const calConfig = {
      layout: "month_view",
      "Select-a-package": pkg,
      "Select a package": pkg,
      "Select a package*": pkg,
      "select-a-package": pkg,
      "select_a_package": pkg,
      package: pkg,
      notes: "",
      "additional-notes": "",
      "additional_notes": "",
      "Additional notes": "",
      "Additional Notes": "",
      "Additional Notes*": "",
    };

    const calParams = new URLSearchParams({
      "Select-a-package": pkg,
      "select-a-package": pkg,
      package: pkg,
    }).toString();

    if (window.Cal) {
      if (typeof window.Cal.ns === "object" && window.Cal.ns["strategy-call"]) {
        window.Cal.ns["strategy-call"]("modal", {
          calLink: `cambridge.marketing?${calParams}`,
          config: calConfig,
        });
      } else {
        window.Cal("modal", {
          calLink: `cambridge.marketing?${calParams}`,
          config: calConfig,
        });
      }
    } else {
      const calBtn = document.querySelector(".btn-primary.js-open-cal");
      if (calBtn) {
        calBtn.setAttribute("data-cal-config", JSON.stringify(calConfig));
        calBtn.click();
      } else {
        window.open(
          `https://cal.com/cambridge.marketing?${calParams}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
    }
  };

  const cardsToDisplay = useMemo(() => {
    if (currentLang === "en" && dynamicCombos && dynamicCombos.length > 0) {
      const activeCombos = dynamicCombos.filter(
        (c) => c.status === "active" || c.status === undefined || c.is_active === true
      );
      if (activeCombos.length > 0) return activeCombos;
    }
    return activeLocaleData.combos?.cards || [];
  }, [dynamicCombos, activeLocaleData, currentLang]);

  const categoryServices = useMemo(() => {
    if (currentLang === "en" && dynamicServices && dynamicServices.length > 0) {
      const filtered = dynamicServices
        .filter((s) => {
          const cat = (s.category || "").toLowerCase();
          const isActive = s.status === undefined || s.status === "active" || s.is_active === true;
          return cat === builderTab.toLowerCase() && isActive;
        })
        .sort((a, b) => {
          const orderA = Number(a.display_order || a.sort_order || 0);
          const orderB = Number(b.display_order || b.sort_order || 0);
          return orderA - orderB;
        })
        .map((s, idx) => ({
          id: s.id || `${builderTab}-${idx}`,
          num: s.num || String(s.display_order || s.sort_order || idx + 1).padStart(2, "0"),
          name: s.name,
          desc: s.description || s.desc || "",
          category: builderTab,
        }));

      if (filtered.length > 0) return filtered;
    }

    return (activeLocaleData[builderTab]?.services || []).map((s, idx) => ({
      ...s,
      id: `${builderTab}-${s.num || idx}`,
      category: builderTab,
    }));
  }, [dynamicServices, builderTab, activeLocaleData, currentLang]);

  return (
    <div className="pricing-page-container">
      {/* Main Content: Packages */}
      <main className="pricing-page-main">
        <section className="pricing-packages-page-section" id="prebuilt-packages">
          <div className="pricing-container">
            {/* Centered Heading */}
            <div className="pricing-combos-header">
              <span className="pricing-combos-eyebrow">
                {activeLocaleData.combos?.eyebrow || "PRE-BUILT PACKAGES"}
              </span>
              <h2
                className="pricing-combos-title"
                dangerouslySetInnerHTML={{
                  __html: activeLocaleData.combos?.title || "Integrated Services, One <em>Solution</em>",
                }}
              />
              <p className="pricing-combos-desc">
                {activeLocaleData.combos?.desc || "Pre-built packages combine content, marketing, and technology into one flexible solution."}
              </p>
              {activeLocaleData.combos?.note ? (
                <p className="pricing-combos-note">
                  {activeLocaleData.combos.note}
                </p>
              ) : null}
            </div>

            {/* 3 Package Cards Grid */}
            <div className="pricing-combos-grid">
              {cardsToDisplay.map((card) => (
                <article
                  key={card.id || card.title}
                  className={`pricing-combo-card ${card.featured ? "is-featured" : ""}`}
                >
                  <h3 className="pricing-combo-card-title">{card.title}</h3>
                  <p className="pricing-combo-card-desc">{card.desc}</p>
                  <ul className="pricing-combo-items">
                    {(card.items || []).map((feat, idx) => {
                      const isSocial =
                        typeof feat === "string" &&
                        (feat.toLowerCase().includes("social media") ||
                          feat.toLowerCase().includes("meta") ||
                          feat.toLowerCase().includes("tiktok") ||
                          feat.toLowerCase().includes("redes") ||
                          feat.toLowerCase().includes("تواصل") ||
                          feat.toLowerCase().includes("සමාජ මාධ්‍ය") ||
                          feat.toLowerCase().includes("சமூக ஊடக"));

                      return (
                        <li
                          key={idx}
                          className={`pricing-combo-item-row ${isSocial ? "has-inline-social" : ""}`}
                        >
                          <div className="pricing-combo-item-left">
                            <span className="pricing-combo-check">✓</span>
                            <span className="pricing-combo-item-text">{feat}</span>
                          </div>

                          {isSocial && (
                            <div className="pricing-combo-social-inline" aria-label="Facebook, Instagram, TikTok">
                              <span className="combo-social-icon icon-fb" title="Facebook">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                </svg>
                              </span>
                              <span className="combo-social-icon icon-insta" title="Instagram">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                              </span>
                              <span className="combo-social-icon icon-tiktok" title="TikTok">
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.33 0 .64.06.93.16V9.45a6.34 6.34 0 0 0-.93-.07 6.35 6.35 0 0 0-6.34 6.35 6.35 6.35 0 0 0 6.34 6.34 6.35 6.35 0 0 0 6.35-6.34V8.71a8.2 8.2 0 0 0 4.75 1.5V6.76c-.35 0-.69-.03-1-.07z" />
                                </svg>
                              </span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  <div className="pricing-combo-footer">
                    <span className="pricing-combo-engagement">{card.engagement}</span>
                    <button
                      type="button"
                      className="pricing-combo-discuss-btn"
                      onClick={(e) => openCalModal(card, e)}
                    >
                      {activeLocaleData.combos?.discussBtn || "Discuss"} <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Dedicated Customize Section */}
        <section className="pricing-custom-section" id="custom-scope">
          <div className="pricing-container">
            {/* Customize Header Row */}
            <div className="pricing-customize-banner">
              <h2 className="pricing-customize-title">
                {pricingPageContent.customizeQuestion}
              </h2>
              <button
                type="button"
                className="pricing-customize-btn"
                onClick={handleToggleCustomize}
              >
                {showCustomize ? pricingPageContent.hideOptions : pricingPageContent.customizeBtn}
              </button>
            </div>

            {/* Interactive Custom Services Builder */}
            {showCustomize && (
              <div className="pricing-custom-builder" id="pricing-custom-builder">
                <div className="pricing-custom-builder-head">
                  <span className="pricing-combos-eyebrow" style={{ color: "#ff5a00" }}>
                    {pricingPageContent.scopeEyebrow}
                  </span>
                  <h3 className="pricing-custom-builder-title">
                    {pricingPageContent.scopeTitle}
                  </h3>
                  <p className="pricing-custom-builder-desc">
                    {pricingPageContent.scopeDesc}
                  </p>
                </div>

                {/* Tabs: BUILD, CREATE, GROW */}
                <div className="pricing-custom-tabs" role="tablist">
                  {["build", "create", "grow"].map((tabKey) => {
                    const tabLabel =
                      activeLocaleData.tabs?.[tabKey] || tabKey.toUpperCase();
                    const tabCount = selectedServices.filter(
                      (s) => (s.category || "").toLowerCase() === tabKey.toLowerCase()
                    ).length;

                    return (
                      <button
                        key={tabKey}
                        type="button"
                        className={`pricing-custom-tab ${builderTab === tabKey ? "is-active" : ""}`}
                        onClick={() => setBuilderTab(tabKey)}
                        role="tab"
                        aria-selected={builderTab === tabKey}
                      >
                        {tabLabel}
                        {tabCount > 0 && (
                          <span className="pricing-custom-tab-count">
                            {tabCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Services List for Active Tab */}
                <div className="pricing-custom-grid">
                  {categoryServices.map((svc, idx) => {
                    const isSelected = isServiceSelected(svc, builderTab);

                    return (
                      <div
                        key={svc.id || svc.num || idx}
                        className={`pricing-custom-item ${isSelected ? "is-selected" : ""}`}
                        onClick={() => toggleService(svc, builderTab)}
                      >
                        <div className="pricing-custom-item-left">
                          <span className="pricing-custom-item-num">
                            {svc.num || String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="pricing-custom-item-text">
                            <h4 className="pricing-custom-item-name">
                              {svc.name}
                            </h4>
                            {svc.desc && (
                              <p className="pricing-custom-item-desc">
                                {svc.desc}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right Side: + / ✓ Mark */}
                        <div className="pricing-custom-item-right">
                          <button
                            type="button"
                            className={`pricing-custom-add-btn ${isSelected ? "is-selected" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(svc, builderTab);
                            }}
                            aria-label={isSelected ? `Remove ${svc.name}` : `Add ${svc.name}`}
                            title={isSelected ? "Remove" : "Add"}
                          >
                            {isSelected ? (
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                width="16"
                                height="16"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Services Summary & Confirm */}
                {selectedServices.length > 0 && (
                  <div className="pricing-custom-summary">
                    <div className="pricing-custom-summary-top">
                      <div className="pricing-custom-summary-info">
                        <div className="pricing-custom-summary-badge-row">
                          <span className="pricing-custom-summary-badge">
                            {selectedServices.length}{" "}
                            {selectedServices.length === 1
                              ? pricingPageContent.servicesSelectedSingular
                              : pricingPageContent.servicesSelectedPlural}
                          </span>
                        </div>
                        <h4 className="pricing-custom-summary-title">
                          {pricingPageContent.scopeSummaryTitle}
                        </h4>
                      </div>
                      <button
                        type="button"
                        className="pricing-custom-confirm-btn"
                        onClick={handleConfirmCustomScope}
                      >
                        {pricingPageContent.confirm} <span>→</span>
                      </button>
                    </div>

                    <div className="pricing-custom-summary-chips">
                      {selectedServices.map((item) => {
                        const displayName = getServiceName(item, currentLang);
                        return (
                          <span key={item.key} className="pricing-custom-chip">
                            <span className="chip-name">{displayName}</span>
                            <button
                              type="button"
                              className="chip-del"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeService(item.key);
                              }}
                              aria-label={`Remove ${displayName}`}
                              title={`Remove ${displayName}`}
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}

                      {/* Reset Button placed right next to selected services in the same line */}
                      <button
                        type="button"
                        className="pricing-custom-chip-reset-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServices([]);
                        }}
                        title="Reset all selected services"
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ marginRight: "5px" }}
                          aria-hidden="true"
                        >
                          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                          <path d="M3 3v5h5" />
                        </svg>
                        {pricingPageContent.reset || "Reset"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <CtaSection />
      </main>

      {/* Footer matching Home Page */}
      <footer className="footer" id="footer">
        <div className="footer-inner">
          <FooterOffices />
          <div className="footer-bottom">
            <img
              className="theme-logo"
              src="/images/cambridge-logo.png"
              alt="Cambridge Marketing"
              width="133"
              height="40"
              style={{
                height: "40px",
                width: "auto",
                display: "block",
                filter: "brightness(10)",
              }}
            />
            <p className="footer-copyright">
              &copy; <span id="currentYear">2026</span> Cambridge Marketing
              (PVT) Ltd.{" "}
              <span data-i18n="footer.rights">All rights reserved.</span>
            </p>
            <FooterSocials />
          </div>
        </div>
      </footer>

      {/* First-visit country/language popup */}
      <div className="locale-popup-backdrop" id="localePopupBackdrop">
        <div
          className="locale-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Select your region"
        >
          <h3 className="locale-popup-title" data-i18n="locale.popupTitle">
            Choose your country &amp; language
          </h3>
          <p className="locale-popup-desc" data-i18n="locale.popupDesc">
            We'll tailor pricing and language to your region.
          </p>

          <label
            className="locale-field-label"
            htmlFor="localePopupCountry"
            data-i18n="locale.countryLabel"
          >
            Country
          </label>
          <select className="locale-select" id="localePopupCountry"></select>

          <label
            className="locale-field-label"
            htmlFor="localePopupLanguage"
            data-i18n="locale.languageLabel"
          >
            Language
          </label>
          <select className="locale-select" id="localePopupLanguage"></select>
          <button
            type="button"
            className="btn btn-primary locale-popup-confirm"
            id="localePopupConfirm"
            data-i18n="locale.confirm"
          >
            Continue
          </button>
          <p className="locale-popup-note" data-i18n="locale.changeNote">
            You can change this anytime from the menu.
          </p>
        </div>
      </div>
    </div>
  );
}
