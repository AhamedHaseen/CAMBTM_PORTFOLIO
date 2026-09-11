import React from "react";
import "./WavyTimeline.css";

const TIMELINE_MILESTONES = [
  {
    id: "tech-foundation",
    yearTitle: "2014+ — Technology Foundation",
    yearTitleKey: "about.global.node1Label",
    desc: "Technology, POS, and enterprise systems foundation built from deep engineering origins.",
    descKey: "about.global.node1Detail",
    badgeTheme: "theme-amber",
    color: "#F59E0B",
    glow: "rgba(245, 158, 11, 0.4)",
    nodePos: { cx: 480, cy: 110 },
    align: "align-right",
  },
  {
    id: "marketing-launch",
    yearTitle: "2025 — Marketing Segment Founded",
    yearTitleKey: "about.global.node2Label",
    desc: "Full-service marketing, paid media strategy, and unified creative systems launch.",
    descKey: "about.global.node2Detail",
    badgeTheme: "theme-orange",
    color: "#FF5A00",
    glow: "rgba(255, 90, 0, 0.45)",
    nodePos: { cx: 320, cy: 340 },
    align: "align-left",
  },
  {
    id: "regional-reach",
    yearTitle: "Now — Regional Reach",
    yearTitleKey: "about.global.node3Label",
    desc: "Active expansion across Saudi Arabia, Middle East, Sri Lanka, and Indian markets.",
    descKey: "about.global.node3Detail",
    badgeTheme: "theme-coral",
    color: "#FF4D6D",
    glow: "rgba(255, 77, 109, 0.4)",
    nodePos: { cx: 480, cy: 570 },
    align: "align-right",
  },
  {
    id: "global-horizon",
    yearTitle: "Next — Global Horizon",
    yearTitleKey: "about.global.node4Label",
    desc: "Scaling into European hubs and delivering connected growth systems worldwide.",
    descKey: "about.global.node4Detail",
    badgeTheme: "theme-pink",
    color: "#EC4899",
    glow: "rgba(236, 72, 153, 0.4)",
    nodePos: { cx: 320, cy: 800 },
    align: "align-left",
  },
];

// Generates continuous parallel S-curve wavy paths
const generateWavyPath = (offset = 0) => {
  const o = offset;
  return `M ${400 + o} 20
    C ${400 + o} 55, ${480 + o} 70, ${480 + o} 110
    C ${480 + o} 150, ${400 + o} 180, ${400 + o} 225
    C ${400 + o} 270, ${320 + o} 300, ${320 + o} 340
    C ${320 + o} 380, ${400 + o} 410, ${400 + o} 455
    C ${400 + o} 500, ${480 + o} 530, ${480 + o} 570
    C ${480 + o} 610, ${400 + o} 640, ${400 + o} 685
    C ${400 + o} 730, ${320 + o} 760, ${320 + o} 800
    C ${320 + o} 840, ${400 + o} 870, ${400 + o} 905`;
};

export default function WavyTimeline() {
  return (
    <div className="wavy-timeline-container scroll-reveal">
      <div className="wavy-timeline-wrapper">
        {/* SVG Multi-Lane Running Track Continuous S-Curve */}
        <div className="wavy-track-svg-wrapper">
          <svg
            className="wavy-track-svg"
            viewBox="0 0 800 920"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="wavyTrackGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                <stop offset="35%" stopColor="#FF5A00" stopOpacity="0.8" />
                <stop offset="68%" stopColor="#FF4D6D" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#EC4899" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Parallel Multi-Lane Thin Lines */}
            <path d={generateWavyPath(-24)} className="track-lane track-lane-outer" strokeWidth="1" />
            <path d={generateWavyPath(-16)} className="track-lane" strokeWidth="1.2" />
            <path d={generateWavyPath(-8)} className="track-lane" strokeWidth="1.2" />

            {/* Center Dynamic Dashed Road Guide */}
            <path
              d={generateWavyPath(0)}
              className="track-lane-center"
              strokeWidth="2.4"
              stroke="url(#wavyTrackGradient)"
            />

            <path d={generateWavyPath(8)} className="track-lane" strokeWidth="1.2" />
            <path d={generateWavyPath(16)} className="track-lane" strokeWidth="1.2" />
            <path d={generateWavyPath(24)} className="track-lane track-lane-outer" strokeWidth="1" />

            {/* Circular Node Markers at Peaks */}
            {TIMELINE_MILESTONES.map((m) => (
              <g key={m.id}>
                {/* Node-to-Card Alignment Guide */}
                <line
                  x1={m.nodePos.cx}
                  y1={m.nodePos.cy}
                  x2={m.align === "align-right" ? m.nodePos.cx + 42 : m.nodePos.cx - 42}
                  y2={m.nodePos.cy}
                  stroke={m.color}
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  strokeOpacity="0.7"
                />

                {/* Animated Pulse Ring */}
                <circle
                  cx={m.nodePos.cx}
                  cy={m.nodePos.cy}
                  r="14"
                  fill="none"
                  stroke={m.color}
                  strokeWidth="2"
                  className="wavy-node-pulse"
                />

                {/* Outer Circular Node Boundary */}
                <circle
                  cx={m.nodePos.cx}
                  cy={m.nodePos.cy}
                  r="12"
                  className="wavy-node-outer"
                  stroke={m.color}
                  strokeWidth="2.5"
                />

                {/* Inner Filled Accent Core */}
                <circle
                  cx={m.nodePos.cx}
                  cy={m.nodePos.cy}
                  r="5.5"
                  fill={m.color}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Milestone Content Cards (Alternating Sides) */}
        <div className="wavy-timeline-list">
          {TIMELINE_MILESTONES.map((item) => (
            <div key={item.id} className={`wavy-timeline-row ${item.align} ${item.badgeTheme}`}>
              <div className="wavy-milestone-card">
                {/* Pill-shaped badge containing Year - Title filled with accent color */}
                <div className="wavy-pill-badge" data-i18n={item.yearTitleKey}>
                  {item.yearTitle}
                </div>

                {/* Short clean description text underneath */}
                <p className="wavy-card-desc" data-i18n={item.descKey}>
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
