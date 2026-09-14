"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RevealList, SpotlightSurface } from "../../_components/motion";
import { SystemMark } from "./system-mark";
import styles from "./system-index.module.css";

export interface IndexSystem {
  slug: string;
  name: string;
  positioning: string;
  category: string;
  industries: string[];
  screenCount: number;
}

export interface IndexLabels {
  allLabel: string;
  filterLabel: string;
  inLabel: string;
  pluralLabel: string;
  singularLabel: string;
  screensLabel: string;
}

/**
 * The systems, as a scannable grid.
 *
 * Scannability is the requirement, not novelty. This section is the sales team's index: someone on
 * a call needs to find the gym one in about two seconds, which rules out a scroll-driven stack, a
 * carousel and anything else that hides the set to present one of it. So it is a grid, each card
 * carrying a drawn mark of what that system manages, and the whole set is in the document at once.
 *
 * The industry filter is the only press-a-control on the page. That is deliberate. The standing
 * objection is that swapping a panel had become the site's only idea, and the answer is not to ban
 * the pattern but to use it once, where it does something a reader actually wants: nine systems is
 * past the point where scanning for "the property ones" is quick.
 *
 * Filtering is client state and nothing else is, so this is the only client component in the index.
 * `RevealList` handles entrance for items that appear after a filter change, which is the case CSS
 * scroll timelines cannot cover.
 */
export function SystemIndex({
  industries,
  labels,
  systems,
}: {
  industries: string[];
  labels: IndexLabels;
  systems: IndexSystem[];
}) {
  const [active, setActive] = useState(labels.allLabel);

  const visible = useMemo(
    () =>
      active === labels.allLabel
        ? systems
        : systems.filter((system) => system.industries.includes(active)),
    [active, labels.allLabel, systems],
  );

  /* One industry is not a choice, so the control does not ship. */
  const showFilters = industries.length > 1;
  const options = [labels.allLabel, ...industries];

  return (
    <div className={styles.index}>
      {showFilters ? (
        <div aria-label={labels.filterLabel} className={styles.filters} role="group">
          {options.map((option) => (
            <button
              aria-pressed={option === active}
              className={styles.filter}
              key={option}
              onClick={() => setActive(option)}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      {/*
        Announced politely rather than assertively: a filter change is a result the reader asked
        for, not an interruption.
      */}
      <p aria-live="polite" className={styles.count}>
        {visible.length} {visible.length === 1 ? labels.singularLabel : labels.pluralLabel}
        {active === labels.allLabel ? "" : ` ${labels.inLabel} ${active}`}
      </p>

      <RevealList className={styles.grid}>
        {visible.map((system) => (
          <SpotlightSurface as="li" className={styles.system} glare key={system.slug}>
            {/*
              A drawn schematic rather than a cropped screenshot. Three of these systems share an
              admin template, so their captures were the same chart three times over, and a 1440px
              capture squeezed into a 400px card was where most of the page's softness came from.
              The mark describes what the system holds, which is what a reader is scanning for.
            */}
            <div className={styles.plate}>
              <SystemMark slug={system.slug} />
            </div>

            <div className={styles.body}>
              <p className={styles.meta}>
                <span className={styles.category}>{system.category}</span>
                <span className={styles.screens}>
                  {system.screenCount} {labels.screensLabel}
                </span>
              </p>
              <h3>
                {/*
                  The whole card is a target through the overlay below, but the anchor is the real
                  link and the only thing announced, so assistive technology hears one link per
                  system rather than two to the same place.
                */}
                <Link className={styles.link} href={`/products/${system.slug}`}>
                  {system.name}
                </Link>
              </h3>
              <p className={styles.positioning}>{system.positioning}</p>
            </div>
          </SpotlightSurface>
        ))}
      </RevealList>
    </div>
  );
}
