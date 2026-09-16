import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SystemMark from "./SystemMark";

export default function SystemIndex({ industries, labels, systems }) {
  const [active, setActive] = useState(labels.allLabel);

  const visible = useMemo(
    () =>
      active === labels.allLabel
        ? systems
        : systems.filter((system) => system.industries.includes(active)),
    [active, labels.allLabel, systems]
  );

  const showFilters = industries.length > 1;
  const options = [labels.allLabel, ...industries];

  return (
    <div className="cambt-index-container">
      {showFilters && (
        <div aria-label={labels.filterLabel} className="cambt-index-filters" role="group">
          {options.map((option) => (
            <button
              aria-pressed={option === active}
              className="cambt-filter-btn"
              key={option}
              onClick={() => setActive(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}

      <ul className="cambt-index-grid">
        {visible.map((system) => (
          <li
            className="cambt-product-card"
            id={`product-${system.slug}`}
            data-slug={system.slug}
            key={system.slug}
          >
            <div className="cambt-card-plate">
              <SystemMark slug={system.slug} />
            </div>

            <div className="cambt-card-body">
              <p className="cambt-card-meta">
                <span className="cambt-card-category">{system.category}</span>
              </p>
              <h3 className="cambt-card-title">
                <Link
                  className="cambt-card-link"
                  to={`/products/${system.slug}`}
                  onClick={() => {
                    try {
                      sessionStorage.setItem("cambm_last_product_slug", system.slug);
                    } catch (e) {}
                  }}
                >
                  {system.name}
                </Link>
              </h3>
              <p className="cambt-card-pos">{system.positioning}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
