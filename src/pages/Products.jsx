import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import CtaSection from "../components/CtaSection";
import SystemWall from "../components/products/SystemWall";
import AdaptationArgument from "../components/products/AdaptationArgument";
import FittedField from "../components/products/FittedField";
import SystemIndex from "../components/products/SystemIndex";
import { getProducts, productIndustries } from "../content/products/productsData";
import { productScreens } from "../content/products/productScreensData";
import { getProductsPageContent } from "../content/products/productsPageContent";
import "../css/products.css";

const getSavedLang = () => {
  if (typeof window !== "undefined" && typeof window.cambmGetLanguage === "function") {
    const l = window.cambmGetLanguage();
    if (l) return l;
  }
  try {
    const saved = localStorage.getItem("cambm_lang");
    if (saved) return saved;
  } catch (e) {}
  if (typeof document !== "undefined" && document.documentElement && document.documentElement.lang) {
    return document.documentElement.lang;
  }
  return "en";
};

export default function Products() {
  const [cartCount, setCartCount] = useState(0);
  const [currentLang, setCurrentLang] = useState(() => getSavedLang());
  const location = useLocation();

  useEffect(() => {
    const handleLocaleChange = (e) => {
      const nextLang = e?.detail?.language || getSavedLang();
      setCurrentLang((prev) => (prev !== nextLang ? nextLang : prev));
    };

    window.addEventListener("cambm:localechange", handleLocaleChange);
    document.addEventListener("cambm:localechange", handleLocaleChange);

    const observer = new MutationObserver(() => {
      const nextLang = document.documentElement.lang || getSavedLang();
      setCurrentLang((prev) => (prev !== nextLang ? nextLang : prev));
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["lang"],
      });
    }

    return () => {
      window.removeEventListener("cambm:localechange", handleLocaleChange);
      document.removeEventListener("cambm:localechange", handleLocaleChange);
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
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const targetSlug = location.hash ? location.hash.replace("#", "") : "";

    if (targetSlug) {
      const scrollToTarget = () => {
        const cleanSlug = targetSlug.replace(/^product-/, "");
        const el =
          document.getElementById(targetSlug) ||
          document.getElementById(`product-${cleanSlug}`) ||
          document.getElementById(cleanSlug) ||
          document.getElementById("catalogue") ||
          document.getElementById("what-we-can-deploy") ||
          document.getElementById("index");

        if (el) {
          if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
            window.__cambmLenis.scrollTo(el, { offset: -90, duration: 1.2 });
          } else {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 90;
            window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
          }
        }
      };

      const hashTimer = setTimeout(scrollToTarget, 100);
      return () => clearTimeout(hashTimer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
        window.__cambmLenis.scrollTo(0, { immediate: true });
      }
    }

    try {
      const saved = localStorage.getItem("cambm_custom_plan");
      if (saved) {
        const parsed = JSON.parse(saved);
        setCartCount(Object.keys(parsed || {}).length);
      }
    } catch (e) { }

    const handleCartUpdated = (e) => {
      setCartCount(e?.detail?.count || 0);
    };

    window.addEventListener("cambm:cart-updated", handleCartUpdated);

    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
    if (window.initI18n) {
      window.initI18n();
    }

    const revealEvent = new CustomEvent("cambm:revealed");
    document.dispatchEvent(revealEvent);

    return () => {
      window.removeEventListener("cambm:cart-updated", handleCartUpdated);
    };
  }, [location.hash, location.pathname, location.state]);

  const copy = useMemo(() => getProductsPageContent(currentLang), [currentLang]);
  const productList = useMemo(() => getProducts(currentLang), [currentLang]);

  const wallSystems = useMemo(() => {
    return productList.map((p) => ({
      slug: p.slug,
      name: p.name,
      label: p.shortName || p.name,
    }));
  }, [productList]);

  const indexSystems = useMemo(() => {
    return productList.map((p) => ({
      slug: p.slug,
      name: p.name,
      positioning: p.positioning,
      category: p.category,
      industries: p.industries,
      screenCount: (productScreens[p.slug] || []).length,
    }));
  }, [productList]);

  const industries = useMemo(() => productIndustries(currentLang), [currentLang]);

  return (
    <div className="cambm-products-page">
      {/* Main Products Content */}
      <main id="main-content">
        {/* A1. Hero with SystemWall */}
        <section className="cambt-hero">
          <div className="cambt-hero-inner">
            <div className="cambt-hero-grid">
              <div className="cambt-hero-content">
                <span className="cambt-label">{copy.hero.label}</span>
                <h1>
                  {currentLang === "en" ? (
                    <>
                      Systems that <em>{copy.hero.emphasis}</em> the business
                    </>
                  ) : (
                    copy.hero.title || (
                      <>
                        Systems that <em>{copy.hero.emphasis}</em> the business
                      </>
                    )
                  )}
                </h1>
                <p className="cambt-hero-lead">{copy.hero.lead}</p>
                <div className="cambt-hero-actions">
                  <button
                    type="button"
                    className="cambt-btn-hero-discuss js-open-cal"
                    data-cal-link="cambridge.marketing"
                    data-cal-namespace="strategy-call"
                    data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
                  >
                    {copy.hero.primaryAction?.label || "Book a strategy call"} <span>&rarr;</span>
                  </button>
                </div>
              </div>

              <div className="cambt-hero-visual">
                <SystemWall systems={wallSystems} />
              </div>
            </div>
          </div>
        </section>

        {/* A2. How we are different (Diptych) */}
        <section className="cambt-section cambt-section-white">
          <div className="cambt-inner">
            <AdaptationArgument copy={copy.adaptation} />
          </div>
        </section>

        {/* A3. How they are delivered (FittedField) */}
        <section className="cambt-section cambt-section-pale">
          <div className="cambt-inner">
            <FittedField copy={copy.customisation} />
          </div>
        </section>

        {/* A4. The systems (SystemIndex) */}
        <section className="cambt-section cambt-section-white" id="catalogue">
          <div className="cambt-inner">
            <div className="cambt-section-head" style={{ marginBottom: "2.5rem" }}>
              <span className="cambt-label">{copy.index.label}</span>
              <h2>{copy.index.heading}</h2>
              {copy.index.description && (
                <p className="cambt-index-desc">
                  {copy.index.description}
                </p>
              )}
            </div>
            <SystemIndex industries={industries} labels={copy.index} systems={indexSystems} />
          </div>
        </section>

        {/* CTA Section */}
        <CtaSection />
      </main>

      {/* Footer (Exact 1:1 Match to Cambridge Marketing) */}
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
