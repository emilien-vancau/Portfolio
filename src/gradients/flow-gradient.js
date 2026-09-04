/**
 * Flow Gradient
 * -------------
 * A reimplementation of the animated "flow" gradient effect: a handful of
 * color "blobs" (one per color stop) drift around the canvas on independent
 * orbits, while the whole coordinate space is warped by animated sine waves
 * and rotated by a swirl effect. Every pixel's final color is a soft,
 * metaball-style blend of the nearby blobs.
 *
 * This version is built around a single `loopPhase` value in the range
 * [0, 1). All animated motion (blob orbits, domain warp) is driven by
 * `loopPhase * 2π * someIntegerFrequency`. Because every frequency used is
 * a whole number of cycles, the picture at loopPhase = 0 is mathematically
 * identical to the picture at loopPhase = 1 — so looping a rendered video
 * or GIF over phases [0, 1) never shows a seam or a jump.
 *
 * Usage:
 *
 *   import { createFlowGradient } from './flow-gradient.js';
 *
 *   const canvas = document.querySelector('canvas');
 *   const gradient = createFlowGradient(canvas, ['#EAF4FC', '#1E50A2', '#F09199', '#895B8A'], {
 *     scale: 50,
 *     distortion: 60,
 *     swirl: 10,
 *     loopDurationMs: 12000,
 *   });
 *   gradient.play();
 *
 * To export a perfectly looping video/GIF instead of animating live, render
 * a fixed number of frames by calling `gradient.draw(i / totalFrames)` for
 * i = 0 .. totalFrames - 1 (do NOT render i = totalFrames, that frame is
 * identical to i = 0 and would create a duplicate/stutter on loop).
 */

