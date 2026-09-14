import { MarkedHeading, type HeadingPart } from "./marked-heading";
import styles from "./adaptation-argument.module.css";

export interface AdaptationCopy {
  label: string;
  headingParts: readonly HeadingPart[];
  body: string;
  genericTitle: string;
  genericNote: string;
  fittedTitle: string;
  fittedNote: string;
  unusedLabel: string;
  generic: readonly { field: string; verdict: string }[];
  fitted: readonly { field: string; verdict: string }[];
}

/**
 * The argument the whole Products page exists to make.
 *
 * CAMBT's claim is that it fits a system to a business rather than making the business fit the
 * system, and the failure it sells against is a till built for one trade running another. Asserting
 * that in a paragraph is worth very little; showing it costs a reader four seconds.
 *
 * So this is a diptych of the same screen's field list, twice. On the left, the fields a restaurant
 * till insists on, against a shop that sells by weight: covers, table numbers, kitchen tickets, a
 * bill to split. On the right, the fields that shop actually uses. The count underneath is the
 * point of the section.
 *
 * **It is deliberately not a mock interface.** The design guide rules out fabricated dashboards and
 * fake browser frames, and rightly: a drawn screenshot on a page whose entire credibility rests on
 * the screenshots being real would undermine everything below it. This is a labelled comparison,
 * typographic and obviously diagrammatic, and it could not be mistaken for a capture.
 *
 * The scenario is generic. No client is named, no outcome is claimed, and nothing here says this
 * happened to anyone in particular, because it is an illustration of a problem rather than a case
 * study. A reader who runs a shop recognises it without being told whose shop it was.
 *
 * A Server Component. The rows arrive on their own scroll timeline in CSS; there is nothing to
 * hydrate and nothing that fails to arrive if JavaScript does not.
 */
export function AdaptationArgument({ copy }: { copy: AdaptationCopy }) {
  /*
   * Only the fields nobody fills in. A "forced" row is one the business does fill in, wrongly,
   * which is a different complaint and not what the label underneath claims. Counting it here
   * would make the figure overstate by one, and the whole section rests on that figure.
   */
  const unused = copy.generic.filter((row) => row.verdict === "unused").length;

  return (
    <div className={styles.argument}>
      <div className={styles.intro}>
        <span className={styles.label}>{copy.label}</span>
        <MarkedHeading className={styles.heading} parts={copy.headingParts} />
        <p className={styles.body}>{copy.body}</p>
      </div>

      <div className={styles.diptych}>
        <section className={`${styles.panel} ${styles.generic}`}>
          <header className={styles.panelHead}>
            <h3>{copy.genericTitle}</h3>
            <p>{copy.genericNote}</p>
          </header>
          <ul className={styles.fields}>
            {copy.generic.map((row, index) => (
              <li
                className={styles.field}
                data-verdict={row.verdict}
                key={row.field}
                style={{ "--row": index } as React.CSSProperties}
              >
                <span className={styles.fieldName}>{row.field}</span>
                <span className={styles.verdict}>{row.verdict}</span>
              </li>
            ))}
          </ul>
          <p className={styles.tally}>
            {/*
              Counted from the rows rather than written down, so the figure cannot drift away from
              the list it is describing when someone edits one of them.
            */}
            <span className={styles.tallyFigure}>{unused}</span>
            <span className={styles.tallyLabel}>{copy.unusedLabel}</span>
          </p>
        </section>

        <section className={`${styles.panel} ${styles.fitted}`}>
          <header className={styles.panelHead}>
            <h3>{copy.fittedTitle}</h3>
            <p>{copy.fittedNote}</p>
          </header>
          <ul className={styles.fields}>
            {copy.fitted.map((row, index) => (
              <li
                className={styles.field}
                data-verdict={row.verdict}
                key={row.field}
                style={{ "--row": index } as React.CSSProperties}
              >
                <span className={styles.fieldName}>{row.field}</span>
                <span className={styles.verdict}>{row.verdict}</span>
              </li>
            ))}
          </ul>
          <p className={styles.tally}>
            <span className={styles.tallyFigure}>0</span>
            <span className={styles.tallyLabel}>{copy.unusedLabel}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
