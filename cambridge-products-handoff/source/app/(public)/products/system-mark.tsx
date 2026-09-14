import styles from "./system-mark.module.css";

/**
 * A drawn mark per system.
 *
 * The index used to carry a cropped screenshot per card. Three of them were the same bar chart from
 * the same admin template, several were unreadable at card size, and every one was a 1440px capture
 * squeezed into a 400px box, which is where most of the page's softness came from.
 *
 * These replace them. Each is a schematic of the thing the system actually manages, so a reader
 * recognises the system by its shape before reading the name: a floor of rooms, a week of periods,
 * a run of parking bays, a pipeline narrowing toward a sale. That is the test each mark has to pass.
 * They are not icons in the decorative sense and the design guide rules out meaningless icon grids,
 * so a mark that does not describe a real structure does not belong here.
 *
 * **Drawn, not generated.** They are built from the vocabulary the rest of the site is made of:
 * 1px rules, square geometry, one accent, no gradients, no shadows, no perspective. Nothing here
 * was produced by an image model, and it should not look as though it was. Everything structural is
 * `currentColor`, so a mark inherits the text colour and holds in both themes without a second
 * asset.
 *
 * ## The pulse order
 *
 * Every tile carries a `--fill-index`, and the stylesheet turns that into a delay so a wave of
 * colour walks the mark on hover. The index is derived from where a tile **sits**, never from the
 * order it happens to be written in, so the wave sweeps across the drawing rather than jumping
 * about in source order. In a grid that means row-major; in the portfolio it is tower plus storey,
 * which reads as a diagonal; on the barbell both sides share an index so the load lights
 * symmetrically from the collars inward.
 *
 * Empty tiles are in the sequence too. They are part of the structure the wave travels through, and
 * a mark whose wave skipped its unused capacity would stutter.
 *
 * A Server Component, inline SVG. No network request, no layout shift, crisp at any size, and it
 * costs nothing to ship nine of them.
 */

const VIEW_BOX = "0 0 160 120";

/** Every mark shares these, so the family reads as one hand. */
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "square",
} as const;

/**
 * A tile: whether it is in use, and where it falls in the pulse.
 *
 * `index` is a position in the drawing, not a position in an array. Two tiles may share one, which
 * is how the barbell lights both sides at once.
 */
function tile(index: number, filled: boolean) {
  return {
    className: filled ? styles.filled : styles.empty,
    style: { "--fill-index": index } as React.CSSProperties,
  };
}

function Rooms() {
  /* A floor plan: rooms either side of a corridor, the let ones filled. */
  const occupied = new Set([0, 1, 3, 6, 7, 10]);
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        const column = i % 6;
        const row = Math.floor(i / 6);
        return (
          <rect
            {...tile(column + row * 6, occupied.has(i))}
            height={26}
            key={i}
            width={22}
            x={12 + column * 23}
            y={row === 0 ? 14 : 74}
          />
        );
      })}
      {/* The corridor between the two runs of rooms. */}
      <path {...line} d="M12 58 H150" />
      <path {...line} d="M12 66 H150" />
    </>
  );
}

function Timetable() {
  /* A week of periods, with the taught blocks placed. */
  const blocks: readonly (readonly [number, number])[] = [
    [0, 0],
    [1, 0],
    [3, 0],
    [0, 1],
    [2, 1],
    [4, 1],
    [1, 2],
    [2, 2],
    [4, 3],
    [0, 3],
  ];
  return (
    <>
      <path {...line} d="M12 26 H150" />
      {Array.from({ length: 5 }, (_, c) => (
        <path {...line} d={`M${12 + c * 27.6} 14 V108`} key={`c${c}`} />
      ))}
      <path {...line} d="M150 14 V108" />
      {blocks.map(([c, r]) => (
        /* Row-major, so the week lights up period by period rather than in array order. */
        <rect
          {...tile(r * 5 + c, true)}
          height={16}
          key={`${c}-${r}`}
          width={21}
          x={15 + c * 27.6}
          y={31 + r * 19}
        />
      ))}
    </>
  );
}

