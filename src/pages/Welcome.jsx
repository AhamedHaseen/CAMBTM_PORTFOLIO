import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import AnimatedCounter from "../components/AnimatedCounter";
import ServicesSection from "../components/ServicesSection";
import MotionPageLoader from "../components/MotionPageLoader";
import FooterOffices from "../components/FooterOffices";
import FooterSocials, { getPrimaryContactInfo } from "../components/FooterSocials";

const getMediaUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  return url.startsWith('/') ? url : `/${url}`;
};

const DEFAULT_BENTO_COLUMNS = {
  col1: [
    { id: 1, name: 'Myra Creative', media_type: 'image', media_url: 'images/brand-creatives/myra.jpg' },
    { id: 2, name: 'Hijaz Pasta Creative', media_type: 'image', media_url: 'images/brand-creatives/hijaz_pasta.jpg' },
    { id: 3, name: 'Top Baller Video Creative', media_type: 'video', media_url: 'images/brand-creatives/topballer-vid-creative.mp4' },
    { id: 4, name: 'Onex Roze Creative', media_type: 'image', media_url: 'images/brand-creatives/onex-roze.jpg' }
  ],
  col2: [
    { id: 5, name: 'Hijaz Ad Video', media_type: 'video', media_url: 'images/brand-creatives/hijaz-ad.mp4' },
    { id: 6, name: 'Uneeflow Creative', media_type: 'image', media_url: 'images/brand-creatives/uneeflow-creative.jpg' },
    { id: 7, name: 'Al Fakhir Creative', media_type: 'image', media_url: 'images/brand-creatives/al-fakhir.jpg' },
    { id: 8, name: 'Mahanama Creative', media_type: 'image', media_url: 'images/brand-creatives/mahanama.jpg' },
    { id: 9, name: 'Zafiro Ad Video', media_type: 'video', media_url: 'images/brand-creatives/zafiro-ad.mp4' },
    { id: 10, name: 'Lucky Darbar Creative', media_type: 'image', media_url: 'images/brand-creatives/lucky-darbar.jpg' },
    { id: 11, name: 'The Convenience Store Creative', media_type: 'image', media_url: 'images/brand-creatives/convenience-store.jpg' }
  ],
  col3: [
    { id: 12, name: 'Tuk Tuk Creative', media_type: 'image', media_url: 'images/brand-creatives/tuktuk-creative.jpg' },
    { id: 13, name: 'Dan Massey Creative', media_type: 'image', media_url: 'images/brand-creatives/dan-massey.jpg' },
    { id: 14, name: 'Crane Shoes Creative', media_type: 'image', media_url: 'images/brand-creatives/crane-shoes.jpg' },
    { id: 15, name: 'Myra Newspaper Video', media_type: 'video', media_url: 'images/brand-creatives/myra-newspaper.mp4' },
    { id: 16, name: 'Fly Bagdad Creative', media_type: 'image', media_url: 'images/brand-creatives/fly-bagdad.jpg' }
  ]
};

const DEFAULT_BRANDS_ROW1 = [
  { id: 1, company_name: 'Myra', logo_url: 'images/brands/myra.png' },
  { id: 2, company_name: 'Hijaz', logo_url: 'images/brands/hijaz-logo.png' },
  { id: 3, company_name: 'Uneeflow', logo_url: 'images/brands/uneeflow.png' },
  { id: 4, company_name: 'Milemir', logo_url: 'images/brands/milemir.png' },
  { id: 5, company_name: 'Whitehawk', logo_url: 'images/brands/whitehawk.png' },
  { id: 6, company_name: 'Top Baller', logo_url: 'images/brands/top-baller.png' },
  { id: 7, company_name: 'Dan Massey', logo_url: 'images/brands/dan-massey-logo.png' },
  { id: 8, company_name: 'Onex Roze', logo_url: 'images/brands/onex-roze-logo.png' },
  { id: 9, company_name: 'Al Fakhir', logo_url: 'images/brands/al-fakhir.png' },
  { id: 10, company_name: 'Rumico', logo_url: 'images/brands/rumico.png' },
  { id: 11, company_name: 'Airlink Cargo', logo_url: 'images/brands/airlink-cargo.png' },
  { id: 12, company_name: 'Banana Leaf', logo_url: 'images/brands/bananaleaf.png' },
  { id: 13, company_name: 'Blue Star', logo_url: 'images/brands/bluestar.png' },
  { id: 14, company_name: 'Bright Cargo', logo_url: 'images/brands/brightcargo.png' },
  { id: 15, company_name: 'Creative Graphics', logo_url: 'images/brands/creative-graphics.png' },
  { id: 16, company_name: 'Elite Al Hijaz', logo_url: 'images/brands/elitealhijaz.png' },
  { id: 17, company_name: 'Elite Tours', logo_url: 'images/brands/elitetours.png' },
  { id: 18, company_name: 'Eu Bakeries Equipments', logo_url: 'images/brands/eubakeries-equipments.png' },
  { id: 19, company_name: 'GEP', logo_url: 'images/brands/gep.png' }
];

