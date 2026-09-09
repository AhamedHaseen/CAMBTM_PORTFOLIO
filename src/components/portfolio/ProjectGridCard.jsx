import React from 'react';
import { useScrollRevealItem } from '../../hooks/useScrollReveal';
import { useI18n } from '../../hooks/useI18n';

/**
 * ProjectGridCard — clean flat card for the portfolio grid.
 */
export default function ProjectGridCard({ project, index = 0, onClick }) {
  const [revealRef, isRevealed] = useScrollRevealItem(index % 6, 80);
  const { t, translateProject } = useI18n();

  const currentProject = translateProject(project);
  const brandName = currentProject.brand || currentProject.title;
  const ariaText = t("portfolio.card.open", `View ${brandName} case study`).replace("{brand}", brandName);

  return (
    <article
      ref={revealRef}
      className={`pgrid-card scroll-reveal-item ${isRevealed ? 'scroll-revealed' : ''}`}
      onClick={() => onClick?.(project)}
      role="button"
      tabIndex={0}
      aria-label={ariaText}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(project);
        }
      }}
    >
      {/* Image area */}
      <div className="pgrid-card-media">
        <img
          src={currentProject.image || currentProject.logo}
          alt={brandName}
          className="pgrid-card-logo"
          loading="lazy"
        />
      </div>

      {/* Info area */}
      <div className="pgrid-card-info">
        <h3 className="pgrid-card-title">
          {brandName}
        </h3>

        <div className="pgrid-card-footer">
          <span className="pgrid-card-location">
            {currentProject.location || ''}
          </span>
          <span className="pgrid-card-arrow" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </span>
        </div>
      </div>
    </article>
  );
}
