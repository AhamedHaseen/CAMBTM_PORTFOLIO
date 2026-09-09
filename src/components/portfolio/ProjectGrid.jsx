import React from 'react';
import ProjectGridCard from './ProjectGridCard';
import { useI18n } from '../../hooks/useI18n';

/**
 * ProjectGrid — responsive grid of project cards.
 * Replaces the old CircularGallery and ProjectGallery.
 */
export default function ProjectGrid({ projects = [], onSelectProject }) {
  const { t } = useI18n();

  if (projects.length === 0) {
    return (
      <div className="pgrid-empty">
        <p data-i18n="portfolio.empty.body">
          {t("portfolio.empty.body", "No projects match the current filter.")}
        </p>
      </div>
    );
  }

  return (
    <div className="pgrid-container">
      {projects.map((project, idx) => (
        <ProjectGridCard
          key={project.id || idx}
          project={project}
          index={idx}
          onClick={onSelectProject}
        />
      ))}
    </div>
  );
}
