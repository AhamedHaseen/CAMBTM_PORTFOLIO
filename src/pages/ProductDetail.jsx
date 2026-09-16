import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import ScreenStack from "../components/products/ScreenStack";
import { findProduct } from "../content/products/productsData";
import { productScreens } from "../content/products/productScreensData";
import { productsIndexContent } from "../content/products/productsPageContent";
import "../css/products.css";

export default function ProductDetail() {
  const { slug } = useParams();
  const product = useMemo(() => findProduct(slug), [slug]);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let prevY = 0;
    try {
      const saved = sessionStorage.getItem("cambm_detail_refresh_" + slug);
      if (saved) prevY = parseInt(saved, 10);
    } catch (e) { }

    const startY = Math.max(
      prevY,
      window.scrollY || document.documentElement.scrollTop || 0
    );

    let animId = null;
    let timer = null;

    if (startY > 100) {
      window.scrollTo({ top: startY, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = startY;
      if (document.body) document.body.scrollTop = startY;
      if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
        window.__cambmLenis.scrollTo(startY, { immediate: true });
      }

      timer = setTimeout(() => {
        if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
          window.__cambmLenis.scrollTo(0, {
            duration: 1.8,
            easing: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
          });
        } else {
          const duration = 1600;
          const startTime = performance.now();
          const scrollUpStep = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease =
              progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            const currentY = startY * (1 - ease);

            window.scrollTo(0, currentY);
            if (document.documentElement) document.documentElement.scrollTop = currentY;
            if (document.body) document.body.scrollTop = currentY;

            if (progress < 1) {
              animId = requestAnimationFrame(scrollUpStep);
            } else {
              window.scrollTo(0, 0);
              if (document.documentElement) document.documentElement.scrollTop = 0;
              if (document.body) document.body.scrollTop = 0;
            }
          };
          animId = requestAnimationFrame(scrollUpStep);
        }
      }, 200);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
        window.__cambmLenis.scrollTo(0, { immediate: true });
      }
    }

    const recordPos = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      try {
        sessionStorage.setItem("cambm_detail_refresh_" + slug, y.toString());
      } catch (e) { }
    };

    window.addEventListener("scroll", recordPos, { passive: true });
    window.addEventListener("beforeunload", recordPos);

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
      if (timer) clearTimeout(timer);
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("scroll", recordPos);
      window.removeEventListener("beforeunload", recordPos);
      window.removeEventListener("cambm:cart-updated", handleCartUpdated);
    };
  }, [slug]);

  if (!product) {
    return <Navigate to="/products" replace />;
  }

  const screens = productScreens[slug] || [];
  const full = product.depth === "full";
  const themed = product.screenKind === "theme";
  const showContext = Boolean(product.suits) || product.industries.length > 0;
  const pageContent = productsIndexContent;

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
            <a href="/products" className="nav-link" data-i18n="nav.ourProducts">
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
      {/* Dims the page behind the open mobile nav; clicking it closes the menu */}
      <div className="mobile-nav-backdrop" id="mobileNavBackdrop"></div>

      {/* Main Detail Content */}
      <main id="main-content">
        {/* B1. Hero */}
        <section className="cambt-hero">
          <div className="cambt-hero-inner">
            <nav aria-label="Breadcrumb" className="cambt-breadcrumb">
              <ol>
                <li>
                  <Link to="/">{pageContent.detail.breadcrumbHome}</Link>
                </li>
                <li className="cambt-breadcrumb-sep">/</li>
                <li>
                  <Link to={`/products#product-${slug}`}>{pageContent.detail.breadcrumbIndex}</Link>
                </li>
                <li className="cambt-breadcrumb-sep">/</li>
                <li className="cambt-breadcrumb-current">{product.name}</li>
              </ol>
            </nav>

            <div className="cambt-hero-grid">
              <div className="cambt-hero-content">
                <span className="cambt-label">{product.category}</span>
                <h1>{product.name}</h1>
              </div>
              <div>
                <p className="cambt-hero-lead">{product.lead || product.positioning}</p>
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
            </div>
          </div>
        </section>

        {/* B2. Interface / Screens */}
        {screens.length > 0 && (
          <section className="cambt-section cambt-section-white" id="interface">
            <div className="cambt-inner">
              <div className="cambt-section-head">
                <span className="cambt-label">
                  {themed
                    ? pageContent.detail.sections.interface.themeLabel
                    : pageContent.detail.sections.interface.label}
                </span>
                <h2>
                  {themed
                    ? pageContent.detail.sections.interface.themeHeading
                    : pageContent.detail.sections.interface.heading}
                </h2>
                <p>
                  {themed
                    ? pageContent.detail.sections.interface.themeNote
                    : pageContent.detail.sections.interface.captureNote}
                </p>
              </div>

              <ScreenStack
                captionPrefix={product.name}
                galleryLabel={`${product.name}: themes`}
                screens={screens}
              />
            </div>
          </section>
        )}

        {/* B3. What it solves */}
        {full && product.solves && product.solves.length > 0 && (
          <section className="cambt-section cambt-section-pale" id="solves">
            <div className="cambt-inner">
              <div className="cambt-section-head">
                <span className="cambt-label">{pageContent.detail.sections.solves.label}</span>
                <h2>{pageContent.detail.sections.solves.heading}</h2>
              </div>
              <ul className="cambt-solves-list">
                {product.solves.map((item, i) => (
                  <li className="cambt-solves-item" key={i}>
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* B4. Modules and features */}
        {product.modules && product.modules.length > 0 && (
          <section className="cambt-section cambt-section-white" id="modules">
            <div className="cambt-inner">
              <div className="cambt-section-head">
                <span className="cambt-label">{pageContent.detail.sections.modules.label}</span>
                <h2>{pageContent.detail.sections.modules.heading}</h2>
                <p>{pageContent.detail.sections.modules.body}</p>
              </div>
              <ul className="cambt-modules-grid">
                {product.modules.map((m, i) => (
                  <li className="cambt-module-item" key={i}>
                    <h3>{m.name}</h3>
                    {m.body && <p>{m.body}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* B5. What it replaces */}
        {full && product.replaces && product.replaces.length > 0 && (
          <section className="cambt-section cambt-section-pale" id="replaces">
            <div className="cambt-inner">
              <div className="cambt-section-head">
                <span className="cambt-label">{pageContent.detail.sections.replaces.label}</span>
                <h2>{pageContent.detail.sections.replaces.heading}</h2>
              </div>
              <ul className="cambt-ruled-list">
                {product.replaces.map((item, i) => (
                  <li className="cambt-ruled-item danger" key={i}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* B6. Where we fit it */}
        {full && product.adapts && product.adapts.length > 0 && (
          <section className="cambt-section cambt-section-muted" id="adapts">
            <div className="cambt-inner">
              <div className="cambt-section-head">
                <span className="cambt-label">{pageContent.detail.sections.adapts.label}</span>
                <h2>{pageContent.detail.sections.adapts.heading}</h2>
                <p>{pageContent.detail.sections.adapts.body}</p>
              </div>
              <ul className="cambt-ruled-list">
                {product.adapts.map((item, i) => (
                  <li className="cambt-ruled-item accent" key={i}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* B7. Context */}
        {showContext && (
          <section className="cambt-section cambt-section-pale" id="context">
            <div className="cambt-inner">
              <div className="cambt-context-grid">
                {product.suits && (
                  <div>
                    <span className="cambt-label">{pageContent.detail.sections.suits.label}</span>
                    <p className="cambt-hero-lead" style={{ margin: 0 }}>
                      {product.suits}
                    </p>
                  </div>
                )}
                {product.industries && product.industries.length > 0 && (
                  <div>
                    <span className="cambt-label">{pageContent.detail.sections.industriesLabel}</span>
                    <ul className="cambt-chips-list">
                      {product.industries.map((ind, i) => (
                        <li className="cambt-chip" key={i}>
                          {ind}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* B8. Implementation and Support */}
        {product.relatedServices && product.relatedServices.length > 0 && (
          <section className="cambt-section cambt-section-white" id="services">
            <div className="cambt-inner">
              <div className="cambt-section-head">
                <span className="cambt-label">{pageContent.detail.sections.services.label}</span>
                <h2>{pageContent.detail.sections.services.heading}</h2>
                <p>{pageContent.detail.sections.services.body}</p>
              </div>
              <ul className="cambt-services-grid">
                {product.relatedServices.map((srv, i) => (
                  <li className="cambt-service-card" key={i}>
                    <h3>
                      <a href="/#services">{srv.title}</a>
                    </h3>
                    <p>{srv.relationship}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* B9. Closing CTA Band */}
        <section className="cambt-cta-band">
          <div className="cambt-inner">
            <h2>{pageContent.detail.contact.heading}</h2>
            <p>{pageContent.detail.contact.body}</p>
            <button
              type="button"
              className="cambt-btn-cta js-open-cal"
              data-cal-link="cambridge.marketing"
              data-cal-namespace="strategy-call"
              data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
            >
              {pageContent.detail.contact.action.label}
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
