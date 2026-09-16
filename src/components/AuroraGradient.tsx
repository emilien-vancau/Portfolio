'use client';

import { CSSProperties, useEffect, useRef } from 'react';

/**
 * AuroraGradient.tsx
 * ---------------------------------------------------------------------------
 * Couche de fond "aurore boréale", volontairement isolée de FlowGradient /
 * FlowGradientVideo (aucun import partagé, quitte à dupliquer un peu de
 * logique). Elle ne fait QUE lire un asset pré-généré par
 * render-aurora-gradient.mjs — aucun calcul de gradient ne tourne ici.
 *
 * Propriété "voir l'arrière-plan" :
 * L'asset généré porte déjà un vrai canal alpha (ciel transparent, seuls les
 * rideaux de lumière sont opaques). La prop `opacity` ajoute un multiplicateur
 * réglable par-dessus, pour doser combien de la section en dessous (ex. un
 * StarField, ou le contenu du Hero) doit transparaître.
 */

interface AuroraGradientProps {
  /** Chemin vers le WebP animé pré-généré, ex: "/gradients/aurora/aurora.webp" */
  src: string;
  /** 0 (invisible) à 1 (pleine intensité). Défaut : 1. */
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}

export function AuroraGradient({ src, opacity = 1, className, style }: AuroraGradientProps) {
  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}

interface AuroraGradientFramesProps {
  /** ex: (i) => `/gradients/aurora/frame-${String(i).padStart(4, '0')}.png` */
  frameSrc: (index: number) => string;
  frameCount: number;
  fps?: number;
  /** 0 (invisible) à 1 (pleine intensité). Défaut : 1. */
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Variante de secours si aucun encodage WebP n'a été produit au build
 * (pas de ffmpeg disponible) : lit directement la séquence de PNG en
 * dessinant chaque frame sur un <canvas>. Toujours zéro calcul de gradient
 * côté client — seulement du blit d'images déjà pré-rendues.
 */
export function AuroraGradientFrames({
  frameSrc,
  frameCount,
  fps = 30,
  opacity = 1,
  className,
  style,
}: AuroraGradientFramesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || frameCount <= 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const images: HTMLImageElement[] = Array.from({ length: frameCount }, (_, i) => {
      const img = new Image();
      img.src = frameSrc(i);
      return img;
    });

    let frame = 0;
    let raf = 0;
    let last = 0;
    const interval = 1000 / fps;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (now - last < interval) return;
      last = now;
      const img = images[frame];
      if (img.complete && canvas.width && canvas.height) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      }
      frame = (frame + 1) % frameCount;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [frameSrc, frameCount, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        ...style,
      }}
    />
  );
}