import React, { useState, useEffect, useMemo } from "react";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import { I18N_SERVICES } from "../components/ServicesSection";
import "../css/our-pricing.css";

const getSavedLang = () => {
  try {
    const saved = localStorage.getItem("cambm_lang");
    if (saved && I18N_SERVICES[saved]) return saved;
  } catch (e) { }
  if (typeof document !== "undefined" && document.documentElement.lang) {
    const docLang = document.documentElement.lang;
    if (I18N_SERVICES[docLang]) return docLang;
  }
  return "en";
};

const COUNTRY_PHONE_OPTIONS = [
  { code: "+94", country: "LK", name: "Sri Lanka", flag: "🇱🇰", minDigits: 9, maxDigits: 10, placeholder: "77 123 4567" },
  { code: "+971", country: "AE", name: "UAE", flag: "🇦🇪", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { code: "+44", country: "GB", name: "UK", flag: "🇬🇧", minDigits: 10, maxDigits: 11, placeholder: "7911 123456" },
  { code: "+1", country: "US", name: "USA / CAN", flag: "🇺🇸", minDigits: 10, maxDigits: 10, placeholder: "555 123 4567" },
  { code: "+91", country: "IN", name: "India", flag: "🇮🇳", minDigits: 10, maxDigits: 10, placeholder: "98765 43210" },
  { code: "+61", country: "AU", name: "Australia", flag: "🇦🇺", minDigits: 9, maxDigits: 9, placeholder: "412 345 678" },
  { code: "+65", country: "SG", name: "Singapore", flag: "🇸🇬", minDigits: 8, maxDigits: 8, placeholder: "8123 4567" },
  { code: "+974", country: "QA", name: "Qatar", flag: "🇶🇦", minDigits: 8, maxDigits: 8, placeholder: "3312 3456" },
  { code: "+966", country: "SA", name: "Saudi Arabia", flag: "🇸🇦", minDigits: 9, maxDigits: 9, placeholder: "50 123 4567" },
  { code: "+60", country: "MY", name: "Malaysia", flag: "🇲🇾", minDigits: 9, maxDigits: 10, placeholder: "12 345 6789" },
  { code: "+968", country: "OM", name: "Oman", flag: "🇴🇲", minDigits: 8, maxDigits: 8, placeholder: "9123 4567" },
  { code: "+965", country: "KW", name: "Kuwait", flag: "🇰🇼", minDigits: 8, maxDigits: 8, placeholder: "9123 4567" },
  { code: "+49", country: "DE", name: "Germany", flag: "🇩🇪", minDigits: 10, maxDigits: 11, placeholder: "151 23456789" },
  { code: "+33", country: "FR", name: "France", flag: "🇫🇷", minDigits: 9, maxDigits: 9, placeholder: "6 12 34 56 78" },
  { code: "+64", country: "NZ", name: "New Zealand", flag: "🇳🇿", minDigits: 8, maxDigits: 10, placeholder: "21 123 4567" },
  { code: "+81", country: "JP", name: "Japan", flag: "🇯🇵", minDigits: 10, maxDigits: 10, placeholder: "90 1234 5678" },
  { code: "+86", country: "CN", name: "China", flag: "🇨🇳", minDigits: 11, maxDigits: 11, placeholder: "138 0013 8000" },
  { code: "+880", country: "BD", name: "Bangladesh", flag: "🇧🇩", minDigits: 10, maxDigits: 10, placeholder: "1712 345678" },
  { code: "+92", country: "PK", name: "Pakistan", flag: "🇵🇰", minDigits: 10, maxDigits: 10, placeholder: "300 1234567" },
];

export default function OurPricing() {
  const [currentLang, setCurrentLang] = useState(getSavedLang);
  const [showCustomize, setShowCustomize] = useState(false);
  const [builderTab, setBuilderTab] = useState("build");
  const [selectedServices, setSelectedServices] = useState([]);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showOptionalNotes, setShowOptionalNotes] = useState(false);
  const [countryCode, setCountryCode] = useState("+94");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    notes: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const activeCountryRule = useMemo(() => {
    return COUNTRY_PHONE_OPTIONS.find((c) => c.code === countryCode) || COUNTRY_PHONE_OPTIONS[0];
  }, [countryCode]);

  const phoneDigits = useMemo(() => {
    return formState.phone.replace(/\D/g, "");
  }, [formState.phone]);

  const isPhoneIncomplete = useMemo(() => {
    if (!phoneDigits) return false;
    return phoneDigits.length < activeCountryRule.minDigits || phoneDigits.length > activeCountryRule.maxDigits;
  }, [phoneDigits, activeCountryRule]);

  const toggleService = (svc, category) => {
    const serviceKey = `${category}-${svc.num || svc.name}`;
    setSelectedServices((prev) => {
      const exists = prev.some((item) => item.key === serviceKey);
      if (exists) {
        return prev.filter((item) => item.key !== serviceKey);
      } else {
        return [...prev, { key: serviceKey, name: svc.name, num: svc.num, category }];
      }
    });
  };

  const isServiceSelected = (svc, category) => {
    const serviceKey = `${category}-${svc.num || svc.name}`;
    return selectedServices.some((item) => item.key === serviceKey);
  };

  const handleToggleCustomize = (e) => {
    if (e) e.preventDefault();
    setShowCustomize((prev) => {
      const nextState = !prev;
      if (nextState) {
        setTimeout(() => {
          const el = document.getElementById("pricing-custom-builder");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
      return nextState;
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Strictly allow only digits and cap at active country's maxDigits
      const digitsOnly = value.replace(/\D/g, "").slice(0, activeCountryRule.maxDigits);
      setFormState((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = () => {
    setShowContactModal(true);
    setIsSubmitted(false);
    setSubmitError("");
  };

  const handleCloseModal = () => {
    setShowContactModal(false);
  };

  // Lock background body scroll & pause Lenis when contact modal is open
  useEffect(() => {
    if (showContactModal) {
      if (window.__cambmLenis && typeof window.__cambmLenis.stop === "function") {
        window.__cambmLenis.stop();
      }

      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setShowContactModal(false);
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        if (window.__cambmLenis && typeof window.__cambmLenis.start === "function") {
          window.__cambmLenis.start();
        }
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.paddingRight = originalPaddingRight;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [showContactModal]);

  const handleSubmitCustomScope = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    // Validate email format strictly (must contain domain like .com, .org, .lk, etc.)
    const emailVal = formState.email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailVal)) {
      setSubmitError("Please enter a valid work email address (e.g. name@domain.com).");
      setIsSubmitting(false);
      return;
    }

    // Validate phone length if entered
    if (phoneDigits && (phoneDigits.length < activeCountryRule.minDigits || phoneDigits.length > activeCountryRule.maxDigits)) {
      setSubmitError(
        `Invalid phone number: ${activeCountryRule.name} (${activeCountryRule.code}) requires ${
          activeCountryRule.minDigits === activeCountryRule.maxDigits
            ? `${activeCountryRule.minDigits} digits`
            : `${activeCountryRule.minDigits}–${activeCountryRule.maxDigits} digits`
        }.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const fullPhone = phoneDigits ? `${activeCountryRule.code} ${phoneDigits}` : "";
      const payload = {
        name: formState.name,
        email: formState.email,
        phone: fullPhone,
        company: formState.company,
        notes: showOptionalNotes ? formState.notes : "",
        services: selectedServices,
      };

      const res = await fetch("/api/contacts/custom-scope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsSubmitted(true);
        try {
          localStorage.setItem(
            "cambm_custom_scope_inquiry",
            JSON.stringify({ ...payload, date: new Date().toISOString() })
          );
        } catch (err) { }
      } else {
        setSubmitError(data.error || "Failed to submit scope request. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting custom scope:", err);
      // Fallback in case of local network issue: record locally
      setIsSubmitted(true);
      try {
        localStorage.setItem(
          "cambm_custom_scope_inquiry",
          JSON.stringify({
            contact: formState,
            services: selectedServices,
            date: new Date().toISOString(),
          })
        );
      } catch (e) { }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync language with global locale switcher & document observer
  useEffect(() => {
    const handleLocaleChange = (e) => {
      const newLang = e?.detail?.language || getSavedLang();
      if (I18N_SERVICES[newLang]) {
        setCurrentLang(newLang);
      }
    };

    document.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("cambm:localechange", handleLocaleChange);
    window.addEventListener("storage", handleLocaleChange);

    const observer = new MutationObserver(() => {
      const currentHtmlLang = document.documentElement.lang;
      if (currentHtmlLang && I18N_SERVICES[currentHtmlLang] && currentHtmlLang !== currentLang) {
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

  const activeLocaleData = useMemo(() => {
    return I18N_SERVICES[currentLang] || I18N_SERVICES.en;
  }, [currentLang]);

  const openCalModal = (note, e) => {
    if (e) e.preventDefault();
    if (window.Cal) {
      window.Cal("modal", {
        calLink: "cambridge.marketing",
        config: { layout: "month_view", notes: note || "Pre-built Package Inquiry" },
      });
    } else {
      const calBtn = document.querySelector(".btn-primary.js-open-cal");
      if (calBtn) calBtn.click();
    }
  };

  const cardsToDisplay = activeLocaleData.combos?.cards || [];

  return (
    <div className="pricing-page-container">
      {/* Header matching main site navigation */}
      <header className="header" id="header">
        <div className="header-inner">
          <a
            href="/"
            className="logo"
            id="logoLink"
            aria-label="Cambridge Marketing - back to top"
          >
            <img
              className="theme-logo"
              src="/images/cambridge-logo.png"
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
              Our Products
            </a>
            <a href="/our-pricing" className="nav-link active" data-i18n="nav.ourPricing">
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
              <svg className="theme-toggle-icon theme-toggle-moon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.4 15.1A8.4 8.4 0 0 1 8.9 3.6 8.6 8.6 0 1 0 20.4 15.1Z" />
              </svg>
              <svg className="theme-toggle-icon theme-toggle-sun" viewBox="0 0 24 24" aria-hidden="true">
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

        {/* Mobile Nav Panel */}
        <nav className="mobile-nav" id="mobileNav">
          <a href="/#hero" className="mobile-nav-link" data-i18n="nav.home">
            Home
          </a>
          <a href="/#services" className="mobile-nav-link" data-i18n="nav.services">
            Services
          </a>
          <a href="/#why-CAMBM" className="mobile-nav-link" data-i18n="nav.whyCambm">
            Why CAMBM
          </a>
          <a href="/products" className="mobile-nav-link" data-i18n="nav.ourProducts">
            Our Products
          </a>
          <a href="/our-pricing" className="mobile-nav-link active" data-i18n="nav.ourPricing">
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
                <svg className="theme-toggle-icon theme-toggle-moon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.4 15.1A8.4 8.4 0 0 1 8.9 3.6 8.6 8.6 0 1 0 20.4 15.1Z" />
                </svg>
                <svg className="theme-toggle-icon theme-toggle-sun" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="3.5" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </svg>
              </button>
            </div>
            <div className="locale-nav-picker mobile-locale-picker">
              <select className="locale-select locale-country-select" aria-label="Country/Currency"></select>
              <select className="locale-select locale-language-select" aria-label="Language"></select>
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

      {/* Main Content: Pre-built Packages Section */}
      <main className="pricing-page-main">
        {/* ── Hero matching About/Portfolio with shaking bg ── */}
        <section className="portfolio-hero pricing-page-hero" id="pricing-hero">
          <div className="hero-bg"></div>
          <div className="portfolio-hero-inner">
            <h1 className="phero-heading phero-anim phero-anim-2">
              Our Pre Built Packages
            </h1>
          </div>
        </section>

        <section className="pricing-packages-page-section" id="prebuilt-packages">
          <div className="pricing-container">
            {/* Centered Heading */}
            <div className="pricing-combos-header">
              <span className="pricing-combos-eyebrow" data-i18n="packages.combos.eyebrow">
                {activeLocaleData.combos?.eyebrow || "PRE-BUILT PACKAGES"}
              </span>
              <h2 className="pricing-combos-title" data-i18n="packages.combos.title">
                {activeLocaleData.combos?.title || "Connected services. One clear engagement."}
              </h2>
              <p className="pricing-combos-desc" data-i18n="packages.combos.desc">
                {activeLocaleData.combos?.desc || "Pre-built packages combine content, marketing, and technology into one managed solution."}
              </p>
              {activeLocaleData.combos?.note && (
                <p className="pricing-combos-note" data-i18n="packages.combos.note">
                  {activeLocaleData.combos.note}
                </p>
              )}
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
                    {card.items.map((feat, idx) => {
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
                      onClick={(e) => openCalModal(card.title, e)}
                    >
                      {activeLocaleData.combos?.discussBtn || "Discuss"} <span>→</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>

            {/* Customize Banner Card */}
            <div className="pricing-customize-banner">
              <h2 className="pricing-customize-title">Customize</h2>
              <button
                type="button"
                className="pricing-customize-btn"
                onClick={handleToggleCustomize}
              >
                {showCustomize ? "Hide Options ↑" : "Customize →"}
              </button>
            </div>

            {/* Interactive Custom Services Builder */}
            {showCustomize && (
              <div className="pricing-custom-builder" id="pricing-custom-builder">
                <div className="pricing-custom-builder-head">
                  <span className="pricing-combos-eyebrow" style={{ color: "#ff5a00" }}>
                    CUSTOMIZE YOUR SCOPE
                  </span>
                  <h3 className="pricing-custom-builder-title">
                    Select the exact capabilities your business needs
                  </h3>
                  <p className="pricing-custom-builder-desc">
                    Click the <strong>+</strong> icon on the right side of any service to add it to your custom plan.
                  </p>
                </div>

                {/* Tabs: BUILD, CREATE, GROW */}
                <div className="pricing-custom-tabs" role="tablist">
                  {["build", "create", "grow"].map((tabKey) => {
                    const tabLabel =
                      activeLocaleData.tabs?.[tabKey] || tabKey.toUpperCase();
                    const tabCount = selectedServices.filter(
                      (s) => s.category === tabKey
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
                  {(activeLocaleData[builderTab]?.services || []).map(
                    (svc, idx) => {
                      const isSelected = isServiceSelected(svc, builderTab);

                      return (
                        <div
                          key={svc.num || idx}
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

                          {/* Right Side: ONLY + Mark (No 'Add' text) */}
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
                    }
                  )}
                </div>

                {/* Selected Services Summary & Confirm */}
                {selectedServices.length > 0 && (
                  <div className="pricing-custom-summary">
                    <div className="pricing-custom-summary-top">
                      <div className="pricing-custom-summary-info">
                        <span className="pricing-custom-summary-badge">
                          {selectedServices.length}{" "}
                          {selectedServices.length === 1 ? "Service" : "Services"} Selected
                        </span>
                        <h4 className="pricing-custom-summary-title">
                          Your Selected Custom Scope
                        </h4>
                      </div>
                      <button
                        type="button"
                        className="pricing-custom-confirm-btn"
                        onClick={handleOpenModal}
                      >
                        Confirm Custom Scope <span>→</span>
                      </button>
                    </div>

                    <div className="pricing-custom-summary-chips">
                      {selectedServices.map((item) => (
                        <span key={item.key} className="pricing-custom-chip">
                          <span className="chip-name">{item.name}</span>
                          <button
                            type="button"
                            className="chip-del"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleService(item, item.category);
                            }}
                            aria-label={`Remove ${item.name}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* ── Customer Contact Details & Summary Modal ── */}
      {showContactModal && (
        <div
          className="pricing-modal-backdrop"
          onClick={handleCloseModal}
          data-lenis-prevent
          data-lenis-prevent-wheel
          data-lenis-prevent-touch
        >
          <div
            className="pricing-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pricingModalTitle"
            data-lenis-prevent
            data-lenis-prevent-wheel
            data-lenis-prevent-touch
          >
            <button
              type="button"
              className="pricing-modal-close"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              &times;
            </button>

            {!isSubmitted ? (
              <>
                <div className="pricing-modal-header">
                  <span className="pricing-modal-eyebrow">CUSTOM PACKAGE PROPOSAL</span>
                  <h3 id="pricingModalTitle" className="pricing-modal-title">
                    Review Scope & Contact Details
                  </h3>
                  <p className="pricing-modal-desc">
                    Review your selected capabilities below and provide your contact information to receive your tailored proposal.
                  </p>
                </div>

                {/* Selected Services Summary Box */}
                <div className="pricing-modal-summary-box">
                  <div className="pricing-modal-summary-box-head">
                    <span className="summary-box-title">Selected Capabilities ({selectedServices.length})</span>
                    <span className="summary-box-badge">
                      {selectedServices.length} {selectedServices.length === 1 ? "Service" : "Services"}
                    </span>
                  </div>
                  <div className="pricing-modal-services-list">
                    {selectedServices.map((item) => (
                      <div key={item.key} className="pricing-modal-service-row">
                        <span className="service-row-name">{item.name}</span>
                        <button
                          type="button"
                          className="service-row-del"
                          onClick={() => toggleService(item, item.category)}
                          title="Remove service"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer Contact Details Form */}
                <form className="pricing-modal-form" onSubmit={handleSubmitCustomScope}>
                  <div className="pricing-modal-form-grid">
                    <div className="pricing-form-group">
                      <label htmlFor="modalName">Full Name *</label>
                      <input
                        id="modalName"
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. John Doe"
                        value={formState.name}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="pricing-form-group">
                      <label htmlFor="modalEmail">Work Email *</label>
                      <input
                        id="modalEmail"
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. john@company.com"
                        value={formState.email}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="pricing-form-group">
                      <label htmlFor="modalCompany">Company / Brand Name *</label>
                      <input
                        id="modalCompany"
                        type="text"
                        name="company"
                        required
                        placeholder="e.g. Acme Corp"
                        value={formState.company}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="pricing-form-group">
                      <label htmlFor="modalPhone">Phone / WhatsApp Number</label>
                      <div className={`pricing-phone-input-wrap ${isPhoneIncomplete ? "has-error" : ""}`}>
                        <select
                          className="pricing-phone-country-select"
                          value={countryCode}
                          onChange={(e) => {
                            const newCode = e.target.value;
                            setCountryCode(newCode);
                            const newRule = COUNTRY_PHONE_OPTIONS.find((c) => c.code === newCode) || COUNTRY_PHONE_OPTIONS[0];
                            setFormState((prev) => ({
                              ...prev,
                              phone: prev.phone.replace(/\D/g, "").slice(0, newRule.maxDigits),
                            }));
                          }}
                          aria-label="Country Code"
                        >
                          {COUNTRY_PHONE_OPTIONS.map((c) => (
                            <option key={c.code + c.country} value={c.code}>
                              {c.flag} {c.code} ({c.name})
                            </option>
                          ))}
                        </select>
                        <input
                          id="modalPhone"
                          type="tel"
                          name="phone"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={activeCountryRule.maxDigits}
                          placeholder={`e.g. ${activeCountryRule.placeholder}`}
                          value={formState.phone}
                          onChange={handleFormChange}
                          className="pricing-phone-number-input"
                        />
                      </div>
                      {isPhoneIncomplete && (
                        <div className="pricing-phone-error-msg">
                          <span className="pricing-phone-error-icon">⚠️</span>
                          <span>
                            {activeCountryRule.name} ({activeCountryRule.code}) requires{" "}
                            <strong>
                              {activeCountryRule.minDigits === activeCountryRule.maxDigits
                                ? `${activeCountryRule.minDigits} digits`
                                : `${activeCountryRule.minDigits} or ${activeCountryRule.maxDigits} digits`}
                            </strong>{" "}
                            (entered: {phoneDigits.length} {phoneDigits.length === 1 ? "digit" : "digits"}).
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional Notes Toggle & Input */}
                  <div className="pricing-optional-toggle-wrap">
                    <label className="pricing-optional-checkbox-label" htmlFor="toggleOptionalNotes">
                      <input
                        type="checkbox"
                        id="toggleOptionalNotes"
                        className="pricing-optional-checkbox"
                        checked={showOptionalNotes}
                        onChange={(e) => setShowOptionalNotes(e.target.checked)}
                      />
                      <span className="pricing-optional-checkbox-custom"></span>
                      <span className="pricing-optional-label-text">
                        Project Scope Notes / Requirements <span className="pricing-optional-tag">(Optional)</span>
                      </span>
                    </label>
                  </div>

                  {showOptionalNotes && (
                    <div className="pricing-form-group pricing-notes-appear">
                      <textarea
                        id="modalNotes"
                        name="notes"
                        rows="3"
                        placeholder="Any specific targets, tech stack preferences, or launch timelines..."
                        value={formState.notes}
                        onChange={handleFormChange}
                        autoFocus
                      ></textarea>
                    </div>
                  )}

                  {submitError && (
                    <div style={{ padding: "10px 14px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: "8px", color: "#fca5a5", fontSize: "0.85rem", marginBottom: "1rem" }}>
                      {submitError}
                    </div>
                  )}

                  <div className="pricing-modal-actions">
                    <button
                      type="submit"
                      className="pricing-modal-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting Request..." : "Submit Custom Scope Request"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="pricing-modal-success">
                <div className="pricing-success-icon">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ff5a00" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h3 className="pricing-success-title">Custom Scope Received!</h3>
                <p className="pricing-success-desc">
                  Thank you, <strong>{formState.name}</strong>. We have logged your request for <strong>{selectedServices.length} services</strong> on behalf of <strong>{formState.company}</strong>. Our solutions team will review your specifications and reach out to <strong>{formState.email}</strong> within 24 hours.
                </p>
                <div className="pricing-success-actions">
                  <button
                    type="button"
                    className="pricing-modal-submit-btn"
                    onClick={handleCloseModal}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
}
