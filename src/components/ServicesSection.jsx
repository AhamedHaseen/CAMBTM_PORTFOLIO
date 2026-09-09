import React, { useState, useEffect } from "react";
import "../css/services-redesign.css";

const SERVICES_DATA = {
  build: {
    category: "Technology & Systems",
    title: "Build",
    desc: "Digital infrastructure, software and business systems engineered around the way your company actually operates.",
    micro: "From customer-facing platforms to internal operations, integrations and automation.",
    services: [
      { num: "01", name: "Website Development", desc: "Corporate, portfolio, e-commerce and custom websites." },
      { num: "02", name: "POS Systems", desc: "Sales, billing, inventory and multi-branch operations." },
      { num: "03", name: "ERP Systems", desc: "Connected workflows for finance, HR, stock and operations." },
      { num: "04", name: "Custom Software & App Development", desc: "Tailored web, mobile and internal business platforms." },
      { num: "05", name: "Workflow Automation", desc: "Automate repetitive tasks, approvals and operational handoffs." },
      { num: "06", name: "AI Integration", desc: "AI agents, assistants and AI-powered business processes." },
      { num: "07", name: "CRM Solutions", desc: "Lead, pipeline, customer and sales workflow systems." },
      { num: "08", name: "Maintenance & Technical Support", desc: "Monitoring, updates, fixes, performance and ongoing support." },
      { num: "09", name: "SaaS Product Development", desc: "Design and engineering for subscription-based software products." },
      { num: "10", name: "Cybersecurity", desc: "Security reviews, hardening, access controls and protection." },
      { num: "11", name: "Data Migration", desc: "Structured migration across platforms, systems and databases." },
      { num: "12", name: "Data Analysis", desc: "Reporting, dashboards and decision-ready business insights." },
      { num: "13", name: "API Integration", desc: "Connect payments, platforms, third-party tools and internal systems." },
    ],
    hosting: {
      eyebrow: "Hosting & Infrastructure",
      title: "Hosting that scales with the system.",
      desc: "Annual hosting plans are available for standard business requirements, with customised hosting solutions for higher traffic, storage, security, email or infrastructure needs.",
      plans: ["Starter Hosting", "Marketing Hosting", "Elite Hosting", "Enterprise Hosting"],
      note: "Custom infrastructure can be scoped around your technical requirements.",
    },
  },
  create: {
    category: "Brand & Content",
    title: "Create",
    desc: "Creative production for brands that need a consistent visual identity and high-quality content across campaigns and channels.",
    micro: "Engage a single production service or build a recurring creative workflow.",
    services: [
      { num: "01", name: "Branding", desc: "Identity systems, brand guidelines and rollout assets." },
      { num: "02", name: "Video Production", desc: "End-to-end shoots for campaigns, brands and social media." },
      { num: "03", name: "Video Editing", desc: "Reels, advertisements, corporate and social-first edits." },
      { num: "04", name: "Photography", desc: "Product, food, people, spaces and campaign photography." },
      { num: "05", name: "Motion Graphics", desc: "Animated brand visuals, explainers and performance creatives." },
      { num: "06", name: "Graphic Design", desc: "Social media, campaign and promotional creative production." },
      { num: "07", name: "AI Creative Studio", desc: "AI-led imagery, video, UGC-style and campaign production." },
      { num: "08", name: "Presenter-Led Content", desc: "On-camera content for education, promotion and brand storytelling." },
    ],
  },
  grow: {
    category: "Marketing & Acquisition",
    title: "Grow",
    desc: "Performance, search and lifecycle marketing designed to increase visibility, demand, qualified leads and measurable business growth.",
    micro: "Strategy, execution, optimisation and reporting can be scoped by channel or as one growth programme.",
    services: [
      { num: "01", name: "Social Media Management", desc: "Planning, publishing, community management and reporting." },
      { num: "02", name: "SEO", desc: "Technical, on-page and content-led search optimisation." },
      { num: "03", name: "Lead Generation", desc: "Campaigns and funnels built to acquire qualified prospects." },
      { num: "04", name: "Email & WhatsApp Marketing", desc: "Lifecycle, campaign, nurture and broadcast communication." },
      { num: "05", name: "Paid Advertising", desc: "Meta, TikTok and Google campaign management." },
      { num: "06", name: "E-Commerce Marketing", desc: "Acquisition, conversion and retention for online stores." },
      { num: "07", name: "Google Business Profile Management", desc: "Profile optimisation, content, reviews and local visibility." },
    ],
  },
};

