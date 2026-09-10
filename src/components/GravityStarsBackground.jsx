import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULTS = {
  starsCount: 75,
  starsSize: 2,
  starsOpacity: 0.75,
  glowIntensity: 15,
  movementSpeed: 0.3,
  mouseInfluence: 100,
  gravityStrength: 75,
};

export default function GravityStarsBackground({
  className = "",
  starsCount = DEFAULTS.starsCount,
  starsSize = DEFAULTS.starsSize,
  starsOpacity = DEFAULTS.starsOpacity,
  glowIntensity = DEFAULTS.glowIntensity,
  movementSpeed = DEFAULTS.movementSpeed,
  mouseInfluence = DEFAULTS.mouseInfluence,
  gravityStrength = DEFAULTS.gravityStrength,
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const starsRef = useRef([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const [canvasSize, setCanvasSize] = useState({ width: 1, height: 1 });
  const [dpr, setDpr] = useState(1);

  const createStars = useCallback(
    (width, height) => {
      starsRef.current = Array.from({ length: starsCount }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = movementSpeed * (0.5 + Math.random() * 0.5);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * starsSize + 1,
          opacity: starsOpacity,
        };
      });
    },
    [movementSpeed, starsCount, starsOpacity, starsSize],
  );

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width, height } = container.getBoundingClientRect();
    const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(width * nextDpr));
    canvas.height = Math.max(1, Math.floor(height * nextDpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    setDpr(nextDpr);
    setCanvasSize({ width, height });
    createStars(width, height);
  }, [createStars]);

  useEffect(() => {
    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [resizeCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return undefined;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return undefined;

    let isVisible = true;
    let currentColor = "rgba(255, 90, 0, 0.8)";
    try {
      currentColor = getComputedStyle(container).color || currentColor;
    } catch (e) { }

    // Intersection observer to pause rendering when offscreen
    const visObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        isVisible = entry.isIntersecting;
        if (isVisible && !animationRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        }
      });
    }, { threshold: 0.05 });

    visObserver.observe(container);

    const animate = () => {
      if (!isVisible) {
        animationRef.current = null;
        return;
      }

      const { width, height } = canvasSize;
      const { x: mouseX, y: mouseY } = mouseRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = currentColor;

      for (let i = 0; i < starsRef.current.length; i++) {
        const star = starsRef.current[i];
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const distance = Math.hypot(dx, dy);
        if (distance < mouseInfluence && distance > 0) {
          const force = (mouseInfluence - distance) / mouseInfluence;
          const gravity = force * gravityStrength * 0.001;
          star.vx += (dx / distance) * gravity;
          star.vy += (dy / distance) * gravity;
          star.opacity = Math.min(1, starsOpacity + force * 0.4);
        } else {
          star.opacity = Math.max(starsOpacity * 0.3, star.opacity - 0.02);
        }

        star.x += star.vx;
        star.y += star.vy;
        star.vx *= 0.999;
        star.vy *= 0.999;
        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        context.globalAlpha = star.opacity;
        context.beginPath();
        context.arc(
          star.x * dpr,
          star.y * dpr,
          star.size * dpr,
          0,
          Math.PI * 2,
        );
        context.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      visObserver.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    canvasSize,
    dpr,
    gravityStrength,
    mouseInfluence,
    starsOpacity,
  ]);

  const updatePointer = (event) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`gravity-stars-background ${className}`}
      aria-hidden="true"
      onPointerMove={updatePointer}
    >
      <canvas ref={canvasRef} className="gravity-stars-canvas" />
    </div>
  );
}
