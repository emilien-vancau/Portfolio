"use client";

import { useEffect, useRef } from "react";
import { createFlowGradient } from "@/gradients/flow-gradient.js";

const colors = ["#C9D2E0", "#9FB0D6", "#5d6ba8", "#293d80", "#C9D2E0"];

export default function FlowGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasElement = canvas;

    const gradient = createFlowGradient(canvasElement, colors, {
      scale: 0,
      distortion: 42,
      swirl: 50,
      loopDurationMs: 20000,
    });
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function resizeCanvas() {
      const rect = canvasElement.getBoundingClientRect();
      canvasElement.width = Math.max(1, Math.min(420, Math.round(rect.width / 2)));
      canvasElement.height = Math.max(1, Math.min(300, Math.round(rect.height / 2)));
      gradient.draw(0);
    }

    resizeCanvas();
    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(canvasElement);

    if (!reducedMotion.matches) gradient.play();

    return () => {
      gradient.pause();
      resizeObserver.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="flow-gradient" />;
}