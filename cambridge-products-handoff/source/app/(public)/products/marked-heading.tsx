import styles from "./marked-heading.module.css";

export type HeadingTone = "plain" | "accent" | "counter";

export interface HeadingPart {
  text: string;
  tone?: HeadingTone;
}

/**
 * A section heading with parts of it picked out in colour.
 *
 * The site already has `EmphasizedText`, which sets one word of a page's `h1` in serif italic. That
 * is a marketing-page signature and it is deliberately used once per page, so it is the wrong tool
 * for a section heading that needs to carry an argument.
 *
 * This is the other tool. The heading arrives as parts rather than as a string with a phrase to
 * find, because the phrases worth marking here are not single words and substring matching on
 * prose breaks the moment a word repeats. "We fit the system to the business, not the business to
 * the system" contains both halves twice over, which is exactly the sentence a matcher would get
 * wrong.
 *
 * Three tones, and only three, so this cannot drift into a rainbow:
 *
 * - `accent` is the state being argued for, in the brand blue the whole site uses for that.
 * - `counter` is the thing being argued against, held back rather than shouted, because a heading
 *   with two competing bright colours reads as decoration instead of as a contrast.
 * - `plain` is everything else.
 *
 * A Server Component. The colour is the whole effect; there is nothing to hydrate and nothing that
 * fails to arrive without JavaScript.
 */
export function MarkedHeading({
  as,
  className,
  parts,
}: {
  as?: "h2" | "h3";
  className?: string;
  parts: readonly HeadingPart[];
}) {
  const Heading = as ?? "h2";
  return (
    <Heading className={className ? `${styles.heading} ${className}` : styles.heading}>
      {parts.map((part, index) => (
        <span
          className={styles[part.tone ?? "plain"]}
          /* Phrases repeat within one heading, so the index has to be part of the key. */
          key={`${part.text}-${index}`}
        >
          {part.text}
        </span>
      ))}
    </Heading>
  );
}
