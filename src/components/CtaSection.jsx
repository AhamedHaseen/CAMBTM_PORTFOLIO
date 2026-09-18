import React from "react";

export default function CtaSection() {
  return (
    <section className="cta" id="cta">
      <div className="cta-inner">
        <h2 className="cta-title scroll-reveal" data-i18n="cta.title">
          Ready to grow your business,
          <br />
          <em>the right way?</em>
        </h2>
        <p className="cta-desc scroll-reveal" data-i18n="cta.desc">
          One team for your marketing, your brand, and the technology that
          runs your business. Get in touch and let's talk about where you want
          to go.
        </p>
        <div className="scroll-reveal">
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
      </div>
    </section>
  );
}
