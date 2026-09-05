"use client";

import { useEffect, useRef } from "react";
import {
  createPrecomputedFlowGradientPlayer,
  precomputeFlowGradientFrames,
} from "@/gradients/flow-gradient.js";

const colors = ["#C9D2E0", "#9FB0D6", "#5d6ba8", "#293d80", "#C9D2E0"];

export default function FlowGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvasElement = canvas;
    const gradientOptions = {
      scale: 0,
      distortion: 42,
      swirl: 50,
      loopDurationMs: 15000,
      frameCount: 300,
    };
    const renderWidth = 360;
    const renderHeight = 280;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let player: ReturnType<typeof createPrecomputedFlowGradientPlayer> | null = null;

    canvasElement.width = renderWidth;
    canvasElement.height = renderHeight;

    async function initializeGradient() {
      const frames = await precomputeFlowGradientFrames(
        renderWidth,
        renderHeight,
        colors,
        gradientOptions
      );

      if (disposed) {
        frames.forEach((frame) => frame.close());
        return;
      }

      player = createPrecomputedFlowGradientPlayer(canvasElement, frames, gradientOptions);
      player.drawFrameAtIndex(0);

      if (!reducedMotion.matches) player.play();
    }

    initializeGradient();

    return () => {
      disposed = true;
      player?.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="flow-gradient" />;
}