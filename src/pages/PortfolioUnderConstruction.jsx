import React, { useEffect } from "react";

export default function PortfolioUnderConstruction({ page = "portfolio" }) {
  const isPackages = page === "packages";
  useEffect(() => {
    window.scrollTo(0, 0);
    const revealEvent = new CustomEvent("cambm:revealed");
    document.dispatchEvent(revealEvent);
    if (window.CAMBMTheme && window.CAMBMTheme.initControls)
      window.CAMBMTheme.initControls();
    if (window.initI18n) window.initI18n();
  }, []);

  return (
    <>
      <main className="construction-main">
        <section className="construction-hero">
          <div className="construction-inner">
            {isPackages ? (
              <>
                <h1 className="construction-title">
                  Our packages are being prepared.
                </h1>
                <p className="construction-body">
                  We are shaping flexible growth plans for every stage of your
                  business. Package details will be available soon.
                </p>
              </>
            ) : (
              <>
                <h1
                  className="construction-title"
                  data-i18n="construction.title"
                >
                  Our portfolio is being rebuilt.
                </h1>
                <p className="construction-body" data-i18n="construction.body">
                  We’re preparing a clearer view of our selected work and case
                  studies. It will be available soon.
                </p>
              </>
            )}
            <div className="construction-actions">
              <a
                className="btn btn-secondary"
                href="/"
                data-i18n="construction.home"
              >
                Return home
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
            <div
              className="construction-progress"
              role="status"
              aria-live="polite"
            >
              <div
                className="construction-progress-rule"
                aria-hidden="true"
              ></div>
              <p
                className="construction-status"
                data-i18n={isPackages ? undefined : "construction.status"}
              >
                {isPackages
                  ? "Package details coming soon"
                  : "Portfolio update in progress"}
              </p>
            </div>
          </div>
        </section>
      </main>

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
    </>
  );
}
