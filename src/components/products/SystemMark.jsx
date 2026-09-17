import React from "react";

const VIEW_BOX = "0 0 96 96";

function HostelMark() {
  return (
    <>
      <rect className="s" x="10" y="14" width="76" height="68" rx="6" />
      <rect className="f" x="20" y="28" width="26" height="9" rx="2.5" />
      <rect className="m" x="50" y="28" width="26" height="9" rx="2.5" />
      <rect className="m" x="20" y="45" width="26" height="9" rx="2.5" />
      <rect className="m" x="50" y="45" width="26" height="9" rx="2.5" />
      <rect className="m" x="20" y="62" width="26" height="9" rx="2.5" />
      <rect className="f" x="50" y="62" width="26" height="9" rx="2.5" />
    </>
  );
}

function SchoolMark() {
  return (
    <>
      <rect className="s" x="12" y="18" width="72" height="64" rx="6" />
      <rect className="f" x="12" y="18" width="72" height="13" rx="6" />
      <rect className="f" x="12" y="25" width="72" height="6" />
      <rect className="m" x="21" y="40" width="16" height="11" rx="2" />
      <rect className="m" x="40" y="40" width="16" height="11" rx="2" />
      <rect className="f" x="59" y="40" width="16" height="11" rx="2" />
      <rect className="m" x="21" y="57" width="16" height="11" rx="2" />
      <rect className="f" x="40" y="57" width="16" height="11" rx="2" />
      <rect className="m" x="59" y="57" width="16" height="11" rx="2" />
    </>
  );
}

function CambcardMark() {
  return (
    <>
      <rect className="s" x="8" y="24" width="80" height="50" rx="7" />
      <rect className="f" x="18" y="38" width="17" height="14" rx="3" />
      <rect className="m" x="18" y="59" width="30" height="6" rx="3" />
      <path className="fs" d="M60 39a11 11 0 0 1 0 18" />
      <path className="fs" d="M68 33a20 20 0 0 1 0 30" opacity=".5" />
    </>
  );
}

function PropertyMark() {
  return (
    <>
      <rect className="s" x="12" y="16" width="72" height="66" rx="5" />
      <path className="s" d="M48 16v30M12 46h72M48 60h36" />
      <rect className="f" x="19" y="23" width="22" height="16" rx="2" />
      <rect className="m" x="19" y="53" width="22" height="22" rx="2" />
      <rect className="m" x="55" y="23" width="22" height="16" rx="2" />
      <rect className="f" x="55" y="66" width="22" height="9" rx="2" />
    </>
  );
}

function GymMark() {
  return (
    <>
      <circle className="s" cx="48" cy="44" r="25" />
      <path className="fs" d="M48 19a25 25 0 0 1 21 38" strokeWidth="5" />
      <circle className="f" cx="48" cy="44" r="7" />
      <rect className="m" x="24" y="76" width="48" height="7" rx="3.5" />
      <rect className="f" x="24" y="76" width="18" height="7" rx="3.5" />
    </>
  );
}

function ParkingMark() {
  return (
    <>
      <rect className="s" x="14" y="14" width="68" height="68" rx="14" />
      <rect className="f" x="34" y="29" width="9" height="38" rx="3" />
      <path className="fs" d="M43 29h11a11 11 0 0 1 0 22H43" strokeWidth="9" />
      <rect className="m" x="56" y="60" width="14" height="7" rx="2" />
    </>
  );
}

function ClientMark() {
  return (
    <>
      <path className="s" d="M48 40V22M48 40 27 62M48 40l21 22" />
      <circle className="f" cx="48" cy="18" r="10" />
      <circle className="m" cx="25" cy="68" r="10" />
      <circle className="m" cx="71" cy="68" r="10" />
      <rect className="m" x="40" y="44" width="16" height="6" rx="3" />
    </>
  );
}

function TravelMark() {
  return (
    <>
      <rect className="s" x="10" y="26" width="76" height="46" rx="6" />
      <path className="s" d="M58 26v46" strokeDasharray="5 6" />
      <rect className="f" x="62" y="34" width="18" height="6" rx="3" />
      <rect className="f" x="62" y="46" width="12" height="6" rx="3" />
      <rect className="m" x="18" y="36" width="30" height="7" rx="3.5" />
      <rect className="m" x="18" y="49" width="20" height="7" rx="3.5" />
      <circle className="m" cx="58" cy="26" r="5" />
      <circle className="m" cx="58" cy="72" r="5" />
    </>
  );
}

function LearningMark() {
  return (
    <>
      <rect className="m" x="24" y="18" width="48" height="10" rx="4" opacity=".55" />
      <rect className="m" x="18" y="30" width="60" height="10" rx="4" opacity=".8" />
      <rect className="s" x="12" y="43" width="72" height="35" rx="6" />
      <rect className="m" x="21" y="52" width="54" height="7" rx="3.5" />
      <rect className="f" x="21" y="52" width="33" height="7" rx="3.5" />
      <rect className="f" x="21" y="65" width="14" height="6" rx="3" />
      <rect className="m" x="39" y="65" width="24" height="6" rx="3" />
    </>
  );
}

const MARKS = {
  "hostel-management": HostelMark,
  "school-management": SchoolMark,
  cambcard: CambcardMark,
  "property-management": PropertyMark,
  "gym-management": GymMark,
  "parking-management": ParkingMark,
  "customer-relationship-management": ClientMark,
  "travel-booking": TravelMark,
  "learning-management": LearningMark,
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
