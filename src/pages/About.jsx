import React, { useEffect } from "react";
import CurvedRoadmap from "../components/about/CurvedRoadmap";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
    // Dispatch event to re-trigger vanilla JS DOM logic
    window.dispatchEvent(new Event("DOMContentLoaded"));
    const revealEvent = new CustomEvent("cambm:revealed");
    document.dispatchEvent(revealEvent);
    if (window.CAMBMTheme && window.CAMBMTheme.initControls)
      window.CAMBMTheme.initControls();
    if (window.initI18n) window.initI18n();
  }, []);

  return (
    <>
      {/*  Custom Cursor  */}
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>

      {/*  Header  */}
      <header className="header" id="header">
        <div className="header-inner">
          <a
            href="/"
            className="logo js-logo-home"
            data-i18n-attr="aria-label:nav.homeAriaLabel"
            aria-label="Cambridge Marketing, back to top"
          >
            <img
              className="theme-logo"
              src="images/cambridge-logo.png"
              alt="Cambridge Marketing"
              width="133"
              height="40"
              style={{ height: "40px", width: "auto", display: "block" }}
            />
          </a>
          <nav className="nav">
            <a href="/" className="nav-link" data-i18n="nav.home">
              Home
            </a>
            <a href="/portfolio" className="nav-link" data-i18n="nav.portfolio">
              Portfolio
            </a>
            <a
              href="/#why-CAMBM"
              data-scroll-target="why-CAMBM"
              className="nav-link"
              data-i18n="nav.whyCambm"
            >
              Why CAMBM
            </a>
            <a href="/#packages" className="nav-link" data-i18n="nav.packages">
              Packages
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
              className="btn btn-primary btn-sm js-open-cal"
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
        {/*  Mobile nav panel  */}
        <nav className="mobile-nav" id="mobileNav">
          <a href="/" className="mobile-nav-link" data-i18n="nav.home">
            Home
          </a>
          <a
            href="/portfolio"
            className="mobile-nav-link"
            data-i18n="nav.portfolio"
          >
            Portfolio
          </a>
          <a
            href="/#why-CAMBM"
            data-scroll-target="why-CAMBM"
            className="mobile-nav-link"
            data-i18n="nav.whyCambm"
          >
            Why CAMBM
          </a>
          <a
            href="/#packages"
            className="mobile-nav-link"
            data-i18n="nav.packages"
          >
            Packages
          </a>
          <a href="/about" className="mobile-nav-link" data-i18n="nav.about">
            About
          </a>
          <div className="mobile-nav-actions">
            <div className="mobile-theme-row">
              <span data-i18n="theme.appearance">Appearance</span>
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
      <div className="mobile-nav-backdrop" id="mobileNavBackdrop"></div>

      <main>
        {/*  01 Hero  */}
        <section className="about-hero" id="about-hero">
          <div className="hero-bg"></div>
          <div className="about-hero-inner">
            <p className="section-eyebrow" data-i18n="about.hero.eyebrow">
              The Cambridge Story
            </p>
            <h1 className="about-hero-title">
              <span data-i18n="about.hero.headlineLine1">We build brands.</span>
              <span
                className="about-hero-accent"
                data-i18n="about.hero.headlineLine2"
              >
                And the systems behind them.
              </span>
            </h1>
            <p className="about-hero-sub" data-i18n="about.hero.sub">
              We bridge the gap between front-end attention and back-end
              operations. By combining strategic marketing with custom POS, ERP,
              and web development, we ensure your growth never outpaces your
              infrastructure.
            </p>
            <div className="hero-actions">
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
              <a
                href="#about-story"
                className="btn btn-secondary"
                data-i18n="about.hero.ctaSecondary"
              >
                Explore our story
              </a>
            </div>
          </div>
        </section>
        {/*  02 Our Story + 03 Built From Technology — editorial chapter split  */}
        <section className="about-section" id="about-story">
          <div className="about-split">
            <div className="about-story-row scroll-reveal">
              <div className="about-story-meta">
                <span className="about-chapter-num" aria-hidden="true">
                  01
                </span>
                <h2 className="about-card-title" data-i18n="about.story.title">
                  Our Story
                </h2>
              </div>
              <div className="about-story-body-wrap">
                <p className="about-card-body" data-i18n="about.story.body">
                  Cambridge Marketing was founded in 2025 as Cambridge
                  Technology expanded its digital capabilities into a dedicated
                  marketing and growth segment. We were created for businesses
                  that need more than attractive content.
                </p>
              </div>
            </div>
            <div className="about-story-row scroll-reveal stagger-1">
              <div className="about-story-meta">
                <span className="about-chapter-num" aria-hidden="true">
                  02
                </span>
                <h2 className="about-card-title" data-i18n="about.tech.title">
                  Built From Technology
                </h2>
              </div>
              <div className="about-story-body-wrap">
                <p className="about-card-body" data-i18n="about.tech.body">
                  Cambridge Technology has spent more than 11 years helping
                  businesses succeed through software, mobile applications,
                  cloud infrastructure, cybersecurity and digital solutions.
                  Cambridge Marketing carries that same systems-first mindset
                  into brand growth, connecting creativity, technology and
                  execution into one clear path forward.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*  03 The Connected System  */}
        <section className="about-section" id="about-systems">
          <div className="section-inner">
            <span className="about-chapter-num" aria-hidden="true">
              03
            </span>
            <h2
              className="section-title scroll-reveal"
              data-i18n="about.systems.title"
            >
              One connected system, not scattered tools.
            </h2>
            <p
              className="section-desc scroll-reveal"
              data-i18n="about.systems.sub"
            >
              Cambridge Technology already runs the software behind real
              businesses. Cambridge Marketing plugs growth into that same
              system, so the attention you create on the front end and the
              operations that fulfil it on the back end move as one, instead of
              separate vendors you have to stitch together yourself.
            </p>
            <ol className="about-flow">
              <li className="about-flow-step scroll-reveal stagger-1">
                <span className="about-flow-index" aria-hidden="true">
                  01
                </span>
                <h3
                  className="about-flow-label"
                  data-i18n="about.systems.step1Label"
                >
                  Attract
                </h3>
                <p
                  className="about-flow-body"
                  data-i18n="about.systems.step1Body"
                >
                  Brand, content and ads that bring the right people to you.
                </p>
              </li>
              <li className="about-flow-step scroll-reveal stagger-2">
                <span className="about-flow-index" aria-hidden="true">
                  02
                </span>
                <h3
                  className="about-flow-label"
                  data-i18n="about.systems.step2Label"
                >
                  Convert
                </h3>
                <p
                  className="about-flow-body"
                  data-i18n="about.systems.step2Body"
                >
                  Websites, landing pages and enquiry flows that turn interest
                  into leads.
                </p>
              </li>
              <li className="about-flow-step scroll-reveal stagger-3">
                <span className="about-flow-index" aria-hidden="true">
                  03
                </span>
                <h3
                  className="about-flow-label"
                  data-i18n="about.systems.step3Label"
                >
                  Operate
                </h3>
                <p
                  className="about-flow-body"
                  data-i18n="about.systems.step3Body"
                >
                  POS, ERP and automation that fulfil and manage every order
                  behind the scenes.
                </p>
              </li>
              <li className="about-flow-step scroll-reveal stagger-4">
                <span className="about-flow-index" aria-hidden="true">
                  04
                </span>
                <h3
                  className="about-flow-label"
                  data-i18n="about.systems.step4Label"
                >
                  Retain
                </h3>
                <p
                  className="about-flow-body"
                  data-i18n="about.systems.step4Body"
                >
                  Reporting and follow-ups that turn a single sale into repeat
                  revenue.
                </p>
              </li>
            </ol>
          </div>
        </section>

        {/*  05 Why Work With Us  */}
        <section className="about-section" id="about-why">
          <div className="section-inner">
            <span className="about-chapter-num" aria-hidden="true">
              04
            </span>
            <h2
              className="section-title scroll-reveal"
              data-i18n="about.why.title"
            >
              Why businesses choose Cambridge Marketing
            </h2>
            <div className="about-why">
              <div className="about-why-item scroll-reveal">
                <h3
                  className="about-why-title"
                  data-i18n="about.why.item1Title"
                >
                  One team, end to end
                </h3>
                <p className="about-why-body" data-i18n="about.why.item1Body">
                  Strategy, creative, websites, automation and reporting under a
                  single partner.
                </p>
              </div>
              <div className="about-why-item scroll-reveal">
                <h3
                  className="about-why-title"
                  data-i18n="about.why.item2Title"
                >
                  Technology-backed marketing
                </h3>
                <p className="about-why-body" data-i18n="about.why.item2Body">
                  Built from a company with software, digital systems and
                  infrastructure experience.
                </p>
              </div>
              <div className="about-why-item scroll-reveal">
                <h3
                  className="about-why-title"
                  data-i18n="about.why.item3Title"
                >
                  Strategy before output
                </h3>
                <p className="about-why-body" data-i18n="about.why.item3Body">
                  Every post, page, campaign and system supports a clear
                  business objective.
                </p>
              </div>
              <div className="about-why-item scroll-reveal">
                <h3
                  className="about-why-title"
                  data-i18n="about.why.item4Title"
                >
                  Connected operations
                </h3>
                <p className="about-why-body" data-i18n="about.why.item4Body">
                  Marketing does not stop at attention; it supports leads,
                  workflows, POS/ERP and customer journeys.
                </p>
              </div>
              <div className="about-why-item scroll-reveal">
                <h3
                  className="about-why-title"
                  data-i18n="about.why.item5Title"
                >
                  Transparent reporting
                </h3>
                <p className="about-why-body" data-i18n="about.why.item5Body">
                  Clear monthly insights show what is working, what needs
                  improvement and where budget is going.
                </p>
              </div>
              <div className="about-why-item scroll-reveal">
                <h3
                  className="about-why-title"
                  data-i18n="about.why.item6Title"
                >
                  Global growth mindset
                </h3>
                <p className="about-why-body" data-i18n="about.why.item6Body">
                  Designed for businesses expanding across markets, languages
                  and digital channels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/*  06 Process  */}
        <section className="about-section" id="about-process">
          <div className="section-inner">
            <span className="about-chapter-num" aria-hidden="true">
              05
            </span>
            <h2
              className="section-title scroll-reveal"
              data-i18n="about.process.title"
            >
              How we work
            </h2>
            <div className="about-process-list">
              <div className="diff-item scroll-reveal">
                <div className="diff-number">01</div>
                <div className="diff-content">
                  <h3 data-i18n="about.process.step1Title">Consultation</h3>
                  <p data-i18n="about.process.step1Body">
                    We understand business goals, current marketing, systems,
                    audience and growth barriers.
                  </p>
                </div>
              </div>
              <div className="diff-item scroll-reveal">
                <div className="diff-number">02</div>
                <div className="diff-content">
                  <h3 data-i18n="about.process.step2Title">
                    Strategy & Team Planning
                  </h3>
                  <p data-i18n="about.process.step2Body">
                    We define priorities, channels, creative direction,
                    workflows and the right execution team.
                  </p>
                </div>
              </div>
              <div className="diff-item scroll-reveal">
                <div className="diff-number">03</div>
                <div className="diff-content">
                  <h3 data-i18n="about.process.step3Title">
                    Design, Build & Launch
                  </h3>
                  <p data-i18n="about.process.step3Body">
                    We create assets, campaigns, websites, automation flows and
                    operational integrations.
                  </p>
                </div>
              </div>
              <div className="diff-item scroll-reveal">
                <div className="diff-number">04</div>
                <div className="diff-content">
                  <h3 data-i18n="about.process.step4Title">
                    Reporting & Improvement
                  </h3>
                  <p data-i18n="about.process.step4Body">
                    We track performance, report clearly and improve campaigns,
                    content and systems monthly.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  07 Values  */}
        <section className="about-section" id="about-values">
          <div className="section-inner">
            <span className="about-chapter-num" aria-hidden="true">
              06
            </span>
            <h2
              className="section-title scroll-reveal"
              data-i18n="about.values.title"
            >
              What we stand for
            </h2>
            <div className="about-values">
              <div className="about-value scroll-reveal">
                <div
                  className="about-value-title"
                  data-i18n="about.values.item1Title"
                >
                  Innovation
                </div>
                <div
                  className="about-value-body"
                  data-i18n="about.values.item1Body"
                >
                  We explore new technologies, creative formats and smarter
                  systems to create stronger outcomes.
                </div>
              </div>
              <div className="about-value scroll-reveal">
                <div
                  className="about-value-title"
                  data-i18n="about.values.item2Title"
                >
                  Reliability
                </div>
                <div
                  className="about-value-body"
                  data-i18n="about.values.item2Body"
                >
                  We build consistent, scalable and sustainable marketing
                  systems clients can depend on.
                </div>
              </div>
              <div className="about-value scroll-reveal">
                <div
                  className="about-value-title"
                  data-i18n="about.values.item3Title"
                >
                  Customer Success
                </div>
                <div
                  className="about-value-body"
                  data-i18n="about.values.item3Body"
                >
                  Client growth, clarity and confidence remain central to every
                  campaign and system.
                </div>
              </div>
              <div className="about-value scroll-reveal">
                <div
                  className="about-value-title"
                  data-i18n="about.values.item4Title"
                >
                  Integrity
                </div>
                <div
                  className="about-value-body"
                  data-i18n="about.values.item4Body"
                >
                  We communicate transparently, report honestly and maintain
                  quality across every deliverable.
                </div>
              </div>
              <div className="about-value scroll-reveal">
                <div
                  className="about-value-title"
                  data-i18n="about.values.item5Title"
                >
                  Collaboration
                </div>
                <div
                  className="about-value-body"
                  data-i18n="about.values.item5Body"
                >
                  We work closely with clients to understand goals, context,
                  operations and market direction.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*  08 Global Direction  */}
        <section className="about-section" id="about-global">
          <div className="section-inner">
            <span className="about-chapter-num" aria-hidden="true">
              07
            </span>
            <h2
              className="section-title scroll-reveal"
              data-i18n="about.global.title"
            >
              Built local. Designed global.
            </h2>
            <p
              className="section-desc scroll-reveal"
              data-i18n="about.global.body"
            >
              Cambridge Marketing is being built with a global operating
              mindset. Our journey begins in the Saudi and Middle East market,
              expands through Sri Lanka and India, and is designed to serve
              Europe and businesses worldwide. The goal is not to be another
              local marketing vendor, it is to become a trusted growth systems
              partner for ambitious companies across regions.
            </p>
            <CurvedRoadmap />
          </div>
        </section>

        {/*  09 CTA (shared component)  */}
        <section className="cta" id="cta">
          <div className="cta-bg"></div>
          <div className="cta-inner">
            <h2 className="cta-title scroll-reveal" data-i18n="cta.title">
              Ready to grow your business,
              <br />
              <em>the right way?</em>
            </h2>
            <p className="cta-desc scroll-reveal" data-i18n="cta.desc">
              One team for your marketing, your brand, and the technology that
              runs your business. Get in touch and let's talk about where you
              want to go.
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
      </main>

      {/*  Footer (shared with the landing page)  */}
      <footer className="footer" id="footer">
        <div className="footer-inner">
          <section
            className="footer-offices"
            aria-label="Our offices"
            data-i18n-attr="aria-label:footer.office.label"
          >
            <article className="footer-office">
              <span className="footer-office-code" aria-hidden="true">
                SA
              </span>
              <h3 data-i18n="footer.office.sa.title">
                Cambridge Marketing - Saudi Arabia
              </h3>
              <dl className="footer-office-details">
                <div>
                  <dt data-i18n="footer.office.phone">Contact number</dt>
                  <dd>
                    <a href="tel:+966557323125">+966 55 732 3125</a>
                  </dd>
                </div>
                <div>
                  <dt data-i18n="footer.office.address">Address</dt>
                  <dd>
                    <address data-i18n="footer.office.sa.address">
                      City Centre, Mishrifah, Jeddah, Saudi Arabia
                    </address>
                  </dd>
                </div>
                <div>
                  <dt data-i18n="footer.office.email">Email</dt>
                  <dd>
                    <a href="mailto:marketing@cambt.com">marketing@cambt.com</a>
                  </dd>
                </div>
              </dl>
            </article>
            <article className="footer-office">
              <span className="footer-office-code" aria-hidden="true">
                LK
              </span>
              <h3 data-i18n="footer.office.lk.title">
                Cambridge Marketing - Sri Lanka
              </h3>
              <dl className="footer-office-details">
                <div>
                  <dt data-i18n="footer.office.phone">Contact number</dt>
                  <dd>
                    <a href="tel:+94766490522">+94 76 649 0522</a>
                  </dd>
                </div>
                <div>
                  <dt data-i18n="footer.office.address">Address</dt>
                  <dd>
                    <address data-i18n="footer.office.lk.address">
                      328/3 Temple Road, Kaduwela Road, Battaramulla, Colombo,
                      Sri Lanka 10120
                    </address>
                  </dd>
                </div>
                <div>
                  <dt data-i18n="footer.office.email">Email</dt>
                  <dd>
                    <a href="mailto:marketing@cambt.com">marketing@cambt.com</a>
                  </dd>
                </div>
              </dl>
            </article>
          </section>
          <div className="footer-bottom">
            <img
              className="theme-logo"
              src="images/cambridge-logo.png"
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
            <div className="footer-socials">
              <a
                href="https://wa.me/94766490522?text=Hi%20Cambridge%20Marketing!%20I%20found%20you%20through%20your%20website%20and%20I%27d%20like%20to%20grow%20my%20business%20with%20you.%20Can%20we%20talk%3F"
                id="footerSocialWhatsApp"
                className="footer-social"
                aria-label="WhatsApp"
                target="_blank"
                rel="noopener"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/cambm.lk/"
                id="footerSocialInstagram"
                className="footer-social"
                aria-label="Instagram"
                target="_blank"
                rel="noopener"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61590765272716#"
                id="footerSocialFacebook"
                className="footer-social"
                aria-label="Facebook"
                target="_blank"
                rel="noopener"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.464.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/cambridgemarketing/"
                className="footer-social"
                aria-label="LinkedIn"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667h-3.554V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <nav
        className="contact-actions"
        aria-label="Quick contact"
        data-i18n-attr="aria-label:contact.quickActions"
      >
        <a
          className="contact-action contact-action-whatsapp js-region-whatsapp"
          href="https://wa.me/94766490522?text=Hi%20Cambridge%20Marketing!%20I%20found%20you%20through%20your%20website%20and%20I%27d%20like%20to%20grow%20my%20business%20with%20you.%20Can%20we%20talk%3F"
          aria-label="Chat on WhatsApp"
          data-i18n-attr="aria-label:contact.whatsappAria"
          target="_blank"
          rel="noopener"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
            />
          </svg>
        </a>
        <a
          className="contact-action contact-action-call js-region-call"
          href="tel:+94766490522"
          aria-label="Call Cambridge Marketing"
          data-i18n-attr="aria-label:contact.callAria"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.1 3.5 9.5 8 7.8 9.8c1.3 2.7 3.6 5 6.3 6.3l1.8-1.7 4.5 2.4-.6 3c-.2.8-.9 1.4-1.8 1.4C9.7 21.2 2.8 14.3 2.8 6c0-.9.6-1.6 1.4-1.8l2.9-.7Z" />
          </svg>
        </a>
      </nav>

      {/*  Back to top  */}
      <button className="back-to-top" id="backToTop" aria-label="Back to top">
        &#8593;
      </button>

      {/*  First-visit country/language popup  */}
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

      {/*  Cal.com booking widget  */}
    </>
  );
}
