import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import "../css/services-redesign.css";

const I18N_CUSTOM_PLAN = {
  en: {
    badge: "Custom Service Plan",
    title: "Review Your Selected Services",
    subtitle: "Customize quantities or add special requirements before scheduling your strategy call.",
    emptyTitle: "Your custom plan is empty",
    emptySubtitle: "Browse our BUILD, CREATE, and GROW services to customize your package.",
    browseServices: "Browse Services",
    backToHome: "← Back to Home",
    catBuild: "BUILD",
    catCreate: "CREATE",
    catGrow: "GROW",
    notesLabel: "Project Scope & Specific Requirements (Optional)",
    notesPlaceholder: "e.g. 2 websites (corporate + online store), 3 monthly video shoots, multi-branch POS setup...",
    clearPlan: "Clear Plan",
    addMore: "+ Add More Services",
    bookBtn: "Confirm",
    home: "Home",
    services: "Services",
    packages: "Packages",
    whyCambm: "Why CAMBM",
    ourProducts: "Our Products",
    ourProjects: "Our Products",
    about: "About",
    bookCall: "Book a strategy call",
  },
  es: {
    badge: "Plan de Servicios Personalizado",
    title: "Revisa tus Servicios Seleccionados",
    subtitle: "Ajusta las cantidades o añade requerimientos específicos antes de agendar tu llamada estratégica.",
    emptyTitle: "Tu plan personalizado está vacío",
    emptySubtitle: "Explora nuestros servicios de CONSTRUIR, CREAR y CRECER para armar tu paquete.",
    browseServices: "Explorar Servicios",
    backToHome: "← Volver al Inicio",
    catBuild: "CONSTRUIR",
    catCreate: "CREAR",
    catGrow: "CRECER",
    notesLabel: "Alcance del Proyecto y Requerimientos (Opcional)",
    notesPlaceholder: "ej. 2 sitios web, 3 sesiones de video mensuales, sistema POS para sucursales...",
    clearPlan: "Limpiar Plan",
    addMore: "+ Añadir Más Servicios",
    bookBtn: "Confirmar",
    home: "Inicio",
    services: "Servicios",
    packages: "Paquetes",
    whyCambm: "Por qué CAMBM",
    ourProducts: "Nuestros Productos",
    ourProjects: "Nuestros Productos",
    about: "Nosotros",
    bookCall: "Agendar llamada",
  },
  ar: {
    badge: "خطة الخدمات المخصصة",
    title: "مراجعة الخدمات المختارة",
    subtitle: "حدد الكميات أو أضف متطلبات خاصة قبل جدولة مكالمتك الاستراتيجية.",
    emptyTitle: "سلة الخدمات المخصصة فارغة",
    emptySubtitle: "تصفح خدماتنا في بناء، ابتكار، ونمو لتخصيص خطتك.",
    browseServices: "تصفح الخدمات",
    backToHome: "← العودة للرئيسية",
    catBuild: "بناء",
    catCreate: "ابتكار",
    catGrow: "نمو",
    notesLabel: "نطاق المشروع والمتطلبات الخاصة (اختياري)",
    notesPlaceholder: "مثال: موقعين إلكترونيين، 3 جلسات تصوير شهرياً، نظام POS للفروع...",
    clearPlan: "إفراغ السلة",
    addMore: "+ إضافة المزيد من الخدمات",
    bookBtn: "تأكيد",
    home: "الرئيسية",
    services: "الخدمات",
    packages: "الباقات",
    whyCambm: "لماذا CAMBM",
    ourProducts: "منتجاتنا",
    ourProjects: "منتجاتنا",
    about: "من نحن",
    bookCall: "احجز مكالمة استراتيجية",
  },
  si: {
    badge: "අභිරුචි සේවා සැලැස්ම",
    title: "තෝරාගත් සේවාවන් සමාලෝචනය කරන්න",
    subtitle: "උපායමාර්ගික සාකච්ඡාව වෙන්කර ගැනීමට පෙර අවශ්‍ය ප්‍රමාණයන් සහ විස්තර සකස් කරන්න.",
    emptyTitle: "ඔබගේ සේවා සැලැස්ම හිස්ව පවතී",
    emptySubtitle: "ඔබගේ පැකේජය සකස් කර ගැනීමට ගොඩනැගීම, නිර්මාණය සහ වර්ධනය සේවා පරීක්ෂා කරන්න.",
    browseServices: "සේවාවන් පරීක්ෂා කරන්න",
    backToHome: "← ප්‍රධාන පිටුවට",
    catBuild: "ගොඩනැගීම",
    catCreate: "නිර්මාණය",
    catGrow: "වර්ධනය",
    notesLabel: "ව්‍යාපෘති විස්තර සහ විශේෂ අවශ්‍යතා (විකල්ප)",
    notesPlaceholder: "උදා: වෙබ් අඩවි 2ක්, මාසික වීඩියෝ රූගත කිරීම් 3ක්, POS පද්ධතියක්...",
    clearPlan: "සියල්ල ඉවත් කරන්න",
    addMore: "+ තවත් සේවා එක් කරන්න",
    bookBtn: "තහවුරු කරන්න",
    home: "මුල් පිටුව",
    services: "සේවාවන්",
    packages: "පැකේජ",
    whyCambm: "ඇයි CAMBM",
    ourProducts: "අපගේ නිෂ්පාදන",
    ourProjects: "අපගේ නිෂ්පාදන",
    about: "අප ගැන",
    bookCall: "සාකච්ඡාවක් වෙන්කරන්න",
  },
  ta: {
    badge: "தனிப்பயன் சேவைத் திட்டம்",
    title: "நீங்கள் தேர்ந்தெடுத்த சேவைகள்",
    subtitle: "உங்கள் வியூக அழைப்பை முன்பதிவு செய்வதற்கு முன் எண்ணிக்கையை மாற்றியமைக்கவும் அல்லது கூடுதல் தேவைகளைக் குறிப்பிடவும்.",
    emptyTitle: "உங்கள் சேவை கார்ட் காலியாக உள்ளது",
    emptySubtitle: "உங்கள் திட்டத்தை உருவாக்க உருவாக்குதல், படைத்தல் மற்றும் வளர்த்தல் சேவைகளை ஆராயுங்கள்.",
    browseServices: "சேவைகளை ஆராயுங்கள்",
    backToHome: "← முகப்புக்கு செல்ல",
    catBuild: "உருவாக்குதல்",
    catCreate: "படைத்தல்",
    catGrow: "வளர்த்தல்",
    notesLabel: "திட்ட விவரங்கள் & சிறப்பு தேவைகள் (விருப்பத்தேர்வு)",
    notesPlaceholder: "எ.கா: 2 இணையதளங்கள், மாதத்திற்கு 3 வீடியோ படப்பிடிப்புகள், கிளைகளுக்கான POS...",
    clearPlan: "அனைத்தையும் நீக்கு",
    addMore: "+ கூடுதல் சேவைகளை சேர்க்க",
    bookBtn: "உறுதிப்படுத்தவும்",
    home: "முகப்பு",
    services: "சேவைகள்",
    packages: "பேக்கேஜ்கள்",
    whyCambm: "ஏன் CAMBM",
    ourProducts: "எங்கள் தயாரிப்புகள்",
    ourProjects: "எங்கள் தயாரிப்புகள்",
    about: "எங்களை பற்றி",
    bookCall: "வியூக அழைப்பை பதிவு செய்",
  },
};

