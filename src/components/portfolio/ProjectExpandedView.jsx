import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { useI18n } from "../../hooks/useI18n";

/**
 * ProjectExpandedView renders the full-focus expanded case study via React Portal:
 * - Mounts directly to document.body with position: fixed; inset: 0; z-index: 999999
 * - Solid 100% opaque background (#111113) so page footer/sections NEVER show or overlap
 * - Smooth auto-scroll to top on open / project switch
 * - Esc key / Close (×) button / Backdrop click cleanly closes the case view
 * - Fully localized & reactive to language changes on the fly
 */
export default function ProjectExpandedView({
  project,
  onClose,
  onNext,
  onPrev,
}) {
  const overlayRef = useRef(null);
  const { lang, isRtl, t, translateProject } = useI18n();

  useEffect(() => {
    // Automatically align scroll to top on open and on project change
    if (overlayRef.current) {
      overlayRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) {
        if (isRtl) onPrev?.();
        else onNext?.();
      }
      if (e.key === "ArrowLeft" && onPrev) {
        if (isRtl) onNext?.();
        else onPrev?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [project?.id, onClose, onNext, onPrev, isRtl]);

  if (!project) return null;

  const currentProject = translateProject(project);
  const calLocale = lang === "ar" ? "ar" : lang === "es" ? "es" : "en";

  const handleBookCall = (e) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      // 1. Trigger Cal.com embed API directly
      if (window.Cal) {
        try {
          if (window.Cal.ns && window.Cal.ns["strategy-call"]) {
            window.Cal.ns["strategy-call"]("modal", {
              calLink: "cambridge.marketing",
              config: { layout: "month_view", language: calLocale, locale: calLocale },
            });
            return;
          }
          window.Cal("modal", {
            calLink: "cambridge.marketing",
            config: { layout: "month_view", language: calLocale, locale: calLocale },
          });
          return;
        } catch (err) {
          console.warn("Cal API trigger fallback:", err);
        }
      }

      // 2. Trigger header Cal button if present
      const headerCalBtn = document.querySelector(".header .js-open-cal");
      if (headerCalBtn) {
        headerCalBtn.click();
        return;
      }

      // 3. Fallback direct booking link
      window.open("https://cal.com/cambridge.marketing", "_blank", "noopener,noreferrer");
    }
  };

  const overviewText =
    currentProject.overview ||
    currentProject.short_description ||
    `A connected brand and campaign direction designed to make ${currentProject.brand || currentProject.title} feel coherent across every customer touchpoint while creating a stronger platform for future growth.`;

  const challengeText =
    currentProject.challenge ||
    "Legacy workflows and fragmented brand touchpoints created high customer drop-off before checkout across retail channels.";

  const approachText =
    currentProject.approach ||
    "Unified digital design system, conversion-focused e-commerce storefront, and high-performance Meta creative funnels.";

  const deliverablesText =
    currentProject.deliverables ||
    "Brand direction, social design system, campaign concepts, launch toolkit and performance-ready creative templates.";

  const metrics = Array.isArray(currentProject.metrics) ? currentProject.metrics : [];

  const modalContent = (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        className="portfolio-case-overlay-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`case-heading-${currentProject.id}`}
        dir={isRtl ? "rtl" : "ltr"}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 999999,
          backgroundColor: "rgba(13, 27, 42, 0.88)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          padding: "clamp(24px, 4vw, 64px) clamp(16px, 3vw, 40px)",
        }}
      >
        <motion.div
          key={`${currentProject.id}-${lang}`}
          className="portfolio-case-inner is-open-view"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "1280px",
            backgroundColor: "#e9ecef",
            border: "1px solid rgba(0, 0, 0, 0.12)",
            borderRadius: "24px",
            padding: "clamp(36px, 5vw, 76px) clamp(24px, 4.5vw, 64px) 44px",
            boxShadow: "0 34px 100px rgba(0, 0, 0, 0.5)",
            color: "#111113",
            boxSizing: "border-box",
            margin: "0 auto 40px auto",
          }}
        >
          {/* Topline */}
          <div className="portfolio-case-topline">
            <span>
              <span data-i18n="portfolio.case.label">{t("portfolio.case.label", "CASE FILE")}</span> / {currentProject.index || "01"}
            </span>
            <button
              type="button"
              className="portfolio-case-close"
              onClick={onClose}
              aria-label={t("portfolio.case.close", "Close case file")}
              data-i18n-attr="aria-label:portfolio.case.close"
            >
              <span data-i18n="portfolio.case.close">{t("portfolio.case.close", "Close")}</span>
              <i aria-hidden="true">×</i>
            </button>
          </div>

          {/* Case Header */}
          <header className="portfolio-case-header">
            <div>
              <span className="portfolio-case-location">
                {currentProject.location || "COLOMBO, SRI LANKA"}
              </span>
              <h3 id={`case-heading-${currentProject.id}`}>
                {currentProject.brand || currentProject.title}
              </h3>
            </div>
            <p className="portfolio-case-overview">{overviewText}</p>
          </header>

          {/* Industry & Market Facts */}
          <div className="portfolio-case-facts">
            <div>
              <span data-i18n="portfolio.case.industry">{t("portfolio.case.industry", "Industry")}</span>
              <strong>{currentProject.industry || "Beauty & Wellness"}</strong>
            </div>
            <div>
              <span data-i18n="portfolio.case.market">{t("portfolio.case.market", "Market")}</span>
              <strong>{currentProject.market || "Global"}</strong>
            </div>
          </div>

          {/* The Challenge & The Approach Narrative */}
          <div className="portfolio-case-narrative">
            <section>
              <span>01</span>
              <div>
                <h4 data-i18n="portfolio.case.challenge">{t("portfolio.case.challenge", "The Challenge")}</h4>
                <p>{challengeText}</p>
              </div>
            </section>
            <section>
              <span>02</span>
              <div>
                <h4 data-i18n="portfolio.case.approach">{t("portfolio.case.approach", "The Approach")}</h4>
                <p>{approachText}</p>
              </div>
            </section>
          </div>

          {/* Deliverables */}
          <div className="portfolio-case-deliverables">
            <span className="portfolio-kicker" data-i18n="portfolio.case.deliverables">{t("portfolio.case.deliverables", "Deliverables")}</span>
            <p>{deliverablesText}</p>
          </div>

          {/* Metrics */}
          {metrics.length > 0 && (
            <div className="portfolio-case-metrics">
              {metrics.map((item, idx) => {
                let val = "";
                let lbl = "";
                if (typeof item === "object" && item !== null) {
                  val = item.value || "";
                  lbl = item.label || "";
                } else if (typeof item === "string") {
                  const parts = item.trim().split(/\s+(.*)/);
                  if (
                    parts.length >= 2 &&
                    /^[\+\-\d\.\,\%xXkKmMbB\$\€\£\₹]+$/.test(parts[0])
                  ) {
                    val = parts[0];
                    lbl = parts[1];
                  } else {
                    val = item;
                  }
                }
                return (
                  <div key={idx} className="portfolio-case-metric">
                    <strong>{val}</strong>
                    {lbl && <span>{lbl}</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Conversion CTA */}
          <div className="portfolio-case-conversion">
            <div>
              <span className="portfolio-kicker" data-i18n="portfolio.case.nextStep">{t("portfolio.case.nextStep", "— Next Step")}</span>
              <h4 data-i18n="portfolio.case.ctaTitle">
                {t("portfolio.case.ctaTitle", `Ready to scale your brand like ${currentProject.brand || currentProject.title}?`)}
              </h4>
            </div>
            <button
              type="button"
              className="btn btn-primary js-open-cal js-portfolio-cta-btn"
              onClick={handleBookCall}
              data-cal-link="cambridge.marketing"
              data-cal-namespace="strategy-call"
              data-cal-config={`{"layout":"month_view","language":"${calLocale}","locale":"${calLocale}"}`}
              data-i18n="portfolio.case.ctaButton"
            >
              {t("portfolio.case.ctaButton", "Book a strategy call")}
            </button>
          </div>

          {/* Next / Previous Project Navigation */}
          {(onPrev || onNext) && (
            <nav
              className="portfolio-case-nav"
              aria-label={t("portfolio.case.navigationAria", "Case study navigation")}
              data-i18n-attr="aria-label:portfolio.case.navigationAria"
            >
              <button
                type="button"
                data-case-direction="previous"
                onClick={onPrev}
              >
                <span aria-hidden="true">{isRtl ? "→" : "←"}</span>
                <span data-i18n="portfolio.case.previous">{t("portfolio.case.previous", "Previous Project")}</span>
              </button>
              <button
                type="button"
                data-case-direction="next"
                onClick={onNext}
              >
                <span data-i18n="portfolio.case.next">{t("portfolio.case.next", "Next Project")}</span>
                <span aria-hidden="true">{isRtl ? "←" : "→"}</span>
              </button>
            </nav>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : modalContent;
}