// ---------------------------------------------------------------------------
// Color math: sRGB hex <-> OKLab
//
// Blending colors in OKLab (a perceptually-uniform color space) instead of
// plain RGB avoids the muddy grey/brown midpoints you get when blending
// e.g. blue and orange directly in RGB.
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
  const value = parseInt(hex.slice(1), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function srgbChannelToLinear(channel0to255) {
  const c = channel0to255 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function linearChannelToSrgb(linearValue) {
  const c =
    linearValue <= 0.0031308
      ? linearValue * 12.92
      : 1.055 * Math.pow(Math.max(0, linearValue), 1 / 2.4) - 0.055;
  return Math.min(255, Math.max(0, Math.round(c * 255)));
}

function hexToOklab(hex) {
  const [rLinear, gLinear, bLinear] = hexToRgb(hex).map(srgbChannelToLinear);

  const l = Math.cbrt(0.4122214708 * rLinear + 0.5363325363 * gLinear + 0.0514459929 * bLinear);
  const m = Math.cbrt(0.2119034982 * rLinear + 0.6806995451 * gLinear + 0.1073969566 * bLinear);
  const s = Math.cbrt(0.0883024619 * rLinear + 0.2817188376 * gLinear + 0.6299787005 * bLinear);

  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToRgb(lightness, aAxis, bAxis) {
  const l = Math.pow(lightness + 0.3963377774 * aAxis + 0.2158037573 * bAxis, 3);
  const m = Math.pow(lightness - 0.1055613458 * aAxis - 0.0638541728 * bAxis, 3);
  const s = Math.pow(lightness - 0.0894841775 * aAxis - 1.291485548 * bAxis, 3);

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(linearChannelToSrgb);
}

// ---------------------------------------------------------------------------
// Small math helpers
// ---------------------------------------------------------------------------

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

// Smooth "ease in/out" curve, clamped to [0, 1]. Used everywhere the effect
// needs a soft falloff instead of a sharp linear one.
function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Color stop spacing
//
// Colors don't have to be evenly spaced along the gradient; `customGaps`
// lets you push some colors closer together and others further apart,
// exactly like dragging color-stop handles in a gradient editor.
// ---------------------------------------------------------------------------

function getDefaultStopGaps(colorCount) {
  // colorCount - 1 evenly spaced boundary points between 0 and 1.
  return Array.from({ length: Math.max(0, colorCount - 1) }, (_, i) => (i + 1) / colorCount);
}

function getStopBoundaries(colorCount, customGaps) {
  const gaps =
    customGaps && customGaps.length === colorCount - 1 ? customGaps : getDefaultStopGaps(colorCount);
  return [0, ...gaps, 1];
}

// How much influence a given color stop should have in the blend, relative
// to how much of the 0..1 range it "occupies".
function getStopInfluenceWeight(colorCount, customGaps, stopIndex) {
  const boundaries = getStopBoundaries(colorCount, customGaps);
  return (boundaries[stopIndex + 1] - boundaries[stopIndex]) * colorCount;
}

// ---------------------------------------------------------------------------
// Blob orbit motion (loop-safe)
//
// Each color gets its own "blob" that drifts around the canvas on an
// elliptical, non-synchronized-looking path. To guarantee a seamless loop,
// every blob's horizontal and vertical orbit speed is a whole number of
// cycles per loop — different integers per blob keep the motion feeling
// organic and independent, while the whole-number constraint guarantees
// the picture closes up perfectly after one loop.
// ---------------------------------------------------------------------------

function getBlobOrbitFrequencies(blobIndex) {
  const frequencyX = 2 + (blobIndex % 3); // cycles through 2, 3, 4, 2, 3, 4, ...
  const frequencyY = 3 + ((blobIndex + 1) % 4); // cycles through 4, 5, 6, 3, 4, 5, ...
  const phaseOffset = blobIndex * 0.37 * Math.PI * 2; // unique starting angle per blob
  return { frequencyX, frequencyY, phaseOffset };
}

function getBlobPosition(blobIndex, loopPhase) {
  const { frequencyX, frequencyY, phaseOffset } = getBlobOrbitFrequencies(blobIndex);
  const angleX = loopPhase * Math.PI * 2 * frequencyX + phaseOffset;
  const angleY = loopPhase * Math.PI * 2 * frequencyY + phaseOffset * 1.5;
  return [0.5 + 0.5 * Math.sin(angleX), 0.5 + 0.5 * Math.cos(angleY)];
}

// Fast component and slow component of the domain-warp animation. Their
// 5:1 ratio matches the original effect's feel; both being whole numbers
// of cycles per loop is what makes the warp itself loop seamlessly.
const WARP_PRIMARY_FREQUENCY = 5;
const WARP_SECONDARY_FREQUENCY = 1;

// How sharply each blob's color fades into its neighbors. Higher = smaller,
// more distinct blobs; lower = softer, more overlapping blending.
const BLOB_BLEND_SHARPNESS = 3.5;

// ---------------------------------------------------------------------------
// Core per-frame renderer
// ---------------------------------------------------------------------------

/**
 * Render one frame of the flow gradient into a 2D canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width  Render width in pixels (keep this modest, e.g.
 *                        200-500px, and scale the canvas up with CSS —
 *                        the effect is soft/blurry by nature so it stays
 *                        smooth even upscaled, and it renders much faster).
 * @param {number} height Render height in pixels.
 * @param {string[]} colors Hex colors, e.g. ['#EAF4FC', '#1E50A2', '#F09199'].
 * @param {number} loopPhase Animation position in [0, 1).
 * @param {object} [options]
 * @param {number} [options.scale=50]        0-100, zooms the pattern in/out.
 * @param {number} [options.distortion=60]   0-100, strength of the wave warp.
 * @param {number} [options.swirl=10]        0-100, strength of the edge swirl.
 * @param {number[]} [options.stopGaps]      Optional custom stop spacing.
 */
function renderFlowGradientFrame(ctx, width, height, colors, loopPhase, options = {}) {
  const { scale = 50, distortion = 60, swirl = 10, stopGaps = null } = options;

  // Map the 0-100 dial values onto the ranges the math actually uses.
  const zoomFactor = 0.4 + (scale / 100) * 1.2;
  const distortionAmount = distortion / 100;
  const swirlAmount = swirl / 100;

  const blobColorsOklab = colors.map(hexToOklab);
  const blobWeights = colors.map((_, i) => getStopInfluenceWeight(colors.length, stopGaps, i));
  const blobPositions = colors.map((_, i) => getBlobPosition(i, loopPhase));

  const warpPrimaryAngle = loopPhase * Math.PI * 2 * WARP_PRIMARY_FREQUENCY;
  const warpSecondaryAngle = loopPhase * Math.PI * 2 * WARP_SECONDARY_FREQUENCY;

  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  for (let pixelY = 0; pixelY < height; pixelY++) {
    const normalizedY = (pixelY + 0.5) / height;

    for (let pixelX = 0; pixelX < width; pixelX++) {
      const normalizedX = (pixelX + 0.5) / width;

      // Zoom the sampling coordinate in/out around the canvas center.
      let u = (normalizedX - 0.5) / zoomFactor + 0.5;
      let v = (normalizedY - 0.5) / zoomFactor + 0.5;

      // Distance from center: the warp and swirl both fade out near the
      // middle of the canvas and get stronger toward the edges.
      const edgeDistance = smoothstep01(Math.hypot(u - 0.5, v - 0.5));
      const warpStrength = 1 - edgeDistance;

      // Two octaves of animated sine-wave domain warping. Each octave
      // pushes u/v around based on the current warp angles and the other
      // axis's position — note v is read for the u update, and the
      // *already-updated* u is used for the v update, matching the
      // original effect's coupling between the two axes.
      for (let octave = 1; octave <= 2; octave++) {
        u +=
          ((distortionAmount * warpStrength) / octave) *
          Math.sin(warpPrimaryAngle + octave * 0.4 * smoothstep01(v)) *
          Math.cos(warpSecondaryAngle + octave * 2.4 * smoothstep01(v));

        v +=
          ((distortionAmount * warpStrength) / octave) *
          Math.cos(warpPrimaryAngle + octave * 2 * smoothstep01(u));
      }

      // Swirl rotation around the canvas center, strongest at the edges.
      const swirlAngle = -3 * swirlAmount * edgeDistance;
      const cosSwirl = Math.cos(swirlAngle);
      const sinSwirl = Math.sin(swirlAngle);
      const centeredU = u - 0.5;
      const centeredV = v - 0.5;
      u = cosSwirl * centeredU - sinSwirl * centeredV + 0.5;
      v = sinSwirl * centeredU + cosSwirl * centeredV + 0.5;

      // Blend every color blob using inverse-distance ("metaball") weighting:
      // closer blobs contribute much more than distant ones.
      let blendedL = 0;
      let blendedA = 0;
      let blendedB = 0;
      let totalWeight = 0;

      for (let i = 0; i < blobColorsOklab.length; i++) {
        const dx = u - blobPositions[i][0];
        const dy = v - blobPositions[i][1];
        const squaredDistance = dx * dx + dy * dy;
        const weight =
          blobWeights[i] / (Math.pow(squaredDistance, BLOB_BLEND_SHARPNESS / 2) + 1e-4);

        blendedL += blobColorsOklab[i][0] * weight;
        blendedA += blobColorsOklab[i][1] * weight;
        blendedB += blobColorsOklab[i][2] * weight;
        totalWeight += weight;
      }

      const inverseTotalWeight = 1 / Math.max(1e-4, totalWeight);
      const [r, g, b] = oklabToRgb(
        blendedL * inverseTotalWeight,
        blendedA * inverseTotalWeight,
        blendedB * inverseTotalWeight
      );

      const pixelIndex = (pixelY * width + pixelX) * 4;
      pixels[pixelIndex] = r;
      pixels[pixelIndex + 1] = g;
      pixels[pixelIndex + 2] = b;
      pixels[pixelIndex + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a flow gradient bound to a canvas element.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} colors Hex color stops, e.g. ['#EAF4FC', '#1E50A2', '#F09199'].
 * @param {object} [options] See `renderFlowGradientFrame` for scale/distortion/swirl/stopGaps.
 * @param {number} [options.scale=50]
 * @param {number} [options.distortion=60]
 * @param {number} [options.swirl=10]
 * @param {number[]} [options.stopGaps]
 * @param {number} [options.loopDurationMs=12000] How long one full loop takes.
 */
function createFlowGradient(canvas, colors, options = {}) {
  const ctx = canvas.getContext('2d');
  const loopDurationMs = options.loopDurationMs || 12000;

  let animationFrameId = null;
  let loopStartTimestamp = null;

  function draw(loopPhase) {
    renderFlowGradientFrame(ctx, canvas.width, canvas.height, colors, loopPhase, options);
  }

  function handleAnimationFrame(timestampMs) {
    if (loopStartTimestamp === null) loopStartTimestamp = timestampMs;
    const elapsedMs = (timestampMs - loopStartTimestamp) % loopDurationMs;
    draw(elapsedMs / loopDurationMs);
    animationFrameId = requestAnimationFrame(handleAnimationFrame);
  }

  function play() {
    if (animationFrameId !== null) return;
    loopStartTimestamp = null;
    animationFrameId = requestAnimationFrame(handleAnimationFrame);
  }

  function pause() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  return { draw, play, pause };
}

export {
  createFlowGradient,
  renderFlowGradientFrame,
  hexToRgb,
  hexToOklab,
  oklabToRgb,
};