const DEFAULT_BRANDS_ROW2 = [
  { id: 20, company_name: 'Cavara', logo_url: 'images/brands/cavara.png' },
  { id: 21, company_name: 'Wefaq', logo_url: 'images/brands/wefaq monochrome logo.png' },
  { id: 22, company_name: 'Classic Trip', logo_url: 'images/brands/classictrip.png' },
  { id: 23, company_name: 'ICLX', logo_url: 'images/brands/iclx.png' },
  { id: 24, company_name: 'Mahanama', logo_url: 'images/brands/mahanama.png' },
  { id: 25, company_name: 'Crane Shoes', logo_url: 'images/brands/crane-shoes.png' },
  { id: 26, company_name: 'The Convenience Store', logo_url: 'images/brands/convenience-store.png' },
  { id: 27, company_name: 'Lucky Darbar', logo_url: 'images/brands/lucky-darbar.png' },
  { id: 28, company_name: 'Fly Bagdad', logo_url: 'images/brands/fly-bagdad.png' },
  { id: 29, company_name: 'Hamada Enterprises', logo_url: 'images/brands/hamada-enterprises.png' },
  { id: 30, company_name: 'KR Express', logo_url: 'images/brands/krexpress.png' },
  { id: 31, company_name: 'NABD Emirates', logo_url: 'images/brands/nabdemirates.png' },
  { id: 32, company_name: 'Oxbridge Academy', logo_url: 'images/brands/oxbridge-academy.png' },
  { id: 33, company_name: 'QR Quma Rentals', logo_url: 'images/brands/qrqumarentals.png' },
  { id: 34, company_name: 'Trico Arabia', logo_url: 'images/brands/tricoarabia.png' },
  { id: 35, company_name: 'Tuk Tuk Marbella', logo_url: 'images/brands/tuktukmarbella.png' },
  { id: 36, company_name: 'Victoria Ingredients', logo_url: 'images/brands/victoriaingredients.png' },
  { id: 37, company_name: 'Zahrani Group', logo_url: 'images/brands/zahrani-group.png' },
  { id: 38, company_name: 'NCH', logo_url: 'images/brands/nch.png' }
];

