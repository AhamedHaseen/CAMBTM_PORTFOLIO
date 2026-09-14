import Image from "next/image";
import type { ProductScreen } from "../../_content/product-screens";
import styles from "./screen-stack.module.css";

/**
 * A system's screens, stacked down the page in order.
 *
 * The owner's instruction was screens first and text after, stacked rather than scrolling
 * sideways, and that is the right way round for what this page does: a salesperson opens a system,
 * the client sees the interface before they read a claim about it, and the copy then answers the
 * questions the screens have already raised. A feature list read before any evidence is an
 * assertion.
 *
 * This replaces a horizontal filmstrip. The filmstrip fitted more on screen, but it made the
 * evidence something the reader had to go and find, and on a page whose entire job is to show
 * working software that was the wrong trade.
 *
 * ## Three formats, because the assets are genuinely three shapes
 *
 * Pretending otherwise is what makes a mixed set look broken. The recovered captures run from
 * 970x600 to 576x1450, so:
 *
 * - `wide` is a full-window admin capture. It stacks at the column's full width, which is what the
 *   instruction asks for and what these were made for.
 * - `panel` is a smaller composite of floating panels. It is centred at its own width and never
 *   upscaled, because a 800px image blown up to 1200 is visibly soft and reads as a bad screenshot
 *   rather than as a small one.
 * - `portrait` is a phone. Seven full-height phones down a page is not a page, so they go into a
 *   snapping gallery instead: the one place a horizontal gesture is the honest answer.
 *
 * ## Why these are `unoptimized`
 *
 * They are already optimised. `scripts/prepare-catalogue-assets.mjs` writes WebP at quality 92 at a
 * known width, and left to itself Next would take that file, upscale it to 3840px because the
 * `sizes` hint asks for a wide column on a 2x display, and re-encode it at quality 75. A 1440px
 * source upscaled to 3840 and lossily re-encoded, then scaled back down by the browser, is where
 * the page's softness came from. `unoptimized` serves the file we produced, byte for byte.
 *
 * The companion rule is `--native`: a frame is never rendered wider than the pixels behind it, so
 * an 800px composite is shown at 800px rather than stretched across a 1200px column. Between them,
 * nothing on the page is ever asked to invent detail it does not have.
 *
 * Server Component. The gallery is native scroll-snap, so nothing here hydrates.
 */
export function ScreenStack({
  captionPrefix,
  galleryLabel,
  screens,
}: {
  /** The system's name, used as the alt-text stem so a screen reader hears what it is looking at. */
  captionPrefix: string;
  galleryLabel: string;
  screens: readonly ProductScreen[];
}) {
  const portraits = screens.filter((screen) => screen.format === "portrait");
  const stacked = screens.filter((screen) => screen.format !== "portrait");

  return (
    <div className={styles.screens}>
      {stacked.map((screen, index) => (
        <figure
          className={styles.frame}
          data-format={screen.format}
          key={screen.src}
          /* The pixel ceiling for this particular capture. See the note above. */
          style={{ "--native": `${screen.width}px` } as React.CSSProperties}
        >
          <div className={styles.plate}>
            <Image
              alt={`${captionPrefix}: ${screen.caption}`}
              className={styles.shot}
              height={screen.height}
              /*
               * Only the first screen can be near the fold. Eager-loading a whole system's captures
               * to paint one would be the worst thing this page could do to its loading behaviour.
               */
              loading={index === 0 ? "eager" : "lazy"}
              src={screen.src}
              unoptimized
              width={screen.width}
            />
            <span aria-hidden="true" className={styles.tint} />
          </div>
          <figcaption className={styles.caption}>
            <span className={styles.captionIndex}>
              {String(index + 1).padStart(2, "0")}
            </span>
            {screen.caption}
          </figcaption>
        </figure>
      ))}

      {portraits.length > 0 ? (
        /*
         * Focusable, because a keyboard cannot scroll a region that is not, and this one holds
         * content that appears nowhere else on the page.
         *
         * `data-lenis-prevent` because Lenis captures touch for the page, which otherwise swallows
         * the swipe that browses this gallery. See `app/_components/motion/smooth-scroll.tsx`.
         */
        <div
          aria-label={galleryLabel}
          className={styles.gallery}
          data-lenis-prevent
          role="group"
          tabIndex={0}
        >
          <ol className={styles.rail}>
            {portraits.map((screen) => (
              <li className={styles.slide} key={screen.src}>
                <figure className={styles.card}>
                  <div className={styles.cardPlate}>
                    <Image
                      alt={`${captionPrefix}: ${screen.caption}`}
                      className={styles.shot}
                      height={screen.height}
                      loading="lazy"
                      src={screen.src}
                      unoptimized
                      width={screen.width}
                    />
                  </div>
                  <figcaption className={styles.cardCaption}>{screen.caption}</figcaption>
                </figure>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