function Card() {
  /* A card in the hand: portrait, a QR block, and the lines a recipient taps. */
  return (
    <>
      <rect {...line} height={104} rx={4} width={62} x={49} y={8} />
      {/*
        The header follows the card's own rounded top corners rather than being a square block laid
        over them. A `rect` cannot round two corners on its own, so this is the same rectangle drawn
        as a path: up the left edge, round the 4px corner, across, round the right one, and straight
        down to the flat bottom edge where it meets the body of the card.
      */}
      <path {...tile(0, true)} d="M49 12 A4 4 0 0 1 53 8 H107 A4 4 0 0 1 111 12 V30 H49 Z" />
      <circle {...tile(1, true)} cx={80} cy={44} r={9} />
      <path {...line} d="M62 62 H98" />
      <path {...line} d="M62 70 H90" />
      {/* The QR square, drawn as its three finder patterns rather than as noise. */}
      <rect {...line} height={26} width={26} x={67} y={80} />
      <rect {...tile(2, true)} height={7} width={7} x={70} y={83} />
      <rect {...tile(3, true)} height={7} width={7} x={83} y={83} />
      <rect {...tile(4, true)} height={7} width={7} x={70} y={96} />
    </>
  );
}

function Portfolio() {
  /* Buildings of different heights, each divided into units, the let ones filled. */
  const towers = [
    { x: 14, h: 56, units: 4, let: [0, 2] },
    { x: 52, h: 84, units: 6, let: [0, 1, 3, 5] },
    { x: 90, h: 44, units: 3, let: [1] },
    { x: 128, h: 68, units: 5, let: [0, 2, 3] },
  ];
  return (
    <>
      <path {...line} d="M8 110 H152" />
      {towers.map((t, index) => (
        <g key={t.x}>
          <rect {...line} height={t.h} width={26} x={t.x} y={110 - t.h} />
          {Array.from({ length: t.units }, (_, u) => (
            /* Tower plus storey, so the wave crosses the portfolio on a diagonal. */
            <rect
              {...tile(index + u, t.let.includes(u))}
              height={7}
              key={u}
              width={16}
              x={t.x + 5}
              y={110 - t.h + 7 + u * ((t.h - 12) / t.units)}
            />
          ))}
        </g>
      ))}
    </>
  );
}

function Weights() {
  /*
   * A loaded barbell, plates stacked either side of the bar.
   *
   * This is the one mark in the set that draws a literal object rather than a structure, and it is
   * deliberate: the schedule grid that was here first was structurally honest and completely
   * unreadable, indistinguishable from the timetable two cards away. A barbell is recognised before
   * it is read, which is what a card in a grid of nine has to manage.
   *
   * It still carries the family's convention: a filled plate is capacity in use, an outlined one is
   * capacity spare, so the mark says "members against capacity" as well as "gym".
   */
  const plates = [
    { offset: 0, height: 66, filled: true },
    { offset: 11, height: 50, filled: true },
    { offset: 21, height: 34, filled: false },
  ];
  return (
    <>
      {/* The bar, running the full width with knurling marked at the grip. */}
      <path {...line} d="M14 60 H146" strokeWidth={3} />
      <path {...line} d="M66 55 V65" />
      <path {...line} d="M74 55 V65" />
      <path {...line} d="M86 55 V65" />
      <path {...line} d="M94 55 V65" />

      {plates.map((plate, index) => (
        /* Both sides share an index, so the load lights symmetrically from the collars inward. */
        <g key={plate.offset}>
          <rect
            {...tile(index, plate.filled)}
            height={plate.height}
            rx={2}
            width={8}
            x={26 + plate.offset}
            y={60 - plate.height / 2}
          />
          <rect
            {...tile(index, plate.filled)}
            height={plate.height}
            rx={2}
            width={8}
            x={126 - plate.offset}
            y={60 - plate.height / 2}
          />
        </g>
      ))}

      {/* Collars holding the load on. */}
      <rect {...line} height={22} width={5} x={20} y={49} />
      <rect {...line} height={22} width={5} x={135} y={49} />
    </>
  );
}

