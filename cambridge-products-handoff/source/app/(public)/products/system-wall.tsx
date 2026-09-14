"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { SystemMark } from "./system-mark";
import styles from "./system-wall.module.css";

export interface WallSystem {
  slug: string;
  /** Announced in full. */
  name: string;
  /** Shown on the tile. A substring of `name`, so the visible label is inside the spoken one. */
  label: string;
}

/**
 * The hero: the systems on a screen, on a desk.
 *
 * Three heroes were rejected before this one and each failed differently. Screenshots on a timer
 * made the reader wait and were soft at that size. A still lattice of the marks was inert and
 * repeated the index a screen below. A frame refitting itself per business argued the right point
 * but still advanced on its own, which was the complaint about the first one.
 *
 * This one carries no timer at all. It is a drawn machine standing on a desk with the nine systems
 * racked on its screen, and every tile is a real link through to that system's page.
 *
 * ## The machine itself never moves
 *
 * It used to lean toward the pointer, and the owner asked on 2026-09-10 for it to be fixed in
 * position instead. So the frame is now completely static and the only depth left is inside the
 * screen: the tiles drift a few pixels toward the reader and the one under the pointer comes
 * forward. The `perspective` on the desk is what makes that depth real rather than drawn, which is
 * why it stays even though nothing rotates any more.
 *
 * ## Why it is CSS 3D and not WebGL
 *
 * The request left this open ("3d computer or something"). `three` and R3F are installed but
 * mounted nowhere, and the site's one WebGL context is the homepage robot behind a load gate. A
 * second context here would buy a rendered monitor and cost a canvas: no real anchors, so no
 * keyboard route to nine pages, no focus ring, nothing for a crawler, and a bundle for a hero.
 *
 * Perspective and `translateZ` give genuine depth to genuine DOM, so the tiles stay links, the
 * machine is drawn in the same hairline hand as the marks, and the whole thing adds no dependency.
 *
 * ## Composed from React Bits ideas, none of them copied
 *
 * The drifting wall of tiles behind glass is React Bits' drift-wall idea; the per-tile lift under
 * the cursor is MagnetLines, which this site already adapted once for `FittedField`. The mark inside
 * each tile lights with the pulse the index cards already use, driven by the same inherited
 * `--mark-pulse` duration, so hovering a tile here and hovering a card below produce the same
 * gesture. Recorded in THIRD_PARTY_NOTICES.md.
 *
 * ## Movement discipline
 *
 * Nothing here is React state and no listener runs per pointer move. The idle drift is a CSS
 * animation whose *duration* arrives by custom property, the same switch `--mark-pulse` uses, which
 * lets an IntersectionObserver stop it off screen and on a hidden tab by writing `0s`.
 *
 * Under `prefers-reduced-motion` the observer never runs and the duration stays `0s`: a still wall
 * of nine links, which is a finished figure and not a paused one. Without JavaScript, the same.
 */
export function SystemWall({ systems }: { systems: WallSystem[] }) {
  const ref = useRef<HTMLDivElement>(null);

  /* The idle drift only runs while the machine is on screen and the tab is showing. */
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (!window.matchMedia("(prefers-reduced-motion: no-preference)").matches) return;

    let visible = false;
    const sync = () => {
      element.style.setProperty("--wall-drift", visible && !document.hidden ? "9s" : "0s");
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div className={styles.desk} ref={ref}>
      <div className={styles.machine}>
        {/* The bezel. Drawn, not photographed: hairlines and one accent, like every other figure. */}
        <div className={styles.bezel}>
          <div className={styles.glass}>
            <ul aria-label="Systems" className={styles.wall}>
              {systems.map((system, index) => (
                <li
                  className={styles.cell}
                  key={system.slug}
                  /*
                   * Column plus row, so the drift crosses the wall on a diagonal and the tiles never
                   * breathe in unison. Depth alternates by the same figure, which is what stops the
                   * nine reading as one flat sheet behind the glass.
                   */
                  style={
                    {
                      "--cell-index": (index % 3) + Math.floor(index / 3),
                    } as React.CSSProperties
                  }
                >
                  <Link
                    aria-label={system.name}
                    className={styles.tile}
                    href={`/products/${system.slug}`}
                  >
                    <span className={styles.plate}>
                      <SystemMark slug={system.slug} />
                    </span>
                    <span className={styles.label}>{system.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Neck and foot, so the thing stands on something instead of floating. */}
        <div aria-hidden="true" className={styles.neck} />
        <div aria-hidden="true" className={styles.foot} />
      </div>
    </div>
  );
}