const renderBentoCardsHTML = (items) => {
  if (!items || items.length === 0) return '';
  return items.map(item => {
    const isVid = item.media_type === 'video';
    const cardClass = isVid ? 'bento-card bento-card--video' : 'bento-card';
    const mediaUrl = getMediaUrl(item.media_url);
    const posterUrl = item.poster_url ? getMediaUrl(item.poster_url) : '';
    const name = (item.name || '').replace(/"/g, '&quot;');

    if (isVid) {
      return `<div class="${cardClass}">` +
        `<video class="bento-video" src="${mediaUrl}" ${posterUrl ? `poster="${posterUrl}"` : ''} aria-label="${name}" loop muted playsinline preload="none" disablepictureinpicture></video>` +
        `<div class="bento-overlay"></div>` +
        `</div>`;
    }
    return `<div class="${cardClass}">` +
      `<img src="${mediaUrl}" alt="${name}" class="bento-img" loading="lazy" decoding="async" />` +
      `<div class="bento-overlay"></div>` +
      `</div>`;
  }).join('');
};

const renderBrandCardsHTML = (items) => {
  if (!items || items.length === 0) return '';
  return items.map(b => {
    const logoUrl = getMediaUrl(b.logo_url);
    const name = (b.company_name || '').replace(/"/g, '&quot;');
    return `<div class="brand-card">` +
      `<img src="${logoUrl}" alt="${name}" loading="lazy" decoding="async" />` +
      `</div>`;
  }).join('');
};

export default function Welcome() {
  const [bentoColumns, setBentoColumns] = useState(DEFAULT_BENTO_COLUMNS);
  const [bentoReady, setBentoReady] = useState(true);
  const [brandsRows, setBrandsRows] = useState({ row1: DEFAULT_BRANDS_ROW1, row2: DEFAULT_BRANDS_ROW2 });

  useEffect(() => {
    // Fetch dynamic Hero Bento media from Supabase / API
    fetch('/api/hero-bento')
      .then(r => r.headers.get('content-type')?.includes('application/json') ? r.json() : {})
      .then(data => {
        if (data.success && data.itemsByColumn) {
          setBentoColumns({
            col1: Array.isArray(data.itemsByColumn.col1) ? data.itemsByColumn.col1 : [],
            col2: Array.isArray(data.itemsByColumn.col2) ? data.itemsByColumn.col2 : [],
            col3: Array.isArray(data.itemsByColumn.col3) ? data.itemsByColumn.col3 : []
          });
          setBentoReady(true);
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cambm:bento-updated'));
          }, 80);
        }
      })
      .catch(() => {
        setBentoReady(true);
      });

    // Fetch dynamic Brands from Supabase / API
    fetch('/api/brands')
      .then(r => r.headers.get('content-type')?.includes('application/json') ? r.json() : {})
      .then(data => {
        if (data.success && Array.isArray(data.brands)) {
          const published = data.brands.filter(b => b.status === 'published');
          const half = Math.ceil(published.length / 2);
          setBrandsRows({
            row1: published.slice(0, half),
            row2: published.slice(half)
          });
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('cambm:brands-updated'));
          }, 80);
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    const navigationEntry = performance.getEntriesByType("navigation")[0];
    const isRefresh = navigationEntry?.type === "reload";
    let hashScrollTimer;

    const hashTarget = window.location.hash.slice(1);
    const isSupportedHash = ["why-CAMBM", "packages"].includes(hashTarget);

    if (isSupportedHash && isRefresh) {
      window.history.replaceState(null, "", "/");
      window.scrollTo(0, 0);
    } else if (isSupportedHash) {
      let attempts = 0;
      hashScrollTimer = window.setInterval(() => {
        attempts++;
        const target = document.getElementById(hashTarget);
        if (target) {
          window.clearInterval(hashScrollTimer);
          window.requestAnimationFrame(() => {
            const targetY = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - 80);
            window.scrollTo({ top: targetY, behavior: "smooth" });
          });
        } else if (attempts > 20) {
          window.clearInterval(hashScrollTimer);
        }
      }, 50);
    } else if (!window.location.hash) {
      window.scrollTo(0, 0);
    }

    // Dispatch event to re-trigger vanilla JS animations safely
    const revealEvent = new CustomEvent("cambm:revealed");
    document.dispatchEvent(revealEvent);
    if (window.CAMBMTheme && window.CAMBMTheme.initControls)
      window.CAMBMTheme.initControls();
    if (window.initI18n) window.initI18n();
    return () => {
      if (hashScrollTimer) window.clearInterval(hashScrollTimer);
    };
  }, []);

  return (
    <>
      <MotionPageLoader />

      {/*  Custom Cursor  */}
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>

      {/*  Header  */}
      <motion.header
        className="header"
        id="header"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="header-inner">
          <a
            href="/"
            className="logo js-logo-home"
            data-i18n-attr="aria-label:nav.homeAriaLabel"
            aria-label="Cambridge Marketing - back to top"
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
            <a href="#hero" className="nav-link" data-i18n="nav.home">
              Home
            </a>
            <a href="#services" className="nav-link" data-i18n="nav.services">
              Services
            </a>
            <a href="#combo-packages" className="nav-link" data-i18n="nav.packages">
              Packages
            </a>
            <a href="#why-CAMBM" className="nav-link" data-i18n="nav.whyCambm">
              Why CAMBM
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
        {/*  Mobile nav panel: only shown below 1024px, toggled by the hamburger button  */}
        <nav className="mobile-nav" id="mobileNav">
          <a href="#hero" className="mobile-nav-link" data-i18n="nav.home">
            Home
          </a>
          <a href="#services" className="mobile-nav-link" data-i18n="nav.services">
            Services
          </a>
          <a href="#combo-packages" className="mobile-nav-link" data-i18n="nav.packages">
            Packages
          </a>
          <a
            href="#why-CAMBM"
            className="mobile-nav-link"
            data-i18n="nav.whyCambm"
          >
            Why CAMBM
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
      </motion.header>
      {/*  Dims the page behind the open mobile nav; clicking it closes the menu  */}
      <div className="mobile-nav-backdrop" id="mobileNavBackdrop"></div>
      <motion.section
        className="hero"
        id="hero"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="hero-bg"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <p className="hero-eyebrow" data-i18n="hero.eyebrow">
              Marketing + Technology, Under One Roof
            </p>
            <h1 className="hero-title" data-i18n="hero.title">
              <em>Beyond</em> <br /> Social Media.
            </h1>
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
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <div className="hero-stat-value">
                  <AnimatedCounter value={430} suffix="+" duration={3000} delay={100} />
                </div>
                <div className="hero-stat-label" data-i18n="hero.stat1Label">
                  Projects Delivered
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">
                  <AnimatedCounter value={97} suffix="%" duration={3000} delay={250} />
                </div>
                <div className="hero-stat-label" data-i18n="hero.stat2Label">
                  Client Satisfaction
                </div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">
                  <AnimatedCounter value={24} suffix="h" duration={3000} delay={400} />
                </div>
                <div className="hero-stat-label" data-i18n="hero.stat3Label">
                  Avg. Turnaround
                </div>
              </div>
            </div>
          </div>
          <motion.div
            className="hero-bento"
            data-lenis-prevent
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: (bentoReady && bentoColumns.col1.length === 0 && bentoColumns.col2.length === 0 && bentoColumns.col3.length === 0) ? 'none' : undefined
            }}
          >
            {/* Column 1 (Left Track) */}
            <div className="bento-column" data-lenis-prevent style={{ display: bentoColumns.col1.length === 0 ? 'none' : undefined }}>
              <div
                className="bento-track"
                dangerouslySetInnerHTML={{ __html: renderBentoCardsHTML(bentoColumns.col1) }}
              />
            </div>

            {/* Column 2 (Center Track) */}
            <div className="bento-column" data-lenis-prevent style={{ display: bentoColumns.col2.length === 0 ? 'none' : undefined }}>
              <div
                className="bento-track"
                dangerouslySetInnerHTML={{ __html: renderBentoCardsHTML(bentoColumns.col2) }}
              />
            </div>

            {/* Column 3 (Right Track) */}
            <div className="bento-column" data-lenis-prevent style={{ display: bentoColumns.col3.length === 0 ? 'none' : undefined }}>
              <div
                className="bento-track"
                dangerouslySetInnerHTML={{ __html: renderBentoCardsHTML(bentoColumns.col3) }}
              />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/*  Trusted Brands  */}
      <section className="brands" id="brands">
        <div className="brands-inner">
          <p className="brands-title scroll-reveal" data-i18n="brands.title">
            Brands that trust us
          </p>
        </div>
        <div className="brands-marquee scroll-reveal" data-lenis-prevent-wheel>
          <div
            className="brands-track"
            dangerouslySetInnerHTML={{ __html: renderBrandCardsHTML(brandsRows.row1) }}
          />
        </div>
        <div className="brands-marquee scroll-reveal" data-lenis-prevent-wheel>
          <div
            className="brands-track"
            dangerouslySetInnerHTML={{ __html: renderBrandCardsHTML(brandsRows.row2) }}
          />
        </div>
      </section>

      {/*  AI Creative Section  */}
      <section className="section-ai" id="ai">
        <div className="section-inner">
          <p className="section-eyebrow scroll-reveal" data-i18n="ai.eyebrow">
            BUILT FOR MORE THAN VISIBILITY.
          </p>
          <h2 className="section-title scroll-reveal" data-i18n="ai.title">
            One <em>Connected</em> System for Growth,
            <br />
            Technology and Operations.
          </h2>
          <p className="section-desc scroll-reveal" data-i18n="ai.desc">
            Businesses do not grow through marketing alone. Sustainable growth
            depends on how well your brand, campaigns, website, sales tools, and
            internal systems work together.
            <br />
            <br />
            Cambridge Marketing brings these functions into one connected
            ecosystem. From attracting the right audience to converting leads,
            managing sales, automating workflows, and tracking performance,
            every part is designed to support the same business objective.
          </p>
          <div className="feature-grid">
            <div className="feature-card scroll-reveal stagger-1">
              {/*  <div className="feature-icon">&#9889;</div>  */}
              <h3 className="feature-title" data-i18n="ai.feature1Title">
                Brand Strategy &amp; Creative Direction
              </h3>
              <p className="feature-desc" data-i18n="ai.feature1Desc">
                A clear brand system supported by strategic campaigns,
                consistent content, and professional creative that strengthens
                how your business is recognised.
              </p>
            </div>
            <div className="feature-card scroll-reveal stagger-2">
              {/*  <div className="feature-icon">&#127912;</div>  */}
              <h3 className="feature-title" data-i18n="ai.feature2Title">
                Social Media &amp; Performance Advertising
              </h3>
              <p className="feature-desc" data-i18n="ai.feature2Desc">
                Purpose-driven content and targeted campaigns across Meta,
                TikTok, and Google, focused on reaching relevant audiences and
                generating qualified opportunities.
              </p>
            </div>
            <div className="feature-card scroll-reveal stagger-3">
              {/*  <div className="feature-icon">&#128640;</div>  */}
              <h3 className="feature-title" data-i18n="ai.feature3Title">
                Websites &amp; Conversion Experiences
              </h3>
              <p className="feature-desc" data-i18n="ai.feature3Desc">
                Fast, credible websites and landing pages that communicate value
                clearly and guide visitors towards enquiries, bookings, or
                purchases.
              </p>
            </div>
            <div className="feature-card scroll-reveal stagger-4">
              {/*  <div className="feature-icon">&#128200;</div>  */}
              <h3 className="feature-title" data-i18n="ai.feature4Title">
                POS &amp; ERP Solutions
              </h3>
              <p className="feature-desc" data-i18n="ai.feature4Desc">
                Custom systems that connect billing, inventory, sales,
                reporting, and operations, giving your team greater control and
                reducing disconnected processes.
              </p>
            </div>
            <div className="feature-card scroll-reveal stagger-5">
              {/*  <div className="feature-icon">&#128161;</div>  */}
              <h3 className="feature-title" data-i18n="ai.feature5Title">
                AI Automation &amp; Lead Management
              </h3>
              <p className="feature-desc" data-i18n="ai.feature5Desc">
                Automated lead capture, follow-ups, customer journeys, and
                routine workflows that improve response times and keep
                opportunities moving.
              </p>
            </div>
            <div className="feature-card scroll-reveal stagger-6">
              {/*  <div className="feature-icon">&#128260;</div>  */}
              <h3 className="feature-title" data-i18n="ai.feature6Title">
                Reporting &amp; Business Intelligence
              </h3>
              <p className="feature-desc" data-i18n="ai.feature6Desc">
                Clear performance insights across marketing, leads, sales, and
                operations, helping you identify what works and make
                better-informed decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/*  Differentiator / "Most agencies stop at the post"  */}
      <section className="differentiator" id="why-us">
        <div className="differentiator-card scroll-reveal">
          <div className="differentiator-glow"></div>
          <div className="differentiator-left">
            <h2 className="differentiator-title" data-i18n="diff.title">
              Most agencies stop at the post. <em>We don't.</em>
            </h2>
          </div>
          <div className="differentiator-right">
            <div className="diff-item">
              <div className="diff-number">01</div>
              <div className="diff-content">
                <h3 data-i18n="diff.item1Title">One team, end to end</h3>
                <p data-i18n="diff.item1Desc">
                  Brief one partner instead of juggling five. Strategy, creative
                  and engineering under a single roof.
                </p>
              </div>
            </div>
            <div className="diff-item">
              <div className="diff-number">02</div>
              <div className="diff-content">
                <h3 data-i18n="diff.item2Title">Marketing meets operations</h3>
                <p data-i18n="diff.item2Desc">
                  Your ads, your website, your POS and ERP, connected, so growth
                  doesn't break your back office.
                </p>
              </div>
            </div>
            <div className="diff-item">
              <div className="diff-number">03</div>
              <div className="diff-content">
                <h3 data-i18n="diff.item3Title">Results you can read</h3>
                <p data-i18n="diff.item3Desc">
                  Clear monthly reporting. You always know what's working and
                  where your money is going.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*  Services Section  */}
      {/*  <section className="services" id="services">
    <div className="services-header scroll-reveal">
      <p className="section-eyebrow" style={{color: 'var(--text-muted)'}}>Our Services</p>
      <h2 className="section-title" style={{color: 'var(--text-dark)'}}>
        Move fast with <em>6+</em> scalable<br />creative services
      </h2>
    </div>
    <div className="services-grid">
      <div className="service-card scroll-reveal stagger-1">
        <div className="service-img-wrap">
          <img src="images/services/graphics-design.png" alt="Cambridge Marketing graphic design service" className="service-img" />
        </div>
        <div className="service-content">
          <p className="service-tag">Design</p>
          <h3 className="service-name">Graphic Design</h3>
          <p className="service-desc">Social media, ads, presentations, and more with stunning visuals that convert.</p>
        </div>
      </div>
      <div className="service-card scroll-reveal stagger-2">
        <div className="service-img-wrap">
          <img src="images/services/video-production.png" alt="Cambridge Marketing motion design service" className="service-img" />
        </div>
        <div className="service-content">
          <p className="service-tag">Video</p>
          <h3 className="service-name">Motion Design</h3>
          <p className="service-desc">Animated videos, GIFs, and motion graphics that bring your brand to life.</p>
        </div>
      </div>
      <div className="service-card scroll-reveal stagger-3">
        <div className="service-img-wrap">
          <img src="images/services/brand-identity.png" alt="Cambridge Marketing brand identity service" className="service-img" />
        </div>
        <div className="service-content">
          <p className="service-tag">Branding</p>
          <h3 className="service-name">Brand Identity</h3>
          <p className="service-desc">Complete brand systems, guidelines, and visual identities that stand out.</p>
        </div>
      </div>
      <div className="service-card scroll-reveal stagger-4">
        <div className="service-img-wrap">
          <img src="images/services/illustation.png" alt="Cambridge Marketing illustration service" className="service-img" />
        </div>
        <div className="service-content">
          <p className="service-tag">Art</p>
          <h3 className="service-name">Illustration</h3>
          <p className="service-desc">Custom illustrations, icons, and visual storytelling that captures your message.</p>
        </div>
      </div>
      <div className="service-card scroll-reveal stagger-5">
        <div className="service-img-wrap">
          <img src="images/services/web-design.png" alt="Cambridge Marketing web design service" className="service-img" />
        </div>
        <div className="service-content">
          <p className="service-tag">Digital</p>
          <h3 className="service-name">Web Design</h3>
          <p className="service-desc">Landing pages, websites, and digital experiences optimized for conversion.</p>
        </div>
      </div>
      <div className="service-card scroll-reveal stagger-6">
        <div className="service-img-wrap">
          <img src="images/services/video-production.png" alt="Cambridge Marketing video production service" className="service-img" />
        </div>
        <div className="service-content">
          <p className="service-tag">Production</p>
          <h3 className="service-name">Video Production</h3>
          <p className="service-desc">End-to-end video creation from concept to final cut with AI-powered editing.</p>
        </div>
      </div>
    </div>
  </section>  */}
      {/*  What We Do  */}
      {/*  <section className="what-we-do" id="what-we-do">
    <div className="section-inner">
      <p className="section-eyebrow scroll-reveal" style={{color: 'var(--text-muted)'}}>Services</p>
      <h2 className="section-title scroll-reveal" style={{color: 'var(--text-dark)'}}>Four things, done properly.</h2>
      <p className="section-desc scroll-reveal" style={{color: 'var(--text-dark)', opacity: '0.7'}}>No bloated service menus. We focus on the work that actually moves your business, and we do it well.</p>
    </div>
    <div className="wwd-list">
      <div className="wwd-row">
        <div className="wwd-item scroll-reveal">
          <div className="wwd-body">
            <h3>Social Media &amp; Content</h3>
            <p>Always-on management plus photo and video shoots that look the part. We keep your brand in feeds, not forgotten.</p>
            <div className="wwd-tags"><span>Instagram</span><span>Facebook</span><span>Shoots</span></div>
          </div>
        </div>
        <div className="wwd-item scroll-reveal">
          <div className="wwd-body">
            <h3>Performance Ads</h3>
            <p>Meta and beyond, run by people who've managed ad accounts at scale. Built for leads and sales, not vanity likes.</p>
            <div className="wwd-tags"><span>Meta Ads</span><span>Lead Gen</span><span>ROI Focused</span></div>
          </div>
        </div>
        <div className="wwd-item scroll-reveal">
          <div className="wwd-body">
            <h3>Brand &amp; Creative</h3>
            <p>Identity, campaign creative, banners. A consistent, premium look across everything you put out.</p>
            <div className="wwd-tags"><span>Identity</span><span>Design</span><span>Creative</span></div>
          </div>
        </div>
      </div>
      <div className="wwd-item wwd-item-highlight scroll-reveal">
        <div className="wwd-badge">&#9733; What sets us apart</div>
        <div className="wwd-body">
          <h3>Software, Apps &amp; IT Solutions</h3>
          <p>Custom web and mobile app development, POS systems, full ERP and enterprise IT solutions, engineered by Cambridge Technologies. Marketing that actually connects to how your business runs.</p>
          <div className="wwd-tags"><span>Web &amp; Apps</span><span>POS / ERP</span><span>IT Solutions</span></div>
        </div>
      </div>
    </div>
  </section>  */}

      {/*  Comparison Section  */}
      <section className="comparison" id="why-CAMBM">
        <div className="comparison-inner">
          <div className="comparison-header">
            <h2
              className="section-title scroll-reveal"
              data-i18n="comparison.title"
            >
              Hiring In-House or Traditional Outsourcing?
              <br />
              <em>Neither</em>
            </h2>
            <p
              className="comparison-supporting scroll-reveal"
              data-i18n="comparison.supporting"
            >
              Build one connected growth system instead of managing separate
              people, platforms and providers
            </p>
          </div>
          {/*  Scroll wrapper: on mobile, ONLY this element scrolls horizontally.
           It must be separate from .comparison-inner so the section heading
           above it stays put instead of sliding along with the table.  */}
          <div className="comparison-table-scroll scroll-reveal">
            <div className="comparison-table">
              <div
                className="comparison-cell head"
                data-i18n="comparison.requirement"
              >
                What Your Business Needs
              </div>
              <div
                className="comparison-cell head"
                data-i18n="comparison.hiringInHouse"
              >
                Hiring In-House
              </div>
              <div
                className="comparison-cell head"
                data-i18n="comparison.traditionalOutsourcing"
              >
                Traditional Outsourcing
              </div>
              <div
                className="comparison-cell head highlight"
                data-i18n="comparison.cambm"
              >
                Cambridge Marketing
              </div>

              <div className="comparison-cell" data-i18n="comparison.strategy">
                Growth Strategy
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.strategyInHouse"
              >
                Requires experienced senior talent and internal management
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.strategyOutsourcing"
              >
                Strategy can become fragmented across providers
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.strategyCambm"
              >
                One growth strategy connecting marketing, technology and
                operations
              </div>

              <div className="comparison-cell" data-i18n="comparison.creative">
                Creative &amp; Content
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.creativeInHouse"
              >
                Requires designers, editors and content specialists
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.creativeOutsourcing"
              >
                Usually delivered request by request
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.creativeCambm"
              >
                Planned creative built around campaigns and business objectives
              </div>

              <div className="comparison-cell" data-i18n="comparison.metaAds">
                Meta &amp; TikTok Ads
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.metaAdsInHouse"
              >
                Requires dedicated performance expertise
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.metaAdsOutsourcing"
              >
                Often managed separately from creative and strategy
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.metaAdsCambm"
              >
                Campaigns, creative and optimisation managed as one system
              </div>

              <div className="comparison-cell" data-i18n="comparison.googleAds">
                Google Ads
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.googleAdsInHouse"
              >
                Requires specialist search and conversion expertise
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.googleAdsOutsourcing"
              >
                Usually another specialist or agency
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.googleAdsCambm"
              >
                Search, performance and landing pages aligned around conversions
              </div>

              <div className="comparison-cell" data-i18n="comparison.website">
                Website &amp; E-Commerce
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.websiteInHouse"
              >
                Requires development, maintenance and marketing coordination
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.websiteOutsourcing"
              >
                Website and marketing are often handled separately
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.websiteCambm"
              >
                Websites and e-commerce built to support marketing, sales and
                operations
              </div>

              <div
                className="comparison-cell"
                data-i18n="comparison.posSoftware"
              >
                POS Software
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.posSoftwareInHouse"
              >
                Requires a separate software provider and implementation team
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.posSoftwareOutsourcing"
              >
                Often disconnected from your website and marketing
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.posSoftwareCambm"
              >
                Custom POS systems connected to e-commerce, inventory and
                business workflows
              </div>

              <div className="comparison-cell" data-i18n="comparison.erp">
                ERP &amp; Business Systems
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.erpInHouse"
              >
                Expensive to build and maintain internally
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.erpOutsourcing"
              >
                Usually implemented as a standalone system
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.erpCambm"
              >
                ERP, POS, website and operational systems designed to work
                together
              </div>

              <div
                className="comparison-cell"
                data-i18n="comparison.aiAutomation"
              >
                AI Automations &amp; Agents
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.aiAutomationInHouse"
              >
                Requires specialised AI and automation talent
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.aiAutomationOutsourcing"
              >
                Often added as isolated tools
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.aiAutomationCambm"
              >
                AI agents and automations integrated into sales, support,
                marketing and operations
              </div>

              <div className="comparison-cell" data-i18n="comparison.reporting">
                Reporting &amp; Data
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.reportingInHouse"
              >
                Data sits across different teams and platforms
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.reportingOutsourcing"
              >
                Reports arrive from multiple providers
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.reportingCambm"
              >
                Marketing, sales and operational data brought into one clearer
                view
              </div>

              <div
                className="comparison-cell"
                data-i18n="comparison.management"
              >
                Management &amp; Accountability
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.managementInHouse"
              >
                You recruit, brief and manage everyone
              </div>
              <div
                className="comparison-cell"
                data-i18n="comparison.managementOutsourcing"
              >
                You coordinate multiple agencies and vendors
              </div>
              <div
                className="comparison-cell highlight"
                data-i18n="comparison.managementCambm"
              >
                One partner. One workflow. One accountable team.
              </div>
            </div>
          </div>
          <div className="comparison-conclusion scroll-reveal">
            <p data-i18n="comparison.conclusion">
              Your Ads should talk to your website. Your Website should talk to
              your POS.
              <br />
              Your POS should talk to your Inventory. Your Data should inform
              what happens next.
            </p>
            <p
              className="comparison-conclusion-emphasis"
              data-i18n="comparison.integratedGrowth"
            >
              This is what we mean by Integrated Growth
            </p>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <ServicesSection />


      {/*  Testimonials  */}
      {/*  <section className="testimonials" id="testimonials">
    <div className="testimonials-inner">
      <div className="testimonials-header">
        <p className="section-eyebrow" style={{color: 'var(--text-muted)'}} data-i18n="testimonials.eyebrow">Don't just take it from us</p>
        <h2 className="section-title" style={{color: 'var(--text-dark)'}} data-i18n="testimonials.title">
          Creative wins, <em>told by our customers</em>
        </h2>
      </div>
      <div className="testimonials-grid">
        <div className="testimonial-card scroll-reveal stagger-1">
          <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p className="testimonial-quote" data-i18n="testimonials.quote1">"Our socials finally look the part, and the leads are actually coming through. Cambridge handles the shoots, the ads and the reporting, so we can focus on the food."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">HJ</div>
            <div className="testimonial-info">
              <h4>Hijaz</h4>
              <p data-i18n="testimonials.role1">Restaurant</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card scroll-reveal stagger-2">
          <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p className="testimonial-quote" data-i18n="testimonials.quote2">"They built our website and POS and run our campaigns, all from one team. Everything just connects, and we finally have one partner instead of five."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">OR</div>
            <div className="testimonial-info">
              <h4>Onex Roze</h4>
              <p data-i18n="testimonials.role2">Fine Jewelry</p>
            </div>
          </div>
        </div>
        <div className="testimonial-card scroll-reveal stagger-3">
          <div className="testimonial-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
          <p className="testimonial-quote" data-i18n="testimonials.quote3">"The monthly reporting is clear and honest. We always know what's working and where the budget is going. Sales are up and so is our brand."</p>
          <div className="testimonial-author">
            <div className="testimonial-avatar">CS</div>
            <div className="testimonial-info">
              <h4>Crane Shoes</h4>
              <p data-i18n="testimonials.role3">Footwear</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>  */}

      {/*  CTA Section  */}
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

      {/*  Footer  */}
      <footer className="footer" id="footer">
        <div className="footer-inner">
          <div className="footer-top" style={{ display: "none" }}>
            <div>
              <div className="footer-brand">
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
              </div>
              <p className="footer-desc">
                Marketing that grows you. Technology that runs you. One team for
                campaigns, brand, and the systems behind your business.
              </p>
            </div>
            <div>
              <h4 className="footer-col-title">Services</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    Graphic Design
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Motion Design
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Brand Identity
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Video Production
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Illustration
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Company</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="footer-col-title">Resources</h4>
              <ul className="footer-links">
                <li>
                  <a href="#" className="footer-link">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    API Docs
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Brand Guidelines
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="footer-link">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <FooterOffices />
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
            <FooterSocials />
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
          href={getPrimaryContactInfo().whatsapp}
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
          href={`tel:${getPrimaryContactInfo().phone.replace(/[^+\d]/g, '')}`}
          aria-label="Call Cambridge Marketing"
          data-i18n-attr="aria-label:contact.callAria"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7.1 3.5 9.5 8 7.8 9.8c1.3 2.7 3.6 5 6.3 6.3l1.8-1.7 4.5 2.4-.6 3c-.2.8-.9 1.4-1.8 1.4C9.7 21.2 2.8 14.3 2.8 6c0-.9.6-1.6 1.4-1.8l2.9-.7Z" />
          </svg>
        </a>
      </nav>

      {/*  Client card popup: shown on clicking a bento gallery image.
       Displays the clicked image and the client name only.  */}
      <div className="client-popup-backdrop" id="clientPopupBackdrop">
        <div
          className="client-popup"
          id="clientPopup"
          role="dialog"
          aria-modal="true"
          aria-label="Client"
        >
          <button
            className="client-popup-close"
            id="clientPopupClose"
            aria-label="Close"
          >
            &#10005;
          </button>
          <div className="client-popup-image" id="clientPopupImage"></div>
          <div className="client-popup-body">
            <h3 className="client-popup-title" id="clientPopupName">
              Client
            </h3>
          </div>
        </div>
      </div>

      {/*  Back to top  */}
      <button className="back-to-top" id="backToTop" aria-label="Back to top">
        &#8593;
      </button>

      {/*  First-visit country/language popup. Mandatory until a choice is saved
       to localStorage - see js/i18n.js. Reappears if that storage is cleared.  */}
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

      {/*  Enterprise contact-form popup. Submits via Formspree (no backend
       needed on static hosting) instead of a mailto link.  */}
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
            ></p>
          </form>
        </div>
      </div>

      {/*  Strategy-call / plan-selection popup: one shared modal reused by the
       "Book a strategy call" buttons (header, mobile nav, hero, CTA section)
       and each pricing card's "Select plan" button. Which Formspree endpoint,
       title and (for plans) price/term it shows is picked at click time from
       FORM_TYPES in js/i18n.js, keyed off the trigger's data-form-type.  */}
      <div className="contact-popup-backdrop" id="actionPopupBackdrop">
        <div
          className="contact-popup"
          role="dialog"
          aria-modal="true"
          aria-label="Get in touch"
        >
          <button
            className="contact-popup-close"
            id="actionPopupClose"
            aria-label="Close"
          >
            &#10005;
          </button>
          <h3 className="contact-popup-title" id="actionPopupTitle">
            Book a strategy call
          </h3>
          <p className="contact-popup-desc" id="actionPopupDesc">
            Tell us a bit about your business and we'll get back to you shortly.
          </p>
          <p
            className="action-popup-plan"
            id="actionPopupPlan"
            style={{ display: "none" }}
          ></p>
          <form id="actionPopupForm" className="contact-form">
            <label htmlFor="actionName" data-i18n="contact.nameLabel">
              Full name
            </label>
            <input
              id="actionName"
              type="text"
              name="name"
              required
              minLength="2"
              maxLength="100"
              pattern="[\p{L}\p{M}\s.'\-]{2,100}"
              title="Please enter a name using letters only (no numbers or symbols)"
            />
            <label htmlFor="actionEmail" data-i18n="contact.emailLabel">
              Email
            </label>
            <input
              id="actionEmail"
              type="email"
              name="email"
              required
              maxLength="150"
            />
            <label htmlFor="actionCompany" data-i18n="contact.companyLabel">
              Company
            </label>
            <input
              id="actionCompany"
              type="text"
              name="company"
              minLength="2"
              maxLength="100"
            />
            <label htmlFor="actionPhone" data-i18n="contact.phoneLabel">
              Phone (optional)
            </label>
            <input
              id="actionPhone"
              type="tel"
              name="phone"
              pattern="\+[0-9][0-9\s\-]{6,18}"
              placeholder="+94 77 123 4567"
              title="Include your country code, e.g. +94 77 123 4567"
            />
            <label htmlFor="actionMessage" data-i18n="contact.messageLabel">
              Message
            </label>
            <textarea
              id="actionMessage"
              name="message"
              rows="4"
              maxLength="2000"
            ></textarea>
            <input
              type="hidden"
              name="plan"
              id="actionPopupPlanField"
              value=""
            />
            <input
              type="hidden"
              name="_subject"
              id="actionPopupSubjectField"
              value=""
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
              id="actionPopupStatus"
              role="status"
            ></p>
          </form>
        </div>
      </div>

      {/*  Cal.com booking widget: turns every button with data-cal-link into a
       popup calendar (official "element click" embed snippet). Booking
       syncs straight to the connected Google Calendar - see cal.com/cambridge.marketing.  */}
    </>
  );
}