export const openCalModal = (packageName = "", e = null) => {
  if (e && e.preventDefault) {
    e.preventDefault();
  }

  if (typeof window !== "undefined") {
    // 1. Check if Cal API is initialized on window
    if (typeof window.Cal === "function") {
      try {
        const lang = localStorage.getItem("cambm_language") || "en";
        const calLocale = ["en", "es", "ar"].includes(lang) ? lang : "en";
        const config = {
          layout: "month_view",
          language: calLocale,
          locale: calLocale,
        };
        if (packageName) {
          config["notes"] = `Inquiry regarding: ${packageName}`;
        }
        window.Cal("openModal", {
          calLink: "cambridge.marketing",
          config: config,
        });
        return;
      } catch (err) {
        console.warn("Cal openModal API error:", err);
      }
    }

    // 2. Trigger header Cal button if present in DOM
    const headerCalBtn = document.querySelector(".header .js-open-cal");
    if (headerCalBtn) {
      headerCalBtn.click();
      return;
    }

    // 3. Fallback direct booking link in new tab
    window.open("https://cal.com/cambridge.marketing", "_blank", "noopener,noreferrer");
  }
};

export default function ServicesSection() {
  const [activeTab, setActiveTab] = useState("build");
  const [servicesData, setServicesData] = useState(SERVICES_DATA);

  const populateServices = React.useCallback((list) => {
    if (!Array.isArray(list) || list.length === 0) return;
    const grouped = {
      build: { ...SERVICES_DATA.build, services: [] },
      create: { ...SERVICES_DATA.create, services: [] },
      grow: { ...SERVICES_DATA.grow, services: [] },
    };

    const activeServices = list.filter((s) => s.status !== 'inactive' && s.is_active !== false);

    ['build', 'create', 'grow'].forEach((cat) => {
      const catItems = activeServices
        .filter((s) => (s.category || '').toLowerCase() === cat)
        .sort((a, b) => (Number(a.display_order || a.sort_order || 0)) - (Number(b.display_order || b.sort_order || 0)));

      if (catItems.length > 0) {
        grouped[cat].services = catItems.map((item, idx) => ({
          id: item.id || `srv_${idx}`,
          num: String(idx + 1).padStart(2, '0'),
          name: item.name,
          desc: item.description,
        }));
      } else {
        grouped[cat].services = SERVICES_DATA[cat].services;
      }
    });

    setServicesData(grouped);
  }, []);

  useEffect(() => {
    // 1. Initial load from localStorage for instant client synchronization
    try {
      const cached = localStorage.getItem('cambm_services');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          populateServices(parsed);
        }
      }
    } catch (e) {}

    // 2. Fetch from backend API
    fetch('/api/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = data?.services || data?.data;
        if (data && data.success && Array.isArray(list) && list.length > 0) {
          populateServices(list);
          try {
            localStorage.setItem('cambm_services', JSON.stringify(list));
          } catch (e) {}
        }
      })
      .catch((err) => {
        console.warn('Could not fetch dynamic services, using active cache/defaults:', err);
      });

    // 3. Listen for real-time updates when services are added in the admin dashboard
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem('cambm_services');
        if (saved) {
          const parsed = JSON.parse(saved);
          populateServices(parsed);
        }
      } catch (e) {}
    };

    window.addEventListener('cambm_services_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cambm_services_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const currentTab = servicesData[activeTab] || SERVICES_DATA[activeTab];

  return (
    <section className="packages srv-section" id="packages" style={{ scrollMarginTop: "90px" }}>
      {/* Section Header */}
      <div className="section-inner packages-heading">
        <p className="section-eyebrow scroll-reveal" data-i18n="packages.eyebrow">
          Our Services
        </p>
        <h2 className="section-title scroll-reveal" data-i18n="packages.title">
          Choose what your business needs
        </h2>
      </div>

      {/* Segmented Switcher */}
      <div className="segmented-wrap">
        <div className="segmented" role="tablist" aria-label="Service categories">
          <div
            className="segmented-glider"
            style={{
              transform: `translateX(${
                activeTab === "build" ? "0%" : activeTab === "create" ? "100%" : "200%"
              })`
            }}
          />
          <button
            type="button"
            className={`tab ${activeTab === "build" ? "active" : ""}`}
            data-tab="build"
            onClick={() => setActiveTab("build")}
          >
            BUILD
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "create" ? "active" : ""}`}
            data-tab="create"
            onClick={() => setActiveTab("create")}
          >
            CREATE
          </button>
          <button
            type="button"
            className={`tab ${activeTab === "grow" ? "active" : ""}`}
            data-tab="grow"
            onClick={() => setActiveTab("grow")}
          >
            GROW
          </button>
        </div>
      </div>

      {/* Dynamic Service Panel */}
      <div className="page" style={{ maxWidth: "1360px", margin: "0 auto", padding: "0 24px" }}>
        <div className="service-shell" key={activeTab}>
          <div className="service-main">
            <aside className="service-intro" key={`intro-${activeTab}`}>
              <div className="service-code">{currentTab.category}</div>
              <h2>{currentTab.title}</h2>
              <p>{currentTab.desc}</p>
              <div style={{ marginTop: "24px" }}>
                <button
                  type="button"
                  className="srv-combo-cta js-open-cal"
                  data-cal-link="cambridge.marketing"
                  data-cal-namespace="strategy-call"
                  onClick={(e) => openCalModal(`${currentTab.title} Services`, e)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "12px 24px",
                    height: "44px",
                    fontSize: "13px",
                    fontWeight: "700",
                    borderRadius: "999px",
                    background: "var(--orange, #FF5A00)",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 20px rgba(255, 90, 0, 0.28)",
                    transition: "all 0.25s ease"
                  }}
                >
                  Discuss {currentTab.title} Services <span>→</span>
                </button>
              </div>
              <div className="micro">{currentTab.micro}</div>
            </aside>
            <div className="service-list" key={`list-${activeTab}`}>
              {currentTab.services.map((item, idx) => (
                <div
                  key={item.id || item.num}
                  className="service-row"
                  onClick={(e) => openCalModal(`${item.name} (${currentTab.title})`, e)}
                  style={{
                    cursor: "pointer",
                    animationDelay: `${idx * 28}ms`
                  }}
                  title={`Discuss ${item.name}`}
                >
                  <div className="num">{item.num}</div>
                  <div>
                    <strong>{item.name}</strong>
                    <span>{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hosting section for BUILD tab */}
          {currentTab.hosting && (
            <div className="hosting">
              <div>
                <p className="eyebrow" style={{ marginBottom: "10px" }}>
                  {currentTab.hosting.eyebrow}
                </p>
                <h3>{currentTab.hosting.title}</h3>
                <p>{currentTab.hosting.desc}</p>
              </div>
              <div className="hosting-plans">
                {currentTab.hosting.plans.map((plan) => (
                  <div
                    key={plan}
                    className="host-pill"
                    onClick={(e) => openCalModal(plan, e)}
                    style={{ cursor: "pointer" }}
                    title={`Discuss ${plan}`}
                  >
                    {plan}
                  </div>
                ))}
                <div className="host-note">{currentTab.hosting.note}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── Combo Packages Section ── */}
        <section className="combos" aria-labelledby="combo-title">
          <div className="section-head">
            <div>
              <p className="eyebrow">Combo Packages</p>
              <h2 id="combo-title">Connected services. One clear engagement.</h2>
              <p className="lede" style={{ fontSize: "16px", maxWidth: "700px" }}>
                For businesses that need several capabilities working together, our combo packages combine content, marketing and technology into a single managed engagement.
              </p>
            </div>
            <div className="right-note">
              No public pricing displayed. Package scope can be adapted after a short requirements discussion.
            </div>
          </div>

          <div className="combo-grid">
            {/* Videography Combo */}
            <article className="combo-card">
              <div className="tag">Monthly Content + Marketing</div>
              <h3>Videography Combo</h3>
              <p className="best">
                For brands that need recurring content, social execution and a consistent monthly video pipeline.
              </p>
              <ul className="combo-items">
                <li>12 Static Creatives</li>
                <li>Social Media Management for Meta &amp; TikTok</li>
                <li>Basic Campaign Management</li>
                <li>1 Video Shoot</li>
                <li>Monthly Reporting</li>
              </ul>
              <div className="combo-footer">
                <span className="engagement">MONTHLY ENGAGEMENT</span>
                <button
                  type="button"
                  className="srv-combo-cta js-open-cal"
                  data-cal-link="cambridge.marketing"
                  data-cal-namespace="strategy-call"
                  data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
                  onClick={(e) => openCalModal("Videography Combo", e)}
                >
                  Discuss Package
                </button>
              </div>
            </article>

            {/* Website Combo (Featured) */}
            <article className="combo-card featured">
              <div className="tag">Marketing + Web</div>
              <h3>Website Combo</h3>
              <p className="best">
                For businesses that need ongoing marketing supported by a professionally built and maintained website.
              </p>
              <ul className="combo-items">
                <li>12 Static Creatives</li>
                <li>Social Media Management for Meta &amp; TikTok</li>
                <li>Basic Campaign Management</li>
                <li>Custom Website Included</li>
                <li>Hosting Included</li>
                <li>Monthly Maintenance &amp; Technical Support</li>
                <li>Monthly Reporting</li>
              </ul>
              <div className="combo-footer">
                <span className="engagement">6-MONTH ENGAGEMENT</span>
                <button
                  type="button"
                  className="srv-combo-cta js-open-cal"
                  data-cal-link="cambridge.marketing"
                  data-cal-namespace="strategy-call"
                  data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
                  onClick={(e) => openCalModal("Website Combo", e)}
                >
                  Discuss Package
                </button>
              </div>
            </article>

            {/* POS Combo */}
            <article className="combo-card">
              <div className="tag">Marketing + Operations</div>
              <h3>POS Combo</h3>
              <p className="best">
                For retail, restaurant and service businesses that need marketing and an operational POS system together.
              </p>
              <ul className="combo-items">
                <li>12 Static Creatives</li>
                <li>Social Media Management for Meta &amp; TikTok</li>
                <li>Basic Campaign Management</li>
                <li>Custom POS Included</li>
                <li>Hosting Included</li>
                <li>Monthly Maintenance &amp; Technical Support</li>
                <li>Monthly Reporting</li>
              </ul>
              <div className="combo-footer">
                <span className="engagement">ANNUAL ENGAGEMENT</span>
                <button
                  type="button"
                  className="srv-combo-cta js-open-cal"
                  data-cal-link="cambridge.marketing"
                  data-cal-namespace="strategy-call"
                  data-cal-config='{"layout":"month_view","language":"en","locale":"en"}'
                  onClick={(e) => openCalModal("POS Combo", e)}
                >
                  Discuss Package
                </button>
              </div>
            </article>
          </div>
        </section>

        <div className="handoff-note">
          <div>
            <strong>Interaction:</strong> BUILD / CREATE / GROW remains a glass-morphism segmented switch. Only the service content changes. Combo Packages remain visible below the service switch.
          </div>
          <div>
            <strong>Commercial rule:</strong> Do not display service prices on the public page. Route all package CTAs to enquiry / proposal flow.
          </div>
        </div>
      </div>
    </section>
  );
}
