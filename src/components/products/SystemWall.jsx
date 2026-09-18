import React from "react";
import { Link } from "react-router-dom";
import SystemMark from "./SystemMark";

export default function SystemWall({ systems }) {
  return (
    <div className="cambt-desk">
      {/*
      <div className="cambt-machine">
        <div className="cambt-bezel">
          <div className="cambt-glass">
            <ul aria-label="Systems" className="cambt-wall-grid">
              {systems.map((system) => (
                <li className="cambt-wall-cell" key={system.slug}>
                  <Link
                    aria-label={system.name}
                    className="cambt-wall-tile"
                    to={`/products/${system.slug}`}
                    onClick={() => {
                      try {
                        sessionStorage.setItem("cambm_last_product_slug", system.slug);
                      } catch (e) { }
                    }}
                  >
                    <span className="cambt-wall-plate">
                      <SystemMark slug={system.slug} />
                    </span>
                    <span className="cambt-wall-label">{system.label || system.shortName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div aria-hidden="true" className="cambt-neck" />
        <div aria-hidden="true" className="cambt-foot" />
      </div>
      */}
    </div>
  );
}
