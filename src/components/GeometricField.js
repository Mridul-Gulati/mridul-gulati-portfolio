"use client";

import { useEffect, useRef } from "react";
import { drawScene } from "./geometric-scene";

// Start mid-rotation so the very first frame already shows depth, not flat, axis-aligned shapes.
const TIME_OFFSET = 14;

// Hollow wireframe solids drawn on a 2D canvas with a tiny perspective projector (no 3D library).
// Stroke colour comes from the canvas's CSS `color`, so it follows the theme (pink / teal).
// Pauses off-screen and in background tabs; shows a still frame for reduced-motion users.
export default function GeometricField({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let width = 0, height = 0, frame = 0, visible = true;
    const start = performance.now();

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineWidth = 1.1;
      ctx.lineCap = "round";
    }

    function render(now) {
      const t = TIME_OFFSET + (reduceMotion.matches ? 0 : (now - start) / 1000);
      drawScene(ctx, t, width, height, getComputedStyle(canvas).color);
    }

    function loop(now) {
      render(now);
      if (visible && !reduceMotion.matches) frame = requestAnimationFrame(loop);
    }

    function restart() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(loop);
    }

    const resizeObserver = new ResizeObserver(() => {
      resize();
      render(performance.now());
    });
    resizeObserver.observe(canvas);

    // Stop drawing while scrolled out of view.
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) restart();
      else cancelAnimationFrame(frame);
    });
    visibilityObserver.observe(canvas);

    // Redraw once when the theme class changes, in case the loop is paused (reduced motion).
    const themeObserver = new MutationObserver(() => render(performance.now()));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    reduceMotion.addEventListener("change", restart);
    resize();
    restart();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      reduceMotion.removeEventListener("change", restart);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`block size-full text-primary dark:text-primary-dark ${className}`}
    />
  );
}
