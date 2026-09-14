import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

  useEffect(() => {
    window.scrollTo(0, 0);

    // Update cart badge from localStorage
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

    // Initialize global theme and i18n
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
  }, []);

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
      {/* Header (Exact 1:1 Match to Cambridge Marketing) */}
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
            <a href="/#combo-packages" className="nav-link" data-i18n="nav.packages">
              Packages
            </a>
            <a href="/#why-CAMBM" className="nav-link" data-i18n="nav.whyCambm">
              Why CAMBM
            </a>
            <Link to="/products" className="nav-link" data-i18n="nav.ourProducts">
              Our Products
            </Link>
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
            <Link
              to="/custom-plan"
              className={`header-cart-btn js-open-plan-cart ${cartCount > 0 ? "has-items" : ""}`}
              aria-label="View Custom Services Cart"
              title="View Custom Services Cart"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
            </Link>
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
          <Link
            to="/custom-plan"
            className={`header-cart-btn mobile-header-cart js-open-plan-cart ${cartCount > 0 ? "has-items" : ""}`}
            aria-label="View Custom Services Cart"
            title="View Custom Services Cart"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {cartCount > 0 && <span className="header-cart-badge">{cartCount}</span>}
          </Link>
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

        {/* Mobile Nav Drawer */}
        <nav className="mobile-nav" id="mobileNav">
          <a href="/#hero" className="mobile-nav-link" data-i18n="nav.home">
            Home
          </a>
          <a href="/#services" className="mobile-nav-link" data-i18n="nav.services">
            Services
          </a>
          <a href="/#combo-packages" className="mobile-nav-link" data-i18n="nav.packages">
            Packages
          </a>
          <a href="/#why-CAMBM" className="mobile-nav-link" data-i18n="nav.whyCambm">
            Why CAMBM
          </a>
          <Link to="/products" className="mobile-nav-link" data-i18n="nav.ourProducts">
            Our Products
          </Link>
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

      {/* Main Products Content */}
      <main id="main-content">
        {/* A1. Hero with Breadcrumb and SystemWall */}
        <section className="cambt-hero">
          <div className="cambt-hero-inner">
            <nav aria-label="Breadcrumb" className="cambt-breadcrumb">
              <ol>
                <li>
                  <Link to="/">{copy.breadcrumb.home}</Link>
                </li>
                <li className="cambt-breadcrumb-sep">/</li>
                <li className="cambt-breadcrumb-current">{copy.breadcrumb.current}</li>
              </ol>
            </nav>

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
                    className="cambt-btn-primary js-open-cal"
                    data-cal-link="cambridge.marketing"
                    data-cal-namespace="strategy-call"
                    data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
                  >
                    {copy.hero.primaryAction.label}
                  </button>
                  <a className="cambt-btn-secondary" href="/#services">
                    {copy.hero.secondaryAction.label}
                  </a>
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
            <div className="cambt-section-head">
              <span className="cambt-label">{copy.index.label}</span>
              <h2>{copy.index.heading}</h2>
            </div>
            <SystemIndex industries={industries} labels={copy.index} systems={indexSystems} />
          </div>
        </section>

        {/* A5. Closing CTA */}
        <section className="cambt-cta-band">
          <div className="cambt-inner">
            <h2>{copy.contact.heading}</h2>
            <p>{copy.contact.body}</p>
            <button
              type="button"
              className="cambt-btn-cta js-open-cal"
              data-cal-link="cambridge.marketing"
              data-cal-namespace="strategy-call"
              data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
            >
              {copy.contact.action.label}
            </button>
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
