import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import SystemWall from "../components/products/SystemWall";
import AdaptationArgument from "../components/products/AdaptationArgument";
import FittedField from "../components/products/FittedField";
import SystemIndex from "../components/products/SystemIndex";
import { products, productIndustries } from "../content/products/productsData";
import { productScreens } from "../content/products/productScreensData";
import { productsIndexContent } from "../content/products/productsPageContent";
import "../css/products.css";

export default function Products() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

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

  const wallSystems = useMemo(() => {
    return products.map((p) => ({
      slug: p.slug,
      name: p.name,
      label: p.shortName || p.name,
    }));
  }, []);

  const indexSystems = useMemo(() => {
    return products.map((p) => ({
      slug: p.slug,
      name: p.name,
      positioning: p.positioning,
      category: p.category,
      industries: p.industries,
      screenCount: (productScreens[p.slug] || []).length,
    }));
  }, []);

  const industries = useMemo(() => productIndustries(), []);
  const copy = productsIndexContent;

  return (
    <div className="cambm-products-page">
      {/* Header (Exact 1:1 Copy from Home Page) */}
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
            <a href="/products" className="nav-link active" data-i18n="nav.ourProducts">
              Our Products
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

        {/* Mobile nav panel */}
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
            Our Products
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
      {/* Dims the page behind the open mobile nav */}
      <div className="mobile-nav-backdrop" id="mobileNavBackdrop"></div>

      {/* Main Products Content */}
      <main id="main-content">
        {/* A1. Hero with SystemWall */}
        <section className="cambt-hero">
          <div className="cambt-hero-inner">
            <div className="cambt-hero-grid">
              <div className="cambt-hero-content">
                <span className="cambt-label">{copy.hero.label}</span>
                <h1>
                  Systems that <em>{copy.hero.emphasis}</em> the business
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
                    Book a strategy call <span>&rarr;</span>
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
                <p
                  style={{
                    maxWidth: "50rem",
                    marginTop: "0.85rem",
                    color: "var(--cambt-color-text-secondary)",
                    fontSize: "1.05rem",
                    lineHeight: "1.65",
                  }}
                >
                  {copy.index.description}
                </p>
              )}
            </div>
            <SystemIndex industries={industries} labels={copy.index} systems={indexSystems} />
          </div>
        </section>
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
    </div>
  );
}
