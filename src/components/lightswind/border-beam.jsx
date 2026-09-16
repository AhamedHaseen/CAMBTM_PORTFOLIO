import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const BorderBeam = ({
  className = "",
  size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#7400ff",
  colorTo = "#9b41ff",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  borderThickness = 1,
  opacity = 1,
  glowIntensity = 0,
  beamBorderRadius,
  pauseOnHover = false,
  speedMultiplier = 1,
}) => {
  // Calculate actual duration based on speed multiplier
  const actualDuration = speedMultiplier ? duration / speedMultiplier : duration;

  // Generate box shadow for glow effect
  const glowEffect = glowIntensity > 0
    ? `0 0 ${glowIntensity * 5}px ${glowIntensity * 2}px ${colorFrom}`
    : undefined;

  return (
    <div
      className="border-beam-container"
      style={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        borderRadius: "inherit",
        border: `${borderThickness}px solid transparent`,
        maskClip: "padding-box, border-box",
        WebkitMaskClip: "padding-box, border-box",
        maskComposite: "intersect",
        WebkitMaskComposite: "destination-in",
        maskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
        WebkitMaskImage: "linear-gradient(transparent, transparent), linear-gradient(#000, #000)",
      }}
    >
      <motion.div
        className={cn("border-beam-element", className)}
        style={{
          position: "absolute",
          aspectRatio: "1 / 1",
          width: `${size}px`,
          height: `${size}px`,
          background: `linear-gradient(to left, var(--color-from, ${colorFrom}), var(--color-to, ${colorTo}), transparent)`,
          offsetPath: `rect(0 auto auto 0 round ${beamBorderRadius ?? size}px)`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          opacity: opacity,
          boxShadow: glowEffect,
          borderRadius: beamBorderRadius ? `${beamBorderRadius}px` : undefined,
          ...style,
        }}
        initial={{ offsetDistance: `${initialOffset}%` }}
        animate={{
          offsetDistance: reverse
            ? [`${100 - initialOffset}%`, `${-initialOffset}%`]
            : [`${initialOffset}%`, `${100 + initialOffset}%`],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: actualDuration,
          delay: -delay,
          ...transition,
        }}
      />
    </div>
  );
};

export default BorderBeam;