const getSavedLang = () => {
  if (typeof window === "undefined") return "en";
  if (typeof window.cambmGetLanguage === "function") {
    const lang = window.cambmGetLanguage();
    if (lang && I18N_CUSTOM_PLAN[lang]) return lang;
  }
  const htmlLang = document.documentElement.lang;
  if (htmlLang && I18N_CUSTOM_PLAN[htmlLang]) return htmlLang;
  try {
    const saved = localStorage.getItem("cambm_locale");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.language && I18N_CUSTOM_PLAN[parsed.language]) {
        return parsed.language;
      }
    }
  } catch (e) { }
  return "en";
};

export default function CustomPlan() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState(getSavedLang);
  const [planNotes, setPlanNotes] = useState("");

  const [selectedServices, setSelectedServices] = useState(() => {
    try {
      const saved = localStorage.getItem("cambm_custom_plan");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed === "object" && parsed !== null) return parsed;
      }
    } catch (e) { }
    return {};
  });

  // Sync language with global i18n switcher
  useEffect(() => {
    const handleLocaleChange = (e) => {
      const newLang = e?.detail?.language || getSavedLang();
      if (I18N_CUSTOM_PLAN[newLang]) {
        setCurrentLang(newLang);
      }
    };

    document.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);

    const observer = new MutationObserver(() => {
      const currentHtmlLang = document.documentElement.lang;
      if (currentHtmlLang && I18N_CUSTOM_PLAN[currentHtmlLang] && currentHtmlLang !== currentLang) {
        setCurrentLang(currentHtmlLang);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang", "dir"],
    });

    return () => {
      document.removeEventListener("cambm:localechange", handleLocaleChange);
      window.removeEventListener("cambm:localechange", handleLocaleChange);
      window.removeEventListener("storage", handleLocaleChange);
      observer.disconnect();
    };
  }, [currentLang]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const revealEvent = new CustomEvent("cambm:revealed");
    document.dispatchEvent(revealEvent);
    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
    if (window.initI18n) {
      window.initI18n();
    }
  }, []);

  // Sync back to localStorage and notify other components
  const updateCartStorage = useCallback((newCart) => {
    setSelectedServices(newCart);
    try {
      localStorage.setItem("cambm_custom_plan", JSON.stringify(newCart));
    } catch (e) { }
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cambm:cart-updated", {
          detail: {
            count: Object.keys(newCart).length,
            items: newCart,
          },
        })
      );
    }
  }, []);

  const updateServiceQty = (key, delta) => {
    const next = { ...selectedServices };
    if (!next[key]) return;
    const newQty = (next[key].quantity || 1) + delta;
    if (newQty <= 0) {
      delete next[key];
    } else {
      next[key] = { ...next[key], quantity: newQty };
    }
    updateCartStorage(next);
  };

  const removeService = (key) => {
    const next = { ...selectedServices };
    delete next[key];
    updateCartStorage(next);
  };

  const clearAllServices = () => {
    updateCartStorage({});
    setPlanNotes("");
  };

  const t = useMemo(() => {
    return I18N_CUSTOM_PLAN[currentLang] || I18N_CUSTOM_PLAN.en;
  }, [currentLang]);

  const itemsList = useMemo(() => {
    return Object.values(selectedServices);
  }, [selectedServices]);

  const buildItems = useMemo(
    () => itemsList.filter((s) => (s.category || "").toLowerCase() === "build"),
    [itemsList]
  );
  const createItems = useMemo(
    () => itemsList.filter((s) => (s.category || "").toLowerCase() === "create"),
    [itemsList]
  );
  const growItems = useMemo(
    () => itemsList.filter((s) => (s.category || "").toLowerCase() === "grow"),
    [itemsList]
  );

  const totalCount = itemsList.length;

  const summaryText = useMemo(() => {
    const categories = { build: [], create: [], grow: [] };
    itemsList.forEach((srv) => {
      const cat = (srv.category || "build").toLowerCase();
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`${srv.quantity || 1}x ${srv.name}`);
    });

    const summaryParts = [];
    if (categories.build.length > 0) summaryParts.push(`BUILD: ${categories.build.join(", ")}`);
    if (categories.create.length > 0) summaryParts.push(`CREATE: ${categories.create.join(", ")}`);
    if (categories.grow.length > 0) summaryParts.push(`GROW: ${categories.grow.join(", ")}`);

    let res = `Custom Plan Request:\n${summaryParts.join("\n")}`;
    if (planNotes.trim()) {
      res += `\n\nClient Scope / Notes:\n${planNotes.trim()}`;
    }
    return res;
  }, [itemsList, planNotes]);

  const calLocale = useMemo(() => {
    return ["en", "es", "ar"].includes(currentLang) ? currentLang : "en";
  }, [currentLang]);

  const calConfigJson = useMemo(() => {
    return JSON.stringify({
      layout: "month_view",
      language: calLocale,
      locale: calLocale,
      notes: summaryText,
    });
  }, [calLocale, summaryText]);

  return (
    <div className="custom-plan-page">

      {/* Header (Shared exact match to Home Page) */}
      <header className="header" id="header">
        <div className="header-inner">
          <a
            href="/"
            className="logo js-logo-home"
            data-i18n-attr="aria-label:nav.homeAriaLabel"
            aria-label="Cambridge Marketing - back to top"
          >
            <img
              className="theme-logo"
              src="images/cambridge-logo.png"
              alt="Cambridge Marketing"
              width="133"
              height="40"
              style={{ height: "40px", width: "auto", display: "block" }}
            />
          </a>
          <nav className="nav">
            <a href="/#hero" className="nav-link" data-i18n="nav.home">
              Home
            </a>
            <a href="/#services" className="nav-link" data-i18n="nav.services">
              Services
            </a>
            <a href="/#why-CAMBM" className="nav-link" data-i18n="nav.whyCambm">
              Why CAMBM
            </a>
            <a href="/products" className="nav-link" data-i18n="nav.ourProducts">
              {t.ourProducts || "Our Products"}
            </a>
            <a href="/our-pricing" className="nav-link" data-i18n="nav.ourPricing">
              Pricing
            </a>
            <a href="/about" className="nav-link" data-i18n="nav.about">
              About
            </a>
          </nav>
          <div className="header-actions">
            <div className="locale-nav-picker">
              <select
                className="locale-select locale-country-select"
                aria-label="Country/Currency"
              ></select>
              <select
                className="locale-select locale-language-select"
                aria-label="Language"
              ></select>
            </div>
            <button
              type="button"
              className="theme-toggle"
              aria-label="Switch to light theme"
              aria-pressed="false"
              title="Change color theme"
              data-label-light="Switch to light theme"
              data-label-dark="Switch to dark theme"
              data-i18n-attr="data-label-light:theme.switchToLight,data-label-dark:theme.switchToDark,title:theme.title"
            >
              <svg
                className="theme-toggle-icon theme-toggle-moon"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M20.4 15.1A8.4 8.4 0 0 1 8.9 3.6 8.6 8.6 0 1 0 20.4 15.1Z" />
              </svg>
              <svg
                className="theme-toggle-icon theme-toggle-sun"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3.5" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>
            <button
              type="button"
              className="btn btn-primary js-open-cal"
              data-cal-link="cambridge.marketing"
              data-cal-namespace="strategy-call"
              data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
              data-i18n="nav.bookCall"
            >
              Book a strategy call
            </button>
          </div>
          <button
            className="nav-toggle"
            id="navToggle"
            aria-label="Open menu"
            aria-expanded="false"
            aria-controls="mobileNav"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile nav drawer */}
        <nav className="mobile-nav" id="mobileNav">
          <a href="/#hero" className="mobile-nav-link" data-i18n="nav.home">
            Home
          </a>
          <a href="/#services" className="mobile-nav-link" data-i18n="nav.services">
            Services
          </a>
          <a
            href="/#why-CAMBM"
            className="mobile-nav-link"
            data-i18n="nav.whyCambm"
          >
            Why CAMBM
          </a>
          <a href="/products" className="mobile-nav-link" data-i18n="nav.ourProducts">
            {t.ourProducts || "Our Products"}
          </a>
          <a href="/our-pricing" className="mobile-nav-link" data-i18n="nav.ourPricing">
            Pricing
          </a>
          <a href="/about" className="mobile-nav-link" data-i18n="nav.about">
            About
          </a>

          <div className="mobile-nav-actions">
            <div className="mobile-theme-row">
              <button
                type="button"
                className="theme-toggle"
                aria-label="Switch to light theme"
                aria-pressed="false"
                title="Change color theme"
                data-label-light="Switch to light theme"
                data-label-dark="Switch to dark theme"
                data-i18n-attr="data-label-light:theme.switchToLight,data-label-dark:theme.switchToDark,title:theme.title"
              >
                <svg
                  className="theme-toggle-icon theme-toggle-moon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20.4 15.1A8.4 8.4 0 0 1 8.9 3.6 8.6 8.6 0 1 0 20.4 15.1Z" />
                </svg>
                <svg
                  className="theme-toggle-icon theme-toggle-sun"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              </button>
            </div>
            <div className="locale-nav-picker locale-nav-picker-mobile">
              <select
                className="locale-select locale-country-select"
                aria-label="Country/Currency"
              ></select>
              <select
                className="locale-select locale-language-select"
                aria-label="Language"
              ></select>
            </div>
            <button
              type="button"
              className="btn btn-primary js-open-cal"
              data-cal-link="cambridge.marketing"
              data-cal-namespace="strategy-call"
              data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
              data-i18n="nav.bookCall"
            >
              Book a strategy call
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="custom-plan-main">
        <div className="custom-plan-container">

          {/* Breadcrumb / Back button */}
          <div className="custom-plan-top-bar">
            <Link
              to="/#services"
              className="custom-plan-back-link"
            >
              {t.backToHome}
            </Link>
          </div>

          {/* Heading */}
          <div className="custom-plan-heading">
            <p className="section-eyebrow">
              {t.badge}
            </p>
            <h1 className="custom-plan-title">
              {t.title}
            </h1>
            <p className="custom-plan-subtitle">
              {t.subtitle}
            </p>
          </div>

          {/* Cart Items Container */}
          {totalCount === 0 ? (
            <div className="custom-plan-empty-card">
              <div className="custom-plan-empty-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
              </div>
              <h3 className="custom-plan-empty-title">
                {t.emptyTitle}
              </h3>
              <p className="custom-plan-empty-subtitle">
                {t.emptySubtitle}
              </p>
              <Link to="/#services" className="btn btn-primary custom-plan-empty-btn">
                {t.browseServices} <span>→</span>
              </Link>
            </div>
          ) : (
            <div className="custom-plan-content">

              {/* BUILD Section */}
              {buildItems.length > 0 && (
                <div className="custom-plan-cat-card">
                  <div className="custom-plan-cat-header cat-build">
                    <span>{t.catBuild}</span>
                    <span className="cat-count">({buildItems.length})</span>
                  </div>

                  <div className="custom-plan-cat-items">
                    {buildItems.map((item) => (
                      <div key={item.key} className="plan-item-row">
                        <div className="plan-item-info">
                          <strong className="plan-item-name">{item.name}</strong>
                          {item.desc && (
                            <div className="plan-item-desc">{item.desc}</div>
                          )}
                        </div>

                        <div className="plan-item-controls">
                          <div className="srv-qty-stepper">
                            <button
                              type="button"
                              className="srv-qty-btn"
                              onClick={() => updateServiceQty(item.key, -1)}
                              title="Decrease"
                            >
                              −
                            </button>
                            <span className="srv-qty-val">{item.quantity || 1}</span>
                            <button
                              type="button"
                              className="srv-qty-btn"
                              onClick={() => updateServiceQty(item.key, 1)}
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="plan-item-remove"
                            onClick={() => removeService(item.key)}
                            title="Remove"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CREATE Section */}
              {createItems.length > 0 && (
                <div className="custom-plan-cat-card">
                  <div className="custom-plan-cat-header cat-create">
                    <span>{t.catCreate}</span>
                    <span className="cat-count">({createItems.length})</span>
                  </div>

                  <div className="custom-plan-cat-items">
                    {createItems.map((item) => (
                      <div key={item.key} className="plan-item-row">
                        <div className="plan-item-info">
                          <strong className="plan-item-name">{item.name}</strong>
                          {item.desc && (
                            <div className="plan-item-desc">{item.desc}</div>
                          )}
                        </div>

                        <div className="plan-item-controls">
                          <div className="srv-qty-stepper">
                            <button
                              type="button"
                              className="srv-qty-btn"
                              onClick={() => updateServiceQty(item.key, -1)}
                              title="Decrease"
                            >
                              −
                            </button>
                            <span className="srv-qty-val">{item.quantity || 1}</span>
                            <button
                              type="button"
                              className="srv-qty-btn"
                              onClick={() => updateServiceQty(item.key, 1)}
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="plan-item-remove"
                            onClick={() => removeService(item.key)}
                            title="Remove"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GROW Section */}
              {growItems.length > 0 && (
                <div className="custom-plan-cat-card">
                  <div className="custom-plan-cat-header cat-grow">
                    <span>{t.catGrow}</span>
                    <span className="cat-count">({growItems.length})</span>
                  </div>

                  <div className="custom-plan-cat-items">
                    {growItems.map((item) => (
                      <div key={item.key} className="plan-item-row">
                        <div className="plan-item-info">
                          <strong className="plan-item-name">{item.name}</strong>
                          {item.desc && (
                            <div className="plan-item-desc">{item.desc}</div>
                          )}
                        </div>

                        <div className="plan-item-controls">
                          <div className="srv-qty-stepper">
                            <button
                              type="button"
                              className="srv-qty-btn"
                              onClick={() => updateServiceQty(item.key, -1)}
                              title="Decrease"
                            >
                              −
                            </button>
                            <span className="srv-qty-val">{item.quantity || 1}</span>
                            <button
                              type="button"
                              className="srv-qty-btn"
                              onClick={() => updateServiceQty(item.key, 1)}
                              title="Increase"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="plan-item-remove"
                            onClick={() => removeService(item.key)}
                            title="Remove"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes & Specific Scope Box */}
              <div className="plan-notes-card">
                <label htmlFor="customPlanNotes" className="plan-notes-label">
                  {t.notesLabel}
                </label>
                <textarea
                  id="customPlanNotes"
                  className="plan-notes-textarea"
                  rows={4}
                  placeholder={t.notesPlaceholder}
                  value={planNotes}
                  onChange={(e) => setPlanNotes(e.target.value)}
                />
              </div>

              {/* Bottom Actions Bar */}
              <div className="custom-plan-actions-bar">
                <div className="custom-plan-actions-left">
                  <Link to="/#services" className="srv-select-btn plan-add-more-btn">
                    {t.addMore}
                  </Link>
                  <button
                    type="button"
                    className="plan-clear-btn"
                    onClick={clearAllServices}
                  >
                    {t.clearPlan}
                  </button>
                </div>

                <button
                  type="button"
                  className="plan-book-btn js-open-cal"
                  data-cal-link="cambridge.marketing"
                  data-cal-namespace="strategy-call"
                  data-cal-config={calConfigJson}
                >
                  {t.bookBtn}
                </button>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* Footer (Shared exact match to Home, About & Projects) */}
      <footer className="footer" id="footer">
        <div className="footer-inner">
          <FooterOffices />
          <div className="footer-bottom">
            <img
              className="theme-logo"
              src="images/cambridge-logo.png"
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
    </div>
  );
}
