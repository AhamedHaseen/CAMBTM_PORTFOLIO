import React, { useState, useEffect, useCallback } from "react";
import { DEFAULT_PROJECTS } from "./types";
import ProjectGrid from "./ProjectGrid";
import ProjectExpandedView from "./ProjectExpandedView";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useI18n } from "../../hooks/useI18n";
import "../../css/portfolio-showcase.css";

const FILTERS = [
  { key: "all", label: "All", i18n: "portfolio.filter.all" },
  { key: "websites", label: "Websites", i18n: "portfolio.service.websites" },
  { key: "systems", label: "Systems", i18n: "portfolio.service.systems" },
  { key: "branding", label: "Branding", i18n: "portfolio.service.branding" },
  { key: "social", label: "Social Media", i18n: "portfolio.service.social" },
  { key: "campaigns", label: "Campaigns", i18n: "portfolio.service.campaigns" },
  {
    key: "automation",
    label: "Automation",
    i18n: "portfolio.service.automation",
  },
];

/**
 * ProjectShowcase — section heading, filter bar, project grid, and case-study modal.
 */
export default function ProjectShowcase() {
  const [projects, setProjects] = useState(DEFAULT_PROJECTS);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);
  const { t } = useI18n();

  const [headingRef, headingRevealed] = useScrollReveal({ delay: 0 });
  const [filterRef, filterRevealed] = useScrollReveal({ delay: 120 });

  useEffect(() => {
    let isMounted = true;

    async function initProjects() {
      try {
        const res = await fetch("/api/portfolio?status=published", {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          if (
            isMounted &&
            data.success &&
            Array.isArray(data.projects) &&
            data.projects.length > 0
          ) {
            const defaultMap = new Map(DEFAULT_PROJECTS.map((p) => [p.id, p]));
            const merged = data.projects.map((p, idx) => {
              const def = defaultMap.get(p.id) || defaultMap.get(p.slug) || {};
              return {
                id: p.id || p.slug || `project-${idx + 1}`,
                brand: p.brand || def.brand || p.title || "Brand",
                title: p.brand || def.brand || p.title || "Project",
                fullTitle: p.title || def.fullTitle || "Case Study",
                index: String(idx + 1).padStart(2, "0"),
                category: p.category || def.category || "Branding",
                year: p.year || def.year || "2026",
                location: p.location
                  ? p.location.toUpperCase()
                  : def.location || "COLOMBO, SRI LANKA",
                market: p.market || def.market || "Global",
                industry: p.industry || def.industry || "Beauty & Wellness",
                services:
                  Array.isArray(p.services) && p.services.length > 0
                    ? p.services
                    : def.services || ["Branding"],
                short_description:
                  p.short_description || def.short_description || "",
                overview: p.short_description || def.overview || "",
                challenge: p.challenge || def.challenge || "",
                approach: p.approach || def.approach || "",
                deliverables: p.deliverables || def.deliverables || "",
                image:
                  def.image ||
                  p.logo_url ||
                  p.featured_image ||
                  def.logo ||
                  "/images/brands/myra.png",
                logo: p.logo_url || def.logo || "/images/brands/myra.png",
                cover_image:
                  p.cover_image ||
                  def.cover_image ||
                  "/images/brand-creatives/myra.jpg",
                video: def.video || null,
                metrics:
                  Array.isArray(p.metrics) && p.metrics.length > 0
                    ? p.metrics
                    : def.metrics || ["+240% Sales Growth"],
              };
            });
            setProjects(merged);
          }
        }
      } catch (e) {
        // Fallback to DEFAULT_PROJECTS
      }
    }

    initProjects();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter projects by capability
  const filteredProjects = projects.filter((item) => {
    if (activeFilter === "all") return true;
    const services = (item.services || []).map((s) => s.toLowerCase());
    const category = (item.category || "").toLowerCase();
    const filterKey = activeFilter.toLowerCase();
    return (
      services.some((s) => s.includes(filterKey)) ||
      category.includes(filterKey)
    );
  });

  const displayProjects =
    filteredProjects.length > 0 ? filteredProjects : projects;

  const handleSelectProject = useCallback((project) => {
    if (project) setSelectedProject(project);
  }, []);

  const handleNextProject = () => {
    if (!selectedProject || projects.length === 0) return;
    const currentIndex = projects.findIndex((p) => p.id === selectedProject.id);
    const nextIndex = (currentIndex + 1) % projects.length;
    setSelectedProject(projects[nextIndex]);
  };

  const handlePrevProject = () => {
    if (!selectedProject || projects.length === 0) return;
    const currentIndex = projects.findIndex((p) => p.id === selectedProject.id);
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    setSelectedProject(projects[prevIndex]);
  };

  return (
    <section
      className="portfolio-showcase-section"
      id="project-showcase"
      aria-labelledby="portfolioShowcaseTitle"
    >
      <div className="portfolio-showcase-inner">
        {/* Section Heading */}
        <div
          ref={headingRef}
          className={`pshow-heading scroll-reveal-item ${headingRevealed ? "scroll-revealed" : ""}`}
        >
          <h2 id="portfolioShowcaseTitle" data-i18n="portfolio.atlas.title">
            {t("portfolio.atlas.title", "Case studies & results")}
          </h2>
          <p
            className="pshow-intro"
            data-i18n="portfolio.atlas.intro"
          >
            {t(
              "portfolio.atlas.intro",
              "Filter by capability, then open any project for the complete case-study view."
            )}
          </p>
        </div>

        {/* Filter Bar */}
        <div
          ref={filterRef}
          className={`pshow-filters scroll-reveal-item ${filterRevealed ? "scroll-revealed" : ""}`}
          role="group"
          aria-label={t("portfolio.filters.ariaLabel", "Portfolio service filters")}
          data-i18n-attr="aria-label:portfolio.filters.ariaLabel"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`pshow-filter-chip ${activeFilter === f.key ? "is-active" : ""}`}
              onClick={() => setActiveFilter(f.key)}
              aria-pressed={activeFilter === f.key}
              data-i18n={f.i18n}
            >
              {t(f.i18n, f.label)}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <ProjectGrid
          projects={displayProjects}
          onSelectProject={handleSelectProject}
        />
      </div>

      {/* Case Study Modal */}
      {selectedProject && (
        <ProjectExpandedView
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onNext={handleNextProject}
          onPrev={handlePrevProject}
        />
      )}
    </section>
  );
}