function Bays() {
  /* Parking bays either side of an aisle, the taken ones filled. */
  const taken = new Set([0, 2, 3, 6, 8, 9, 11]);
  return (
    <>
      <path {...line} d="M8 60 H152" strokeDasharray="6 6" />
      {Array.from({ length: 12 }, (_, i) => {
        const column = i % 6;
        const row = Math.floor(i / 6);
        return (
          <rect
            {...tile(column + row * 6, taken.has(i))}
            height={34}
            key={i}
            width={20}
            x={14 + column * 22.5}
            y={row === 0 ? 18 : 68}
          />
        );
      })}
    </>
  );
}

function Route() {
  /* An itinerary: stops along a journey, with the booked legs solid. */
  const stops: readonly (readonly [number, number])[] = [
    [16, 84],
    [78, 36],
    [144, 84],
  ];
  return (
    <>
      <path {...line} d="M16 84 C48 84 44 36 78 36 C112 36 108 84 144 84" />
      {stops.map(([cx, cy], index) => (
        /* Along the journey, so the wave travels the route in the direction it is read. */
        <circle {...tile(index * 2, true)} cx={cx} cy={cy} key={cx} r={6} />
      ))}
      {[
        [47, 60],
        [111, 60],
      ].map(([cx, cy], index) => (
        <circle {...tile(index * 2 + 1, false)} cx={cx} cy={cy} key={cx} r={4} />
      ))}
      {/* The dates the journey is held against. */}
      <path {...line} d="M40 104 H120" />
      {Array.from({ length: 5 }, (_, i) => (
        <path {...line} d={`M${44 + i * 18} 100 V108`} key={i} />
      ))}
    </>
  );
}

function Modules() {
  /*
   * A course: modules stacked, with progress run through the completed ones.
   *
   * Five bars, the first three done. They are drawn as tiles rather than as outlines with fills
   * laid over them, so every bar is in the pulse and the wave runs the length of the course.
   */
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <rect {...tile(i, i < 3)} height={14} key={i} width={104} x={28} y={12 + i * 20} />
      ))}
      {/* The spine the progress travels down. */}
      <path {...line} d="M20 12 V106" />
      <path className={styles.accentStroke} d="M20 12 V72" fill="none" strokeWidth={3} />
    </>
  );
}

function Pipeline() {
  /* A pipeline narrowing from enquiry to invoice. */
  const stages = [
    { y: 12, w: 132 },
    { y: 36, w: 106 },
    { y: 60, w: 78 },
    { y: 84, w: 48 },
  ];
  return (
    <>
      {stages.map((s, i) => (
        /* Top to bottom, so the wave falls through the funnel the way a deal does. */
        <rect
          {...tile(i, i === stages.length - 1)}
          height={16}
          key={s.y}
          width={s.w}
          x={80 - s.w / 2}
          y={s.y}
        />
      ))}
      {stages.slice(0, -1).map((s, i) => (
        <path {...line} d={`M80 ${s.y + 16} V${stages[i + 1]!.y}`} key={`l${s.y}`} />
      ))}
    </>
  );
}

const MARKS: Readonly<Record<string, () => React.JSX.Element>> = {
  "hostel-management": Rooms,
  "school-management": Timetable,
  cambcard: Card,
  "property-management": Portfolio,
  "gym-management": Weights,
  "parking-management": Bays,
  "travel-booking": Route,
  "learning-management": Modules,
  "customer-relationship-management": Pipeline,
};

/**
 * `aria-hidden` throughout: the system's name sits beside the mark in the same card, and a
 * description of a diagram that only restates the heading next to it is noise to a screen reader.
 */
export function SystemMark({ slug }: { slug: string }) {
  const Mark = MARKS[slug];
  if (!Mark) return null;
  return (
    <svg aria-hidden="true" className={styles.mark} viewBox={VIEW_BOX}>
      <Mark />
    </svg>
  );
}

export function hasSystemMark(slug: string): boolean {
  return slug in MARKS;
}
