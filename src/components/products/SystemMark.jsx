import React from "react";

const VIEW_BOX = "0 0 160 120";

const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "square",
};

function tile(index, filled) {
  return {
    className: filled ? "cambt-mark-filled" : "cambt-mark-empty",
    style: { "--fill-index": index },
  };
}

function Rooms() {
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
      <path {...line} d="M12 58 H150" />
      <path {...line} d="M12 66 H150" />
    </>
  );
}

function Timetable() {
  const scheduled = new Set(["0-0", "1-0", "3-0", "0-1", "2-1", "4-1", "1-2", "2-2", "0-3", "4-3"]);
  return (
    <>
      <path {...line} d="M12 26 H150" />
      {Array.from({ length: 5 }, (_, c) => (
        <path {...line} d={`M${12 + c * 27.6} 14 V108`} key={`c${c}`} />
      ))}
      <path {...line} d="M150 14 V108" />
      {Array.from({ length: 20 }, (_, i) => {
        const c = i % 5;
        const r = Math.floor(i / 5);
        const isFilled = scheduled.has(`${c}-${r}`);
        return (
          <rect
            {...tile(i, isFilled)}
            height={16}
            key={`${c}-${r}`}
            width={21}
            x={15 + c * 27.6}
            y={31 + r * 19}
          />
        );
      })}
    </>
  );
}

function Card() {
  return (
    <>
      <rect {...line} height={104} rx={6} width={68} x={46} y={8} />
      {/* Top Header Banner */}
      <path {...tile(0, true)} d="M46 14 A6 6 0 0 1 52 8 H108 A6 6 0 0 1 114 14 V30 H46 Z" />
      
      {/* Profile Avatar Ring */}
      <circle {...tile(1, true)} cx={80} cy={42} r={9} />
      
      {/* Contact Name & Title lines */}
      <rect {...tile(2, false)} height={4} rx={2} width={36} x={62} y={56} />
      <rect {...tile(3, false)} height={3} rx={1.5} width={24} x={68} y={64} />
      
      {/* Social / Action Pills */}
      <rect {...tile(4, true)} height={6} rx={3} width={14} x={52} y={72} />
      <rect {...tile(5, false)} height={6} rx={3} width={14} x={73} y={72} />
      <rect {...tile(6, true)} height={6} rx={3} width={14} x={94} y={72} />

      {/* Mini QR Code Matrix Box & Tiles */}
      <rect {...line} height={24} rx={3} width={24} x={68} y={83} />
      <rect {...tile(7, true)} height={5} width={5} x={71} y={86} />
      <rect {...tile(8, false)} height={5} width={5} x={77.5} y={86} />
      <rect {...tile(9, true)} height={5} width={5} x={84} y={86} />
      <rect {...tile(10, false)} height={5} width={5} x={71} y={92.5} />
      <rect {...tile(11, true)} height={5} width={5} x={77.5} y={92.5} />
      <rect {...tile(12, true)} height={5} width={5} x={84} y={92.5} />
      <rect {...tile(13, true)} height={5} width={5} x={71} y={99} />
      <rect {...tile(14, false)} height={5} width={5} x={77.5} y={99} />
      <rect {...tile(15, true)} height={5} width={5} x={84} y={99} />
    </>
  );
}

function Portfolio() {
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
  const plates = [
    { offset: 0, height: 66, filled: true },
    { offset: 11, height: 50, filled: true },
    { offset: 21, height: 34, filled: false },
  ];
  return (
    <>
      <path {...line} d="M14 60 H146" strokeWidth={3} />
      <path {...line} d="M66 55 V65" />
      <path {...line} d="M74 55 V65" />
      <path {...line} d="M86 55 V65" />
      <path {...line} d="M94 55 V65" />

      {plates.map((plate, index) => (
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

      <rect {...line} height={22} width={5} x={20} y={49} />
      <rect {...line} height={22} width={5} x={135} y={49} />
    </>
  );
}

function Bays() {
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
  const stops = [
    [16, 84],
    [78, 36],
    [144, 84],
  ];
  return (
    <>
      <path {...line} d="M16 84 C48 84 44 36 78 36 C112 36 108 84 144 84" />
      {stops.map(([cx, cy], index) => (
        <circle {...tile(index * 2, true)} cx={cx} cy={cy} key={cx} r={6} />
      ))}
      {[
        [47, 60],
        [111, 60],
      ].map(([cx, cy], index) => (
        <circle {...tile(index * 2 + 1, false)} cx={cx} cy={cy} key={cx} r={4} />
      ))}
      <path {...line} d="M40 104 H120" />
      {Array.from({ length: 5 }, (_, i) => (
        <path {...line} d={`M${44 + i * 18} 100 V108`} key={i} />
      ))}
    </>
  );
}

function Modules() {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <rect {...tile(i, i < 3)} height={14} key={i} width={104} x={28} y={12 + i * 20} />
      ))}
      <path {...line} d="M20 12 V106" />
      <path d="M20 12 V72" fill="none" stroke="var(--cambt-color-brand-blue)" strokeWidth={3} />
    </>
  );
}

function Pipeline() {
  const stages = [
    { y: 12, w: 132 },
    { y: 36, w: 106 },
    { y: 60, w: 78 },
    { y: 84, w: 48 },
  ];
  return (
    <>
      {stages.map((s, i) => (
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
        <path {...line} d={`M80 ${s.y + 16} V${stages[i + 1].y}`} key={`l${s.y}`} />
      ))}
    </>
  );
}

const MARKS = {
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

export default function SystemMark({ slug }) {
  const Mark = MARKS[slug];
  if (!Mark) return null;
  return (
    <svg aria-hidden="true" className="cambt-mark-svg" viewBox={VIEW_BOX}>
      <Mark />
    </svg>
  );
}
