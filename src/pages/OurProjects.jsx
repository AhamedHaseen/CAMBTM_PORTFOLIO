import { motion } from "motion/react";
import React, { useEffect } from "react";
import CursorGrid from "../components/CursorGrid";
import FooterOffices from "../components/FooterOffices";
import FooterSocials from "../components/FooterSocials";
import "../css/our-projects.css";

const ALL_SAAS_PROJECTS = [
  {
    id: "cambcard",
    title: "CAMBCARD (vCard)",
    image: "/images/our-projects/CAMBCARD (vCard).jpg",
    url: "https://saas.cambt.com/projects/vcard/",
  },
  {
    id: "emenu",
    title: "E-Menu",
    image: "/images/our-projects/E-Menu.jpg",
    url: "https://emenu.cdott.com/",
  },
  {
    id: "school",
    title: "School Management (eSchool SaaS)",
    image: "/images/our-projects/School Management With eSchool SaaS.jpg",
    url: "https://saas.cambt.com/projects/school/",
  },
  {
    id: "hostel",
    title: "Hostel Booking Platform",
    image: "/images/our-projects/Hostel Booking Platform.jpg",
    url: "https://saas.cambt.com/projects/hostel-managment/",
  },
  {
    id: "pharmacy",
    title: "Pharmacy Management System",
    image: "/images/our-projects/Pharmacy Management System.jpg",
    url: "https://saas.cambt.com/projects/pharmacy/",
  },
  {
    id: "car-rental",
    title: "Car Rental Management System",
    image: "/images/our-projects/Car Rental Management System.jpg",
    url: "https://saas.cambt.com/projects/car-rental/",
  },
  {
    id: "stock-pos",
    title: "POS with Inventory Management & HRM",
    image: "/images/our-projects/POS with Inventory Management & HRM.jpg",
    url: "https://saas.cambt.com/projects/stock/",
  },
  {
    id: "parking",
    title: "Parking Management System",
    image: "/images/our-projects/Parking Management System.jpg",
    url: "https://saas.cambt.com/projects/parking/",
  },
  {
    id: "property",
    title: "Property Management",
    image: "/images/our-projects/Property Management.jpg",
    url: "https://saas.cambt.com/projects/property/",
  },
  {
    id: "ecommerce",
    title: "ECommerce SaaS (Shopify Alternative)",
    image: "/images/our-projects/ECommerce SaaS (Shopify Alternatives).jpg",
    url: "https://saas.cambt.com/projects/ecommerce/",
  },
  {
    id: "travel",
    title: "Travel & Tourism Management System",
    image: "/images/our-projects/Travel & Tourism Management System.jpg",
    url: "https://saas.cambt.com/projects/travel/",
  },
  {
    id: "doctor",
    title: "Doctor Booking & Hospital Management",
    image: "/images/our-projects/Doctor Booking & Hospital Management.jpg",
    url: "https://saas.cambt.com/projects/doctor/",
  },
  {
    id: "chatbot",
    title: "AI-powered Customer Support Chatbot",
    image: "/images/our-projects/AI-powered Customer Support Chatbot (SaaS).jpg",
    url: "https://saas.cambt.com/projects/chatbot/",
  },
  {
    id: "eordar",
    title: "Advance E-Website / Ordering",
    image: "/images/our-projects/Advance E Website.jpg",
    url: "https://saas.cambt.com/projects/eordar/",
  },
  {
    id: "gym",
    title: "GYM Management System",
    image: "/images/our-projects/GYM Management System.jpg",
    url: "https://saas.cambt.com/projects/gym/",
  },
  {
    id: "whatsapp-telegram",
    title: "WhatsApp & Telegram Marketing SaaS",
    image: "/images/our-projects/WhatsApp & Telegram Marketing SaaS.jpg",
    url: "https://saas.cambt.com/projects/whatsapp-and-telegram/",
  },
  {
    id: "abaya",
    title: "Customized Abaya & Kandora",
    image: "/images/our-projects/Customized Abaya & Kandora.jpg",
    url: "https://shadenabaya.com/",
  },
  {
    id: "legal",
    title: "Legal Practice Management",
    image: "/images/our-projects/Legal Practice Management.jpg",
    url: "https://saas.cambt.com/projects/legal/",
  },
  {
    id: "advance-crm",
    title: "Advance CRM Software",
    image: "/images/our-projects/Advance CRM Software.jpg",
    url: "https://saas.cambt.com/projects/advance-crm/",
  },
  {
    id: "task-mgmt",
    title: "Task Management Software",
    image: "/images/our-projects/Task Management Software.jpg",
    url: "https://company.cdott.com/public/login",
  },
  {
    id: "hotel",
    title: "Hotel Room Booking System",
    image: "/images/our-projects/Hotel Room Booking System.jpg",
    url: "https://preview.wstacks.com/skyhostel/",
  },
  {
    id: "jewellery",
    title: "Jewellery Management System",
    image: "/images/our-projects/Jewellery Management System.jpg",
    url: "https://saas.cambt.com/projects/jewellery/",
  },
  {
    id: "appliance",
    title: "Home & Kitchen Appliance E-Stores",
    image: "/images/our-projects/Home & Kitchen Appliance E-Stores.jpg",
    url: "https://saas.cambt.com/projects/appliance/",
  },
  {
    id: "lms",
    title: "Online Learning Management (LMS)",
    image: "/images/our-projects/(LMS) Online Learning Management System.jpg",
    url: "https://saas.cambt.com/projects/learn/",
  },
];

