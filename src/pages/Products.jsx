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

    let targetSlug = "";
    if (location.hash) {
      targetSlug = location.hash.replace(/^#/, "");
    }
    if (!targetSlug) {
      try {
        const saved = sessionStorage.getItem("cambm_last_product_slug");
        if (saved) targetSlug = saved;
      } catch (e) { }
    }

    if (targetSlug) {
      try {
        sessionStorage.removeItem("cambm_last_product_slug");
      } catch (e) { }

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
      // Always start immediately from the very first top section (hero)
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
        window.__cambmLenis.scrollTo(0, { immediate: true });
      }
    }

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
            <a href="/#combo-packages" className="nav-link" data-i18n="nav.packages">
              Packages
            </a>
            <a href="/#why-CAMBM" className="nav-link" data-i18n="nav.whyCambm">
              Why CAMBM
            </a>
            <a href="/products" className="nav-link active" data-i18n="nav.ourProducts">
              Our Products
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
            <a
              href="/custom-plan"
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
            </a>
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
          <a
            href="/custom-plan"
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
          </a>
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
          <a href="/#combo-packages" className="mobile-nav-link" data-i18n="nav.packages">
            Packages
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
      {/* Dims the page behind the open mobile nav; clicking it closes the menu */}
      <div className="mobile-nav-backdrop" id="mobileNavBackdrop"></div>

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

      {/* First-visit locale picker popup (modal) */}
      <div className="locale-popup-backdrop" id="localePopupBackdrop">
        <div
          className="locale-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Select your region"
        >
          <h3 className="locale-popup-title" data-i18n="locale.popupTitle">
            Choose your language
          </h3>
          <p className="locale-popup-desc" data-i18n="locale.popupDesc">
            We'll tailor the language to you.
          </p>

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

      {/* Enterprise contact-form popup */}
      <div className="contact-popup-backdrop" id="contactPopupBackdrop">
        <div
          className="contact-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Contact us"
        >
          <button
            className="contact-popup-close"
            id="contactPopupClose"
            aria-label="Close"
          >
            &#10005;
          </button>
          <h3 className="contact-popup-title" data-i18n="contact.title">
            Contact Enterprise Sales
          </h3>
          <p className="contact-popup-desc" data-i18n="contact.desc">
            Tell us about your business and we'll get back to you shortly.
          </p>
          <form id="contactForm" className="contact-form">
            <label htmlFor="contactName" data-i18n="contact.nameLabel">
              Full name
            </label>
            <input
              id="contactName"
              type="text"
              name="name"
              required
              minLength="2"
              maxLength="100"
              pattern="[\p{L}\p{M}\s.'\-]{2,100}"
              title="Please enter a name using letters only (no numbers or symbols)"
            />
            <label htmlFor="contactEmail" data-i18n="contact.emailLabel">
              Email
            </label>
            <input
              id="contactEmail"
              type="email"
              name="email"
              required
              maxLength="150"
            />
            <label htmlFor="contactCompany" data-i18n="contact.companyLabel">
              Company
            </label>
            <input
              id="contactCompany"
              type="text"
              name="company"
              minLength="2"
              maxLength="100"
            />
            <label htmlFor="contactPhone" data-i18n="contact.phoneLabel">
              Phone (optional)
            </label>
            <input
              id="contactPhone"
              type="tel"
              name="phone"
              pattern="\+[0-9][0-9\s\-]{6,18}"
              placeholder="+94 77 123 4567"
              title="Include your country code, e.g. +94 77 123 4567"
            />
            <label htmlFor="contactMessage" data-i18n="contact.messageLabel">
              Message
            </label>
            <textarea
              id="contactMessage"
              name="message"
              rows="4"
              required
              minLength="10"
              maxLength="2000"
            ></textarea>
            <input
              type="hidden"
              name="_subject"
              value="Enterprise inquiry - Cambridge Marketing"
            />
            <button
              type="submit"
              className="btn btn-primary contact-form-submit"
              data-i18n="contact.send"
            >
              Send message
            </button>
            <p
              className="contact-form-status"
              id="contactFormStatus"
              role="status"
              aria-live="polite"
            ></p>
          </form>
        </div>
      </div>
    </div>
  );
}
