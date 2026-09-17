#!/usr/bin/env node
/**
 * Aurora Gradient — video export
 * -------------------------------
 * Renders the aurora gradient to two perfectly looping video files, offline
 * (Node.js + ffmpeg), so the browser never has to compute anything — exactly
 * the same approach as render-flow-gradient-video.mjs.
 *
 * This reuses the exact same math as aurora-gradient-video.js (same OKLab
 * color blending, band/noise model), rewritten here to write straight into
 * raw pixel buffers instead of a canvas — so it can run in plain Node.js
 * with no browser/DOM/canvas dependency at all, exactly like the flow
 * gradient's export script.
 *
 * One key difference from the flow gradient: the aurora NEEDS an alpha
 * channel (that's the whole point — seeing what's behind it), and a plain
 * H.264 .mp4 has no alpha. So this script renders TWO files:
 *
 *   1. outputPathAlpha    — a WebM (VP9, yuva420p) with a REAL alpha
 *      channel. Chrome, Edge and Firefox play this natively in a <video>
 *      tag with true transparency.
 *   2. outputPathFallback — a flattened, opaque .mp4 (same look, composited
 *      over `fallbackBackground`) for browsers that can't decode WebM/VP9
 *      alpha in <video> (notably Safari). Put this as the second <source>
 *      in the component — the browser automatically falls back to it.
 *
 * Requirements: Node.js and ffmpeg (with libx264 AND libvpx-vp9) on PATH.
 *
 * Usage:
 *   node render-aurora-gradient-video.mjs
 *
 * Edit the CONFIG block below to change colors, size, duration, etc.
 */

import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const gradientsDirectory = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// CONFIG — edit this to change the exported gradient
// ---------------------------------------------------------------------------

const CONFIG = {
  colors: ['#EAFFF4', '#4BE8A0', '#2E6E80', '#16224D'], // [rim, glow, horizon, deep]

  // Same three dials as the flow gradient, so both gradients can be tuned
  // and reasoned about the same way, even though they drive different math
  // internally (distortion ~ curtain "fold", swirl ~ horizontal "drift").
  scale: 55,
  distortion: 55,
  swirl: 40,

  // Aurora-specific extras (no equivalent in the flow gradient):
  direction: 0, // 0-3 quarter turns — quel bord de départ pour `position` ci-dessous
  position: 30, // 0-100 : où se centre le rideau le long de l'axe perpendiculaire à `direction`
  // (0 = collé au bord de départ — l'ancien comportement par défaut —, 100 = collé au bord opposé).
  variation: 60, // 0-100 : à quel point la hauteur/intensité de l'aurore varie d'un endroit à
  // l'autre de la largeur (0 = uniforme, 100 = zones marquées / zones presque invisibles).
  intensity: 100, // 0-100 global opacity — also adjustable later, live, via the <video>'s `opacity` prop
  bandCount: 1,
  groundGlow: 20,
  ambient: 0,
  stars: false,
  starCount: 60,
  seed: 0,

  // VITESSE du mouvement, en millisecondes pour un tour complet de dérive —
  // totalement indépendante de `frameCount`/`fps` ci-dessous. Diminuer cette
  // valeur = mouvement plus rapide, quels que soient la durée du fichier
  // exporté ou son frame rate. En interne, le script calcule combien de
  // tours entiers (`loopCycles`) tiennent dans la durée totale de la vidéo
  // (frameCount / fps) pour se rapprocher le plus possible de cette vitesse
  // tout en gardant un bouclage parfait (voir le log au lancement).
  loopDurationMs: 50000,

  width: 960, // plus net qu'avant (720x360) sans exploser le temps de rendu
  height: 540, // grâce à l'optimisation par colonne/ligne ci-dessous (~6-7 min pour 900 frames).

  frameCount: 900, // frames per loop — contrôle la fluidité et la durée du fichier, PAS la vitesse du motif
  fps: 40, // playback framerate; durée du fichier = frameCount / fps secondes (ici : 22.5s)

  // Couleur de fond utilisée UNIQUEMENT pour aplatir la vidéo de repli
  // (celle qui perd la transparence) — idéalement la couleur de fond
  // réelle du Hero, pour que le repli reste invisible.
  fallbackBackground: '#05070f',

  outputPathAlpha: path.resolve(gradientsDirectory, '../../public/gradients/aurora-gradient-loop.webm'),
  outputPathFallback: path.resolve(gradientsDirectory, '../../public/gradients/aurora-gradient-loop.mp4'),
};