export default function OurProjects() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const revealEvent = new CustomEvent("cambm:revealed");
    document.dispatchEvent(revealEvent);
    if (window.CAMBMTheme && window.CAMBMTheme.initControls) {
      window.CAMBMTheme.initControls();
    }
    if (window.initI18n) {
      window.initI18n();
    }
  }, []);

  const scrollToProjects = (e) => {
    e.preventDefault();
    const target = document.getElementById("projects-showcase");
    if (target) {
      const targetY = Math.max(0, target.getBoundingClientRect().top + window.pageYOffset - 80);
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  };

  return (
    <div className="projects-page">
      {/* Top Header Navigation */}
      <header className="header" id="header">
        <div className="header-inner">
          <a
            href="/"
            className="logo js-logo-home"
            aria-label="Cambridge Marketing, back to top"
            data-i18n-attr="aria-label:nav.homeAriaLabel"
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
            <a href="/#services" className="nav-link" data-i18n="nav.services">
              Services
            </a>
            <a href="/#combo-packages" className="nav-link" data-i18n="nav.packages">
              Packages
            </a>
            <a href="/our-projects" className="nav-link" data-i18n="nav.ourProjects">
              Our Projects
            </a>
            <a
              href="/#why-CAMBM"
              data-scroll-target="why-CAMBM"
              className="nav-link"
              data-i18n="nav.whyCambm"
            >
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

        {/* Mobile Drawer Menu */}
        <nav className="mobile-nav" id="mobileNav">
          <a href="/" className="mobile-nav-link" data-i18n="nav.home">
            Home
          </a>
          <a href="/#services" className="mobile-nav-link" data-i18n="nav.services">
            Services
          </a>
          <a
            href="/#combo-packages"
            className="mobile-nav-link"
            data-i18n="nav.packages"
          >
            Packages
          </a>
          <a
            href="/our-projects"
            className="mobile-nav-link"
            data-i18n="nav.ourProjects"
          >
            Our Projects
          </a>
          <a
            href="/#why-CAMBM"
            data-scroll-target="why-CAMBM"
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
      </header>

      {/* 100% Display Width Interactive CursorGrid Hero Section (No Border) */}
      <section className="projects-hero-section">
        <div className="projects-hero-grid-bg">
          <CursorGrid
            cellSize={60}
            color="#ff5a00"
            radius={160}
            falloff="smooth"
            holdTime={350}
            fadeDuration={700}
            lineWidth={1.2}
            maxOpacity={0.9}
            fillOpacity={0}
            gridOpacity={0}
            cellRadius={4}
            clickPulse={true}
            pulseSpeed={650}
          />
        </div>

        <motion.div
          className="projects-hero-content"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="projects-hero-heading">
            Explore Our Suite of <em>SaaS Projects</em>
          </h1>
          <div className="projects-hero-cta-wrap">
            <a
              href="#projects-showcase"
              onClick={scrollToProjects}
              className="btn btn-primary projects-hero-btn"
            >
              View Our Projects
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ marginLeft: "8px" }}
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Main Content Showcase Section */}
      <main className="projects-container">
        <section className="projects-showcase-section" id="projects-showcase">
          <div className="projects-showcase-header">
            <h2 className="projects-showcase-title">
              <span className="title-first-line">
                Unlock Innovations by Cambridge Marketing: Explore Our SaaS
              </span>
              <span className="title-highlight">Projects</span>
            </h2>
          </div>

          {/* 24 Projects Grid: Above Title, Middle Image, Below Launch Demo */}
          <div className="projects-grid">
            {ALL_SAAS_PROJECTS.map((project, index) => (
              <motion.a
                key={project.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  duration: 0.45,
                  delay: Math.min((index % 6) * 0.05, 0.3),
                  ease: [0.22, 1, 0.36, 1],
                }}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-card"
              >
                {/* 1. Above: Text / Title */}
                <div className="project-card-header">
                  <h3 className="project-card-title">{project.title}</h3>
                </div>

                {/* 2. Middle: Project Media Image */}
                <div className="project-card-image-wrap">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-card-img"
                    loading="lazy"
                  />
                  <div className="project-card-hover-overlay">
                    <div className="project-card-hover-icon">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* 3. Below: Launch Demo Button Action */}
                <div className="project-card-footer">
                  <span className="live-demo-btn">
                    Launch Demo
                    <svg
                      className="live-demo-arrow"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
        </section>
      </main>

      {/* Shared CTA Section (Exact Match to Home & About) */}
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

      {/* Shared Footer (Exact Match to Home & About) */}
      <footer className="footer" id="footer">
        <div className="footer-inner">
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
