"use client";

import type { CSSProperties, ComponentType, ElementType, ReactNode } from "react";
import { useRef } from "react";
import styles from "./spotlight-surface.module.css";

/**
 * A surface that responds to the pointer crossing it.
 *
 * Three effects, each independently switchable, because the same surface is wanted at three
 * different strengths across the site: a soft brand-blue spotlight that follows the cursor, a
 * very shallow tilt towards it, and a diagonal sheen that travels once on entry.
 *
 * The tilt is capped at 4 degrees. That is a deliberate ceiling rather than a starting point:
 * past roughly 6 degrees a card stops reading as a lit panel and starts reading as a toy, and
 * text set on a plane rotated that far genuinely gets harder to read. The intent here is
 * "premium and technical", so the tilt is meant to be felt and not really seen.
 *
 * Pointer position is written to CSS custom properties on the element rather than held in
 * React state. This runs on every pointer move; a re-render per frame to move one highlight
 * would be the most expensive possible way to do it, and it would make the spotlight lag
 * behind the cursor it is following.
 *
 * It degrades to nothing. On a coarse pointer there is no cursor to follow, so no listener is
 * attached and the surface is a plain panel. Under `prefers-reduced-motion` the same is true.
 * Everything the surface contains is ordinary DOM: no content lives in the effect.
 */

export function SpotlightSurface({
  as,
  children,
  className,
  glare = false,
  tilt = false,
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Diagonal sheen that travels across the surface once on pointer entry. */
  glare?: boolean;
  /** Shallow lean towards the pointer. Capped at 4 degrees. */
  tilt?: boolean;
} & Record<string, unknown>) {
  /*
   * The host tag is chosen by the caller — a row is an <li>, a card an <article>. TypeScript
   * resolves the props of a union-typed `ElementType` to their intersection, which is `never`,
   * so the element is narrowed to a component accepting an open prop bag. React 19 treats `ref`
   * as an ordinary prop, so nothing here needs forwarding.
   */
  const Component = (as ?? "div") as ComponentType<Record<string, unknown>>;
  const ref = useRef<HTMLElement>(null);

  const responds = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const track = (event: React.PointerEvent<HTMLElement>) => {
    const element = ref.current;
    if (!element || !responds()) return;

    const box = element.getBoundingClientRect();
    const x = event.clientX - box.left;
    const y = event.clientY - box.top;

    element.style.setProperty("--spot-x", `${x}px`);
    element.style.setProperty("--spot-y", `${y}px`);

    if (tilt) {
      /* Normalised to -0.5..0.5 from the centre, then scaled to the 4 degree cap. The Y axis
         drives rotateX and is inverted: pushing the pointer up should lift the far edge. */
      const nx = x / box.width - 0.5;
      const ny = y / box.height - 0.5;
      element.style.setProperty("--tilt-x", `${(-ny * 4).toFixed(2)}deg`);
      element.style.setProperty("--tilt-y", `${(nx * 4).toFixed(2)}deg`);
    }
  };

  const release = () => {
    const element = ref.current;
    if (!element) return;
    element.style.removeProperty("--tilt-x");
    element.style.removeProperty("--tilt-y");
    element.style.removeProperty("--spot-active");
  };

  const engage = () => {
    const element = ref.current;
    if (!element || !responds()) return;
    element.style.setProperty("--spot-active", "1");
  };

  const classes = [styles.surface, tilt ? styles.tilts : "", glare ? styles.glares : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      onPointerEnter={engage}
      onPointerLeave={release}
      onPointerMove={track}
      ref={ref}
      style={{ "--spot-active": "0" } as CSSProperties}
      {...rest}
    >
      <span aria-hidden="true" className={styles.spot} />
      {glare ? <span aria-hidden="true" className={styles.glare} /> : null}
      {children}
    </Component>
  );
}
