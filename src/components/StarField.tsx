"use client";

import { useMemo } from "react";

type Star = {
  top: number;
  left: number;
  size: number;
  dur: number;
  delay: number;
  maxO: number;
};

function makeStars(count: number): Star[] {
  return Array.from({ length: count }, () => ({
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 1.6 + 0.6,
    dur: Math.random() * 3 + 2.5,
    delay: Math.random() * 4,
    maxO: Math.random() * 0.5 + 0.5,
  }));
}

/**
 * Champ d'étoiles discret et performant : divs positionnés en absolu,
 * animation CSS uniquement (voir .star / @keyframes twinkle dans globals.css).
 * Le semis est aléatoire et purement décoratif (aria-hidden) : la position
 * calculée côté serveur et celle recalculée à l'hydratation diffèrent
 * volontairement, d'où suppressHydrationWarning sur le conteneur.
 */
export default function StarField({
  count = 110,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  const stars = useMemo(() => makeStars(count), [count]);

  return (
    <div
      aria-hidden
      suppressHydrationWarning
      className={"pointer-events-none absolute inset-0 overflow-hidden " + className}
    >
      {stars.map((s, i) => (
        <span
          key={i}
          suppressHydrationWarning
          className="star absolute rounded-full bg-[#e5ebeb]"
          style={
            {
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              "--dur": `${s.dur}s`,
              "--delay": `${s.delay}s`,
              "--max-o": s.maxO,
              "--min-o": 0.12,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