// ---------------------------------------------------------------------------
// Color math: sRGB hex <-> OKLab (same as aurora-gradient-video.js)
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

function mixOklab(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

// ---------------------------------------------------------------------------
// General math (same as aurora-gradient-video.js)
// ---------------------------------------------------------------------------

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const AURORA_DEFAULT_COLORS = ['#EAFFF4', '#4BE8A0', '#2E6E80', '#16224D'];

function resolveAuroraColors(colors) {
  const resolved = AURORA_DEFAULT_COLORS.slice();
  if (colors) {
    for (let i = 0; i < Math.min(4, colors.length); i++) resolved[i] = colors[i];
  }
  return resolved;
}

function hash21(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise2D(x, y) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  let xf = x - xi;
  let yf = y - yi;
  xf = xf * xf * (3 - 2 * xf);
  yf = yf * yf * (3 - 2 * yf);
  const a = hash21(xi, yi);
  const b = hash21(xi + 1, yi);
  const c = hash21(xi, yi + 1);
  const d = hash21(xi + 1, yi + 1);
  return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
}

const NOISE_ROTATION_COS = Math.cos(0.5);
const NOISE_ROTATION_SIN = Math.sin(0.5);

function fbm2(x, y, octaves = 4) {
  let value = 0;
  let amp = 0.5;
  let cx = x;
  let cy = y;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(cx, cy);
    const rx = cx * NOISE_ROTATION_COS - cy * NOISE_ROTATION_SIN;
    const ry = cx * NOISE_ROTATION_SIN + cy * NOISE_ROTATION_COS;
    cx = rx * 2 + 100;
    cy = ry * 2 + 100;
    amp *= 0.5;
  }
  return value;
}

