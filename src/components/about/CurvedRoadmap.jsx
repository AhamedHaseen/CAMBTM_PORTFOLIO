import React from "react";
import "../../css/curved-roadmap.css";

const MILESTONES = [
  {
    id: "tech-foundation",
    step: "01",
    label: "2014+",
    labelKey: "about.global.node1Label",
    title: "Technology Foundation",
    detail: "Technology foundation",
    detailKey: "about.global.node1Detail",
    badge: "Origin",
    status: "completed",
    cardPos: "top",
  },
  {
    id: "marketing-launch",
    step: "02",
    label: "2025",
    labelKey: "about.global.node2Label",
    title: "Marketing Segment Founded",
    detail: "Marketing segment founded",
    detailKey: "about.global.node2Detail",
    badge: "Milestone",
    status: "completed",
    cardPos: "bottom",
  },
  {
    id: "regional-expansion",
    step: "03",
    label: "Now",
    labelKey: "about.global.node3Label",
    title: "Regional Reach",
    detail: "Saudi, Middle East, Sri Lanka, India",
    detailKey: "about.global.node3Detail",
    badge: "Active",
    status: "active",
    cardPos: "top",
  },
  {
    id: "global-expansion",
    step: "04",
    label: "Next",
    labelKey: "about.global.node4Label",
    title: "Global Horizon",
    detail: "Europe and worldwide",
    detailKey: "about.global.node4Detail",
    badge: "Future",
    status: "future",
    cardPos: "bottom",
  },
];

export default function CurvedRoadmap() {
  return (
    <div className="curved-roadmap-wrapper scroll-reveal">
      {/* Desktop Clean S-Curved Road */}
      <div className="curved-roadmap-desktop">
        {/* Simple & Clean SVG Curved Road Track */}
        <svg
          className="curved-roadmap-svg"
          viewBox="0 0 1100 420"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Outer Road Bed Track */}
          <path
            className="road-bed-track"
            d="M 50 195 C 180 80, 280 80, 410 180 C 530 280, 620 330, 720 260 C 820 190, 920 120, 1050 175"
            strokeWidth="32"
            strokeLinecap="round"
          />

          {/* Inner Road Surface */}
          <path
            className="road-surface-track"
            d="M 50 195 C 180 80, 280 80, 410 180 C 530 280, 620 330, 720 260 C 820 190, 920 120, 1050 175"
            strokeWidth="28"
            strokeLinecap="round"
          />

          {/* Simple Orange Guide Line */}
          <path
            className="road-center-line"
            d="M 50 195 C 180 80, 280 80, 410 180 C 530 280, 620 330, 720 260 C 820 190, 920 120, 1050 175"
            stroke="#ff5a00"
            strokeWidth="2.5"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />

          {/* Clean Static Waypoint Station Dots */}
          {/* Station 1 (2014+) */}
          <circle cx="132" cy="148" r="8" className="road-station-outer" stroke="#ff5a00" strokeWidth="2.5" />
          <circle cx="132" cy="148" r="3.5" fill="#ff5a00" />

          {/* Station 2 (2025) */}
          <circle cx="407" cy="178" r="8" className="road-station-outer" stroke="#ff5a00" strokeWidth="2.5" />
          <circle cx="407" cy="178" r="3.5" fill="#ff5a00" />

          {/* Station 3 (Now) */}
          <circle cx="693" cy="272" r="9" className="road-station-outer" stroke="#ff5a00" strokeWidth="3" />
          <circle cx="693" cy="272" r="4" fill="#ff5a00" />

          {/* Station 4 (Next) */}
          <circle cx="968" cy="168" r="8" className="road-station-outer" stroke="#ff5a00" strokeWidth="2.5" />
          <circle cx="968" cy="168" r="3.5" fill="#ff5a00" />
        </svg>

        {/* Milestone Station Cards */}
        <div className="curved-milestones-grid">
          {MILESTONES.map((m, idx) => (
            <div
              key={m.id}
              className={`roadmap-card-station station-${idx + 1} pos-${m.cardPos} status-${m.status}`}
            >
              <div className="station-card-inner">
                <div className="station-header">
                  <span className="station-badge">{m.badge}</span>
                  <span className="station-step">{m.step}</span>
                </div>

                <div className="station-year" data-i18n={m.labelKey}>
                  {m.label}
                </div>

                <p className="station-detail" data-i18n={m.detailKey}>
                  {m.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Vertical Timeline (< 860px) */}
      <div className="curved-roadmap-mobile">
        <div className="mobile-road-track" aria-hidden="true" />
        {MILESTONES.map((m, idx) => (
          <div key={m.id} className={`mobile-roadmap-step status-${m.status}`}>
            <div className="mobile-step-node">
              <span className="mobile-node-circle">{idx + 1}</span>
            </div>
            <div className="mobile-step-card">
              <div className="mobile-card-top">
                <span className="station-badge">{m.badge}</span>
                <span className="mobile-year-badge" data-i18n={m.labelKey}>
                  {m.label}
                </span>
              </div>
              <p className="mobile-step-detail" data-i18n={m.detailKey}>
                {m.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
