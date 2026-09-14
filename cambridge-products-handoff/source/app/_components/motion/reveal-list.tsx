"use client";

import type { ComponentType, ElementType, ReactNode } from "react";
import { useEffect, useRef } from "react";
import styles from "./reveal-list.module.css";

/**
 * Staggered entrance for a list whose items arrive after the page has.
 *
 * The site's usual reveal is scroll-driven CSS (`animation-timeline: view()`), which needs no
 * JavaScript and is the right tool for content that is in the document at first paint. This
 * exists for the cases that one cannot cover: lists that are filtered, re-ordered or replaced
 * on the client, where items appear at a scroll position they have already passed and so never
 * enter their view range again. The careers list and the filtered product and project indexes
 * are all in that category.
 *
 * An IntersectionObserver marks each child as arrived exactly once. The stagger is applied as a
 * per-child delay computed from its index, capped so a long list does not end with items
 * waiting most of a second to appear.
 *
 * Items are visible by default and the observer only ever adds the animation, so a failure to
 * observe leaves a complete, readable list rather than an empty one — the same guarantee the
 * CSS reveals give.
 */

const STAGGER_MS = 55;
const MAX_DELAY_MS = 420;

export function RevealList({
  as,
  children,
  className,
  ...rest
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
} & Record<string, unknown>) {
  /* Narrowed for the same reason as SpotlightSurface: a union `ElementType` resolves its props
     to `never`, and the caller decides whether this is a <ul>, an <ol> or a plain container. */
  const Component = (as ?? "ul") as ComponentType<Record<string, unknown>>;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const child = entry.target as HTMLElement;
          const index = Number(child.dataset.revealIndex ?? "0");
          child.style.animationDelay = `${Math.min(index * STAGGER_MS, MAX_DELAY_MS)}ms`;
          child.dataset.revealed = "true";
          observer.unobserve(child);
        }
      },
      { threshold: 0.15 },
    );

    /* Re-read children on every render: a filter changes the set, and the new items need
       observing while the removed ones are already gone. */
    const children = Array.from(root.children) as HTMLElement[];
    children.forEach((child, index) => {
      if (child.dataset.revealed === "true") return;
      child.dataset.revealIndex = String(index);
      observer.observe(child);
    });

    return () => observer.disconnect();
  });

  const classes = [styles.list, className].filter(Boolean).join(" ");

  return (
    <Component className={classes} ref={ref} {...rest}>
      {children}
    </Component>
  );
}
