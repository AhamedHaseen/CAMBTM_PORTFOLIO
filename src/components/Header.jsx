import React from "react";
import { useLocation, NavLink, Link } from "react-router-dom";

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;

  React.useEffect(() => {
    if (window.initI18n) window.initI18n();
    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
  }, []);

  // Don't render public header on studio routes
  if (pathname.startsWith("/studio")) {
    return null;
  }

  const isHome = pathname === "/" || pathname === "/welcome.html";
  const isProducts = pathname.startsWith("/products");
  const isPricing = pathname === "/packages" || pathname === "/packages.html" || pathname === "/our-pricing" || pathname === "/pricing";
  const isAbout = pathname === "/about";

  return (
    <>
      <header className="header" id="header">
        <div className="header-inner">
          <NavLink
            to="/"
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
          </NavLink>
          <nav className="nav">
            <NavLink
              to="/"
              className={`nav-link ${isHome ? "active" : ""}`}
              data-i18n="nav.home"
            >
              Home
            </NavLink>
            <Link to="/#services" className="nav-link" data-i18n="nav.services">
              Services
            </Link>
            <Link to="/#why-CAMBM" className="nav-link" data-i18n="nav.whyCambm">
              Why CAMBM
            </Link>
            <NavLink
              to="/products"
              className={`nav-link ${isProducts ? "active" : ""}`}
              data-i18n="nav.ourProducts"
              onClick={() => {
                if (pathname === "/products" || pathname === "/products.html") {
                  if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
                    window.__cambmLenis.scrollTo(0, { immediate: false, duration: 0.8 });
                  } else {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }
              }}
            >
              Our Products
            </NavLink>
            <NavLink
              to="/packages"
              className={`nav-link ${isPricing ? "active" : ""}`}
              data-i18n="nav.ourPricing"
            >
              Packages
            </NavLink>
            <NavLink
              to="/about"
              className={`nav-link ${isAbout ? "active" : ""}`}
              data-i18n="nav.about"
            >
              About
            </NavLink>
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
        {/* Mobile nav panel: only shown below 1024px, toggled by the hamburger button */}
        <nav className="mobile-nav" id="mobileNav">
          <NavLink
            to="/"
            className={`mobile-nav-link ${isHome ? "active" : ""}`}
            data-i18n="nav.home"
          >
            Home
          </NavLink>
          <Link to="/#services" className="mobile-nav-link" data-i18n="nav.services">
            Services
          </Link>
          <Link
            to="/#why-CAMBM"
            className="mobile-nav-link"
            data-i18n="nav.whyCambm"
          >
            Why CAMBM
          </Link>
          <NavLink
            to="/products"
            className={`mobile-nav-link ${isProducts ? "active" : ""}`}
            data-i18n="nav.ourProducts"
            onClick={() => {
              if (pathname === "/products" || pathname === "/products.html") {
                if (window.__cambmLenis && typeof window.__cambmLenis.scrollTo === "function") {
                  window.__cambmLenis.scrollTo(0, { immediate: false, duration: 0.8 });
                } else {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }
            }}
          >
            Our Products
          </NavLink>
          <NavLink
            to="/packages"
            className={`mobile-nav-link ${isPricing ? "active" : ""}`}
            data-i18n="nav.ourPricing"
          >
            Packages
          </NavLink>
          <NavLink
            to="/about"
            className={`mobile-nav-link ${isAbout ? "active" : ""}`}
            data-i18n="nav.about"
          >
            About
          </NavLink>

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
    </>
  );
}
