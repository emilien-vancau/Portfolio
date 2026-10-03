"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

export type ComparisonImage = {
  src: string;
  alt: string;
  label?: string;
  textPosition?: "top" | "bottom";
};

type MultiImageComparisonProps = {
  images: ComparisonImage[];

  /**
   * Aspect ratio du viewport de comparaison.
   * Exemple : "16 / 9", "4 / 3", "1 / 1"
   */
  aspectRatio?: string;

  /**
   * Définit comment les images sont affichées dans leur zone.
   */
  objectFit?: "cover" | "contain";

  /**
   * Largeur minimale d'une image en pourcentage.
   * Évite qu'une image soit complètement masquée.
   */
  minWidth?: number;

  /**
   * Affiche ou non les handles des sliders.
   */
  showHandles?: boolean;

  className?: string;
};

export default function MultiImageComparison({
  images,
  aspectRatio = "16 / 9",
  objectFit = "cover",
  minWidth = 5,
  showHandles = true,
  className = "",
}: MultiImageComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Pour N images, il y a N - 1 séparateurs.
   *
   * Exemple avec 4 images :
   * [0% ----- 25% ----- 50% ----- 75% ----- 100%]
   *
   * Les valeurs correspondent aux positions des séparateurs.
   */
  const [positions, setPositions] = useState<number[]>(
    images.slice(0, -1).map((_, index) => {
      return ((index + 1) / images.length) * 100;
    })
  );

  const [activeSlider, setActiveSlider] = useState<number | null>(null);

  /**
   * Convertit la position du pointer en pourcentage
   * dans le composant.
   */
  const getPositionFromPointer = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return null;

      const rect = containerRef.current.getBoundingClientRect();

      const position = ((clientX - rect.left) / rect.width) * 100;

      return Math.max(0, Math.min(100, position));
    },
    []
  );

  /**
   * Déplace un séparateur en respectant les limites
   * imposées par les séparateurs voisins.
   */
  const updateSlider = useCallback(
    (sliderIndex: number, clientX: number) => {
      const newPosition = getPositionFromPointer(clientX);

      if (newPosition === null) return;

      setPositions((currentPositions) => {
        const nextPositions = [...currentPositions];

        const previousPosition =
          sliderIndex === 0
            ? minWidth
            : currentPositions[sliderIndex - 1] + minWidth;

        const nextPosition =
          sliderIndex === currentPositions.length - 1
            ? 100 - minWidth
            : currentPositions[sliderIndex + 1] - minWidth;

        nextPositions[sliderIndex] = Math.max(
          previousPosition,
          Math.min(nextPosition, newPosition)
        );

        return nextPositions;
      });
    },
    [getPositionFromPointer, minWidth]
  );

  const handlePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    sliderIndex: number
  ) => {
    event.preventDefault();

    event.currentTarget.setPointerCapture(event.pointerId);

    setActiveSlider(sliderIndex);
  };

  const handlePointerMove = (
    event: React.PointerEvent<HTMLButtonElement>,
    sliderIndex: number
  ) => {
    if (activeSlider !== sliderIndex) return;

    updateSlider(sliderIndex, event.clientX);
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLButtonElement>
  ) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setActiveSlider(null);
  };

  if (images.length < 2) {
    console.warn(
      "MultiImageComparison requires at least 2 images."
    );

    return null;
  }

  /**
   * Chaque image possède une zone comprise entre :
   *
   * - 0 et slider 1
   * - slider 1 et slider 2
   * - slider 2 et slider 3
   * - ...
   * - dernier slider et 100
   *
   * On utilise clip-path pour révéler uniquement
   * la partie correspondant à chaque image.
   */
  const getClipPath = (index: number) => {
    const left = index === 0 ? 0 : positions[index - 1];
    const right =
      index === images.length - 1 ? 100 : positions[index];

    return `polygon(
      ${left}% 0,
      ${right}% 0,
      ${right}% 100%,
      ${left}% 100%
    )`;
  };

  return (
    <div
      ref={containerRef}
      className={`group relative w-full select-none overflow-hidden ${className}`}
      style={{
        aspectRatio,
        touchAction: "none",
      }}
    >
      {/* Images */}
      {images.map((image, index) => {
        const textPosition = image.textPosition ?? "top";
        const segmentLeft = index === 0 ? 0 : positions[index - 1];
        const segmentRight =
          index === images.length - 1 ? 100 : positions[index];

        return (
          <div
            key={`${image.src}-${index}`}
            className="absolute inset-0"
            style={{
              clipPath: getClipPath(index),
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              draggable={false}
              sizes="(min-width: 1200px) 1104px, calc(100vw - 96px)"
              loading={image.src === "/imgs/M51_final_lrgb.jpg" ? "eager" : undefined}
              className={`pointer-events-none ${
                objectFit === "cover"
                  ? "object-cover"
                  : "object-contain"
              }`}
              priority={index === 0}
            />

            {/* Label */}
            {image.label && (
              <div
                className={`pointer-events-none absolute z-10 p-4 text-center opacity-100 transition-opacity duration-150 group-hover:opacity-0 ${
                  textPosition === "top"
                    ? "top-0 bg-gradient-to-b from-black/60 to-transparent"
                    : "bottom-0 bg-gradient-to-t from-black/60 to-transparent"
                }`}
                style={{
                  left: `${segmentLeft}%`,
                  width: `${segmentRight - segmentLeft}%`,
                }}
              >
                <span className="text-sm font-medium text-white drop-shadow-md">
                  {image.label}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* Sliders */}
      {positions.map((position, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Déplacer le séparateur ${index + 1}`}
          className="group absolute inset-y-0 z-30 w-8 -translate-x-1/2 cursor-ew-resize touch-none"
          style={{
            left: `${position}%`,
          }}
          onPointerDown={(event) =>
            handlePointerDown(event, index)
          }
          onPointerMove={(event) =>
            handlePointerMove(event, index)
          }
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Ligne */}
          <span
            className={`
              absolute left-1/2 top-0 h-full w-px -translate-x-1/2
              bg-white/80 shadow-[0_0_4px_rgba(0,0,0,0.5)]
              transition-all duration-150
              group-hover:w-0.5
              ${
                activeSlider === index
                  ? "w-0.5"
                  : ""
              }
            `}
          />

          {/* Handle */}
          {showHandles && (
            <span
              className={`
                absolute left-1/2 top-1/2
                flex h-10 w-10 -translate-x-1/2 -translate-y-1/2
                items-center justify-center
                rounded-full border border-white/80
                bg-black/50
                text-white
                shadow-lg
                backdrop-blur-sm
                transition-transform duration-150
                group-hover:scale-110
                ${
                  activeSlider === index
                    ? "scale-110"
                    : ""
                }
              `}
            >
              {/* Chevrons gauche / droite */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m10 18-6-6 6-6" />
                <path d="m14 6 6 6-6 6" />
              </svg>
            </span>
          )}
        </button>
      ))}
    </div>
  );
}