function loopOffset(loopPhase, radius, cycles = 1) {
  const angle = loopPhase * cycles * Math.PI * 2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function ridgeNoise2D(x, y) {
  return 1 - Math.abs(valueNoise2D(x, y) * 2 - 1);
}

/** Bruit "en crête" : transitions nettes plutôt que des bosses arrondies — mieux adapté à des filaments/rayons qu'un fbm classique. */
function ridgedFbm2(x, y, octaves = 3) {
  let value = 0;
  let amp = 0.5;
  let cx = x;
  let cy = y;
  for (let i = 0; i < octaves; i++) {
    value += amp * ridgeNoise2D(cx, cy);
    const rx = cx * NOISE_ROTATION_COS - cy * NOISE_ROTATION_SIN;
    const ry = cx * NOISE_ROTATION_SIN + cy * NOISE_ROTATION_COS;
    cx = rx * 2 + 100;
    cy = ry * 2 + 100;
    amp *= 0.55;
  }
  return value;
}

// ---------------------------------------------------------------------------
// Core renderer — writes straight into a raw RGBA buffer (no canvas needed)
//
// Identique à aurora-gradient-video.js (même correctifs de netteté : rayons
// filamenteux en bruit "en crête" + bord bas resserré + contraste, même
// enveloppe basse fréquence par rideau pour l'effet "la grandeur varie par
// endroit", même `position` réglable, mêmes calculs mis en cache par
// colonne/ligne selon `direction`) et même `loopCycles` pour la vitesse.
// ---------------------------------------------------------------------------

function renderAuroraGradientFrameToBuffer(width, height, colors, loopPhase, options = {}) {
  const {
    scale = 55,
    distortion = 55,
    swirl = 40,
    direction = 0,
    intensity = 100,
    bandCount = 3,
    groundGlow = 20,
    ambient = 0,
    stars = false,
    starCount = 60,
    seed = 0,
    loopCycles = 1,
    position = 30,
    variation = 60,
  } = options;

  const [rimHex, glowHex, horizonHex, deepHex] = resolveAuroraColors(colors);
  const rimOklab = hexToOklab(rimHex);
  const glowOklab = hexToOklab(glowHex);
  const horizonRgb = hexToRgb(horizonHex);
  const deepRgb = hexToRgb(deepHex);

  const freq = 1 + (1 - scale / 100) * 2.8;
  const foldAmount = distortion / 100;
  const driftAmount = 0.15 + (swirl / 100) * 1.1;
  const globalIntensity = intensity / 100;
  const groundGlowAmount = groundGlow / 100;
  const ambientAmount = ambient / 100;

  const directionIsQuarterTurn = direction % 2 === 1;
  const staticAxisSize = directionIsQuarterTurn ? height : width;
  const varyingAxisSize = directionIsQuarterTurn ? width : height;

  const sxLookup = new Float32Array(staticAxisSize);
  for (let idx = 0; idx < staticAxisSize; idx++) {
    const t = (idx + 0.5) / staticAxisSize;
    sxLookup[idx] = direction === 0 || direction === 3 ? t : 1 - t;
  }

  const syLookup = new Float32Array(varyingAxisSize);
  for (let idx = 0; idx < varyingAxisSize; idx++) {
    const t = (idx + 0.5) / varyingAxisSize;
    syLookup[idx] = direction === 0 || direction === 1 ? t : 1 - t;
  }

  const positionCenter = position / 100;
  const bandSpread = 0.3;
  const variationAmount = variation / 100;

  const bands = [];
  for (let k = 0; k < bandCount; k++) {
    const [loopX, loopY] = loopOffset(loopPhase, driftAmount * 6 + k * 1.7, loopCycles);
    const band = {
      centerY:
        positionCenter - bandSpread / 2 + (k / Math.max(1, bandCount - 1)) * bandSpread + seed * 0.001,
      freqMul: freq * (1 + k * 0.18),
      loopX,
      loopY,
      phase: k * 12.9,
      foldAmount,
      spineY: new Float32Array(staticAxisSize),
      thickness: new Float32Array(staticAxisSize),
      filament: new Float32Array(staticAxisSize),
      envelope: new Float32Array(staticAxisSize),
    };

    for (let idx = 0; idx < staticAxisSize; idx++) {
      const sx = sxLookup[idx];

      const envelopeNoise = fbm2(
        sx * band.freqMul * 0.32 + band.loopX * 0.4 + k * 7.3,
        band.phase * 0.5 + band.loopY * 0.3,
        3
      );
      const envelope01 = smoothstep(0.28, 0.72, envelopeNoise);
      const effectiveEnvelope = 1 - variationAmount * (1 - envelope01);
      band.envelope[idx] = effectiveEnvelope;

      const warp = fbm2(sx * band.freqMul * 2 + band.loopX, band.phase + band.loopY, 3);
      band.spineY[idx] = band.centerY + (warp - 0.5) * 0.5 * (0.4 + foldAmount);
      const baseThickness =
        0.045 + foldAmount * 0.08 + fbm2(sx * band.freqMul * 3 + 5.2, band.loopX * 0.7, 2) * 0.025;
      band.thickness[idx] = baseThickness * (0.25 + 0.9 * effectiveEnvelope);

      const filamentNoise = ridgedFbm2(
        sx * band.freqMul * 34 + band.loopX * 2.6,
        band.phase * 3.1 + band.loopY * 1.6,
        3
      );
      band.filament[idx] = smoothstep(0.45, 0.55, filamentNoise);
    }

    bands.push(band);
  }

  const buffer = Buffer.allocUnsafe(width * height * 4); // RGBA — alpha is kept, unlike the flow gradient's RGB24

  if (!directionIsQuarterTurn) {
    for (let pixelY = 0; pixelY < height; pixelY++) {
      const normalizedY = (pixelY + 0.5) / height;
      const sy = syLookup[pixelY];

      for (let pixelX = 0; pixelX < width; pixelX++) {
        writeAuroraPixel(
          buffer, (pixelY * width + pixelX) * 4, bands, pixelX, sy, sxLookup[pixelX],
          normalizedY, deepRgb, ambientAmount, groundGlowAmount, horizonRgb,
          glowOklab, rimOklab, globalIntensity
        );
      }
    }
  } else {
    for (let pixelY = 0; pixelY < height; pixelY++) {
      const staticIdx = pixelY;
      const sxForShimmer = sxLookup[staticIdx];
      const normalizedY = (pixelY + 0.5) / height;

      for (let pixelX = 0; pixelX < width; pixelX++) {
        writeAuroraPixel(
          buffer, (pixelY * width + pixelX) * 4, bands, staticIdx, syLookup[pixelX], sxForShimmer,
          normalizedY, deepRgb, ambientAmount, groundGlowAmount, horizonRgb,
          glowOklab, rimOklab, globalIntensity
        );
      }
    }
  }

  if (stars) paintStars(buffer, width, height, loopPhase, starCount, seed, globalIntensity);

  return buffer;
}

/** Calcule et écrit un pixel RGBA — identique à writeAuroraPixel dans aurora-gradient-video.js. */
function writeAuroraPixel(
  buffer, pixelIndex, bands, staticIdx, sy, sxForShimmer,
  normalizedY, deepRgb, ambientAmount, groundGlowAmount, horizonRgb,
  glowOklab, rimOklab, globalIntensity
) {
  let r = deepRgb[0] * ambientAmount;
  let g = deepRgb[1] * ambientAmount;
  let b = deepRgb[2] * ambientAmount;
  let a = ambientAmount;

  for (const band of bands) {
    const spineY = band.spineY[staticIdx];
    const thickness = band.thickness[staticIdx];
    const d = (sy - spineY) / Math.max(0.001, thickness);
    if (d < -1.4 || d > 3.2) continue;

    const spread = d < 0 ? 0.16 : 0.42 + band.foldAmount * 0.24;
    const shape = Math.pow(Math.exp(-(d * d) / (2 * spread * spread)), 1.7);

    const shimmer =
      0.5 + 0.5 * fbm2(sxForShimmer * band.freqMul * 6 + band.loopX * 1.4, sy * 8 + band.phase, 3);
    const filamentFactor = 0.25 + 1.05 * band.filament[staticIdx];
    const w = shape * shimmer * filamentFactor * band.envelope[staticIdx];
    if (w <= 0.002) continue;

    const edge = clamp01(1 - Math.abs(d) * 2.3);
    const blended = mixOklab(glowOklab, rimOklab, edge);
    const [cr, cg, cb] = oklabToRgb(blended[0], blended[1], blended[2]);

    r += cr * w;
    g += cg * w;
    b += cb * w;
    a += w;
  }

  if (groundGlowAmount > 0) {
    const groundT = Math.max(0, (normalizedY - 0.72) / 0.28);
    if (groundT > 0) {
      const gw = groundT * groundT * groundGlowAmount * 0.5;
      r += horizonRgb[0] * gw;
      g += horizonRgb[1] * gw;
      b += horizonRgb[2] * gw;
      a += gw;
    }
  }

  a = smoothstep(0.04, 0.92, Math.min(1, a)) * globalIntensity;
  buffer[pixelIndex] = Math.min(255, r);
  buffer[pixelIndex + 1] = Math.min(255, g);
  buffer[pixelIndex + 2] = Math.min(255, b);
  buffer[pixelIndex + 3] = Math.round(a * 255);
}

function paintStars(buffer, width, height, loopPhase, count, seed, globalIntensity) {
  for (let i = 0; i < count; i++) {
    const hx = hash21(i * 12.9898 + seed, 3.7);
    const hy = hash21(i * 78.233 + seed, 9.1);
    const x = Math.floor(hx * width);
    const y = Math.floor(hy * height * 0.7);
    const twinkle = 0.5 + 0.5 * Math.sin(loopPhase * Math.PI * 2 + i * 12.9);
    const alpha = Math.max(0, twinkle - 0.4) * 1.6 * globalIntensity;
    if (alpha <= 0) continue;
    const idx = (y * width + x) * 4;
    const v = 255 * Math.min(1, alpha);
    buffer[idx] = Math.max(buffer[idx], v);
    buffer[idx + 1] = Math.max(buffer[idx + 1], v);
    buffer[idx + 2] = Math.max(buffer[idx + 2], v);
    buffer[idx + 3] = Math.max(buffer[idx + 3], v);
  }
}

/** Aplatit un buffer RGBA sur un fond opaque -> buffer RGB24 (pour le repli .mp4). */
function compositeOverBackground(rgbaBuffer, width, height, backgroundHex) {
  const [bgR, bgG, bgB] = hexToRgb(backgroundHex);
  const out = Buffer.allocUnsafe(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    const src = i * 4;
    const dst = i * 3;
    const alpha = rgbaBuffer[src + 3] / 255;
    out[dst] = rgbaBuffer[src] * alpha + bgR * (1 - alpha);
    out[dst + 1] = rgbaBuffer[src + 1] * alpha + bgG * (1 - alpha);
    out[dst + 2] = rgbaBuffer[src + 2] * alpha + bgB * (1 - alpha);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Encode: pipe raw frames straight into two ffmpeg processes in parallel
// (same ffmpeg resolution logic as render-flow-gradient-video.mjs)
// ---------------------------------------------------------------------------

function findFfmpegInDirectory(directory) {
  if (!fs.existsSync(directory)) return null;

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isFile() && entry.name.toLowerCase() === 'ffmpeg.exe') return entryPath;
    if (entry.isDirectory()) {
      const result = findFfmpegInDirectory(entryPath);
      if (result) return result;
    }
  }

  return null;
}

function resolveFfmpegPath() {
  const configuredPath = process.env.FFMPEG_PATH;
  if (configuredPath && fs.existsSync(configuredPath)) return configuredPath;

  if (process.platform === 'win32') {
    const wingetPackagesPath = path.join(
      process.env.LOCALAPPDATA ?? '',
      'Microsoft',
      'WinGet',
      'Packages'
    );
    const ffmpegPath = findFfmpegInDirectory(wingetPackagesPath);
    if (ffmpegPath) return ffmpegPath;
  }

  return 'ffmpeg';
}

function spawnAlphaWebmEncoder(width, height, fps, frameCount, outputPath) {
  return spawn(resolveFfmpegPath(), [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgba',
    '-video_size', `${width}x${height}`,
    '-framerate', String(fps),
    '-i', 'pipe:0',
    '-frames:v', String(frameCount),
    '-c:v', 'libvpx-vp9',
    '-pix_fmt', 'yuva420p', // keeps the alpha channel through encoding
    '-auto-alt-ref', '0', // required by libvpx-vp9 when encoding alpha
    '-b:v', '0',
    '-crf', '24', // plus bas que la valeur initiale (32) : sensiblement plus net, fichier un peu plus lourd
    '-metadata:s:v:0', 'alpha_mode="1"', // signal alpha explicitly in the WebM/Matroska container
    outputPath,
  ]);
}

function spawnFallbackMp4Encoder(width, height, fps, frameCount, outputPath) {
  return spawn(resolveFfmpegPath(), [
    '-y',
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${width}x${height}`,
    '-framerate', String(fps),
    '-i', 'pipe:0',
    '-frames:v', String(frameCount),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', '18',
    '-preset', 'slow',
    '-movflags', '+faststart',
    outputPath,
  ]);
}

async function writeAndMaybeWait(stream, buffer) {
  const canWriteMore = stream.write(buffer);
  if (!canWriteMore) {
    await new Promise((resolve) => stream.once('drain', resolve));
  }
}

function waitForClose(ffmpeg, label) {
  return new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) =>
      code === 0 ? resolve() : reject(new Error(`${label} ffmpeg exited with code ${code}`))
    );
    ffmpeg.on('error', reject);
  });
}

/**
 * Combien de tours complets de la boucle de dérive tiennent dans la durée
 * totale de la vidéo exportée, pour que la vitesse VISIBLE se rapproche le
 * plus possible de `loopDurationMs` — tout en restant un entier (>= 1),
 * seule façon de garantir un bouclage parfait sur `<video loop>`.
 */
function resolveLoopCycles(frameCount, fps, loopDurationMs) {
  const totalVideoDurationMs = (frameCount / fps) * 1000;
  const cycles = Math.max(1, Math.round(totalVideoDurationMs / loopDurationMs));
  const effectiveLoopDurationMs = totalVideoDurationMs / cycles;
  return { cycles, totalVideoDurationMs, effectiveLoopDurationMs };
}

async function renderAuroraGradientVideo(config) {
  const {
    width,
    height,
    colors,
    frameCount,
    fps,
    loopDurationMs,
    outputPathAlpha,
    outputPathFallback,
    fallbackBackground,
  } = config;

  const { cycles, totalVideoDurationMs, effectiveLoopDurationMs } = resolveLoopCycles(
    frameCount,
    fps,
    loopDurationMs
  );
  console.log(
    `Clip: ${(totalVideoDurationMs / 1000).toFixed(1)}s total, ${cycles} tour(s) de dérive, ` +
      `soit une vitesse réelle de ${effectiveLoopDurationMs.toFixed(0)}ms/tour ` +
      `(demandé : ${loopDurationMs}ms/tour — l'écart vient de l'arrondi nécessaire au bouclage parfait).`
  );
  const renderOptions = { ...config, loopCycles: cycles };

  for (const outputPath of [outputPathAlpha, outputPathFallback]) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  const alphaFfmpeg = spawnAlphaWebmEncoder(width, height, fps, frameCount, outputPathAlpha);
  const fallbackFfmpeg = spawnFallbackMp4Encoder(width, height, fps, frameCount, outputPathFallback);
  alphaFfmpeg.stderr.on('data', () => {});
  fallbackFfmpeg.stderr.on('data', () => {});

  const alphaDone = waitForClose(alphaFfmpeg, 'alpha (webm)');
  const fallbackDone = waitForClose(fallbackFfmpeg, 'fallback (mp4)');

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const loopPhase = frameIndex / frameCount; // never render phase 1 — identical to phase 0
    const rgbaBuffer = renderAuroraGradientFrameToBuffer(width, height, colors, loopPhase, renderOptions);
    const flattenedBuffer = compositeOverBackground(rgbaBuffer, width, height, fallbackBackground);

    await Promise.all([
      writeAndMaybeWait(alphaFfmpeg.stdin, rgbaBuffer),
      writeAndMaybeWait(fallbackFfmpeg.stdin, flattenedBuffer),
    ]);

    process.stdout.write(`\rRendering frame ${frameIndex + 1}/${frameCount}`);
  }
  process.stdout.write('\n');

  alphaFfmpeg.stdin.end();
  fallbackFfmpeg.stdin.end();
  await Promise.all([alphaDone, fallbackDone]);

  console.log(`Done: ${outputPathAlpha}`);
  console.log(`Done: ${outputPathFallback}`);
}

renderAuroraGradientVideo(CONFIG).catch((error) => {
  console.error(error);
  process.exit(1);
});
