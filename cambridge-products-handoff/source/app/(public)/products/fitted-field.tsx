"use client";

import { useCallback, useEffect, useRef } from "react";
import styles from "./fitted-field.module.css";

const COLUMNS = 9;
const ROWS = 6;
const CELLS = COLUMNS * ROWS;

/**
 * A field of lines that all turn to face the reader.
 *
 * This is the page's "every one of these is fitted to the client" statement, made as a picture
 * rather than as a sentence. A grid of identical marks, each independently orienting on whoever is
 * looking at it: one system, many alignments, and the alignment is decided by where you stand.
 * It is the only figurative thing on the page and it earns that by being the exact shape of the
 * argument the section is making.
 *
 * Adapted from React Bits' MagnetLines (MIT). What changed: the geometry is CAMBT's, the palette is
 * token-driven so it holds in both themes, the grid is smaller, a resting state was added for every
 * case where there is no pointer to follow, and the per-frame work was rewritten. Recorded in
 * THIRD_PARTY_NOTICES.md.
 *
 * ## The per-frame work, which is the whole engineering problem
 *
 * Every line needs its own angle, so something has to be written per line per frame. Three rules
 * keep that affordable:
 *
 * - **Angles are written to the DOM, never to React state.** Eighty-one state updates per pointer
 *   move would re-render the section on every frame, which is the most expensive possible way to
 *   rotate a line.
 * - **No layout is read in the loop.** Each line's centre is derived from its grid position once,
 *   as a fraction of the container, so a move reads exactly one rectangle rather than eighty-one.
 *   Reading each line's own rect per frame would force layout on every mouse move.
 * - **One frame at a time.** Pointer and scroll events fire faster than the display refreshes, so
 *   they are coalesced into a single rAF callback and the surplus is dropped.
 *
 * Scrolling is treated as a move even though the pointer has not moved, because the field slides
 * under a stationary cursor and every angle to it genuinely changes.
 *
 * ## When it does nothing
 *
 * On a coarse pointer there is nothing to follow, and under `prefers-reduced-motion` following it
 * would be exactly the thing the reader asked not to happen. In both cases no listener is attached
 * and the field rests in its CSS state: every line aligned to the centre, which still reads as a
 * deliberate figure rather than as something that failed to load. It is `aria-hidden` throughout;
 * it carries no information that is not also in the words beside it.
 */
export function FittedField({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  /*
   * Whether a pointer has ever been seen. Scrolling recomputes from the last known position, and
   * before the first move there is no such position: acting on the {0, 0} default would swing every
   * line at the top-left corner of the window the moment the reader scrolled.
   */
  const seen = useRef(false);

  const apply = useCallback(() => {
    frame.current = 0;
    const container = ref.current;
    if (!container) return;

    const box = container.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const lines = container.children;
    for (let index = 0; index < lines.length; index += 1) {
      /*
       * The centre of cell `index`, derived from the grid rather than measured. The grid is
       * uniform, so this is exact, and it costs no layout.
       */
      const column = index % COLUMNS;
      const row = Math.floor(index / COLUMNS);
      const centreX = box.left + ((column + 0.5) / COLUMNS) * box.width;
      const centreY = box.top + ((row + 0.5) / ROWS) * box.height;

      const angle =
        (Math.atan2(pointer.current.y - centreY, pointer.current.x - centreX) * 180) / Math.PI;
      (lines[index] as HTMLElement).style.setProperty("--angle", `${angle.toFixed(1)}deg`);
    }
  }, []);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const responsive = window.matchMedia("(hover: hover) and (pointer: fine)");
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!responsive.matches || stillness.matches) return;

    /* Coalesce: these events outrun the display, and only the newest state matters. */
    const schedule = () => {
      if (!frame.current) frame.current = window.requestAnimationFrame(apply);
    };

    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY };
      seen.current = true;
      schedule();
    };

    /*
     * A scroll moves the field under a stationary cursor, so every line's angle to that cursor
     * changes even though no pointer event fires. Without this the field freezes mid-scroll and
     * only catches up on the next twitch of the mouse, which reads as the figure having lost
     * interest. The cached position is in client coordinates, which is exactly what a scroll leaves
     * alone, so recomputing from it is correct rather than approximate.
     *
     * Resize matters for the same reason: the grid's cells move, the cursor does not.
     */
    const onReflow = () => {
      if (seen.current) schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onReflow, { passive: true });
    window.addEventListener("resize", onReflow, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onReflow);
      window.removeEventListener("resize", onReflow);
      if (frame.current) window.cancelAnimationFrame(frame.current);
    };
  }, [apply]);

  return (
    <div
      aria-hidden="true"
      className={className ? `${styles.field} ${className}` : styles.field}
      ref={ref}
    >
      {Array.from({ length: CELLS }, (_, index) => (
        <span className={styles.line} key={index} />
      ))}
    </div>
  );
}
