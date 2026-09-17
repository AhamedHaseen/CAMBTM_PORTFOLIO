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

export default function OurPricing() {
  const [currentLang, setCurrentLang] = useState(getSavedLang);
  const [showCustomize, setShowCustomize] = useState(false);
  const [builderTab, setBuilderTab] = useState("build");
  const [selectedServices, setSelectedServices] = useState([]);

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
  }, []);

  useEffect(() => {
    if (window.__cambmLenis && typeof window.__cambmLenis.resize === "function") {
      window.__cambmLenis.resize();
    }
  }, [showCustomize, builderTab, selectedServices]);

  const handleConfirmCustomScope = (e) => {
    if (e) e.preventDefault();
    if (selectedServices.length === 0) return;

    // List all selected services cleanly for additional notes in Cal.com
    const servicesList = selectedServices
      .map((s, idx) => `${idx + 1}. ${s.name} (${s.category.toUpperCase()})`)
      .join("\n");

    const notesContent = `Selected Custom Scope (${selectedServices.length} services):\n${servicesList}`;
    const pkg = "Custom Package";

    const calConfig = {
      layout: "month_view",
      "Select-a-package": pkg,
      "Select a package": pkg,
      "select-a-package": pkg,
      "select_a_package": pkg,
      package: pkg,
      notes: notesContent,
      "additional-notes": notesContent,
      "additional_notes": notesContent,
    };

    if (window.Cal) {
      window.Cal("modal", {
        calLink: `cambridge.marketing?Select-a-package=${encodeURIComponent(pkg)}&select-a-package=${encodeURIComponent(pkg)}&package=${encodeURIComponent(pkg)}&notes=${encodeURIComponent(notesContent)}&additional-notes=${encodeURIComponent(notesContent)}`,
        config: calConfig,
      });
    } else {
      const calBtn = document.querySelector(".btn-primary.js-open-cal");
      if (calBtn) {
        calBtn.setAttribute("data-cal-config", JSON.stringify(calConfig));
        calBtn.click();
      } else {
        window.open(
          `https://cal.com/cambridge.marketing?Select-a-package=${encodeURIComponent(pkg)}&select-a-package=${encodeURIComponent(pkg)}&package=${encodeURIComponent(pkg)}&notes=${encodeURIComponent(notesContent)}`,
          "_blank",
          "noopener,noreferrer"
        );
      }
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

  const openCalModal = (packageName, e) => {
    if (e && e.preventDefault) e.preventDefault();
    const pkg = packageName || "";

    const calConfig = {
      layout: "month_view",
      "Select-a-package": pkg,
      "Select a package": pkg,
      "select-a-package": pkg,
      "select_a_package": pkg,
      package: pkg,
      notes: "", // Keep Additional notes empty so clients can type their own text
    };

    if (window.Cal) {
      window.Cal("modal", {
        calLink: `cambridge.marketing?Select-a-package=${encodeURIComponent(pkg)}&select-a-package=${encodeURIComponent(pkg)}&package=${encodeURIComponent(pkg)}&notes=`,
        config: calConfig,
      });
    } else {
      const calBtn = document.querySelector(".btn-primary.js-open-cal");
      if (calBtn) {
        calBtn.setAttribute("data-cal-config", JSON.stringify(calConfig));
        calBtn.click();
      } else {
        window.open(
          `https://cal.com/cambridge.marketing?Select-a-package=${encodeURIComponent(pkg)}&select-a-package=${encodeURIComponent(pkg)}&package=${encodeURIComponent(pkg)}&notes=`,
          "_blank",
          "noopener,noreferrer"
        );
      }
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
            className="logo js-logo-home"
            data-i18n-attr="aria-label:nav.homeAriaLabel"
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

      {/* Main Content: Packages Section */}
      <main className="pricing-page-main">
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
          </div>
        </section>

        {/* Section 2: Dedicated Customize Section */}
        <section className="pricing-custom-section" id="custom-scope">
          <div className="pricing-container">
            {/* Customize Header Row (Clean, no card border/background) */}
            <div className="pricing-customize-banner">
              <h2 className="pricing-customize-title">
                {currentLang === "es"
                  ? "¿Deseas personalizar tu propio paquete?"
                  : currentLang === "ar"
                  ? "هل ترغب في تخصيص باقتك الخاصة؟"
                  : currentLang === "si"
                  ? "ඔබේම සේවාවන් සකසා ගැනීමට අවශ්‍යද?"
                  : currentLang === "ta"
                  ? "உங்கள் சொந்த சேவைகளை தனிப்பயனாக்க வேண்டுமா?"
                  : "Want to customize your own package?"}
              </h2>
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
                        <div className="pricing-custom-summary-badge-row">
                          <span className="pricing-custom-summary-badge">
                            {selectedServices.length}{" "}
                            {selectedServices.length === 1 ? "Service" : "Services"} Selected
                          </span>
                          <button
                            type="button"
                            className="pricing-custom-reset-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedServices([]);
                            }}
                            title="Reset all selected services"
                          >
                            {currentLang === "es"
                              ? "Restablecer"
                              : currentLang === "ar"
                              ? "إعادة ضبط"
                              : currentLang === "si"
                              ? "යළි සකසන්න"
                              : currentLang === "ta"
                              ? "மீட்டமை"
                              : "Reset"}
                          </button>
                        </div>
                        <h4 className="pricing-custom-summary-title">
                          Your Selected Custom Scope
                        </h4>
                      </div>
                      <button
                        type="button"
                        className="pricing-custom-confirm-btn"
                        onClick={handleConfirmCustomScope}
                      >
                        {currentLang === "es"
                          ? "Confirmar"
                          : currentLang === "ar"
                          ? "تأكيد"
                          : currentLang === "si"
                          ? "තහවුරු කරන්න"
                          : currentLang === "ta"
                          ? "உறுதிப்படுத்துக"
                          : "Confirm"} <span>→</span>
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
