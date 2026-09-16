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
  direction: 0, // 0-3 quarter turns
  intensity: 100, // 0-100 global opacity — also adjustable later, live, via the <video>'s `opacity` prop
  bandCount: 1,
  groundGlow: 20,
  ambient: 0,
  stars: false,
  starCount: 60,
  seed: 0,

  width: 720, // même résolution par défaut que le flow gradient — upscalée
  height: 360, // gratuitement par la taille CSS du <video>.

  frameCount: 900, // frames per loop
  fps: 40, // playback framerate; loopDuration = frameCount / fps seconds (here: 3s)

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

function loopOffset(loopPhase, radius) {
  const angle = loopPhase * Math.PI * 2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

// ---------------------------------------------------------------------------
// Core renderer — writes straight into a raw RGBA buffer (no canvas needed)
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

  const angle = (direction % 4) * (Math.PI / 2);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const bands = [];
  for (let k = 0; k < bandCount; k++) {
    const [loopX, loopY] = loopOffset(loopPhase, driftAmount * 6 + k * 1.7);
    bands.push({
      centerY: 0.14 + (k / Math.max(1, bandCount - 1)) * 0.34 + seed * 0.001,
      freqMul: freq * (1 + k * 0.18),
      loopX,
      loopY,
      phase: k * 12.9,
    });
  }

  const buffer = Buffer.allocUnsafe(width * height * 4); // RGBA — alpha is kept, unlike the flow gradient's RGB24

  for (let pixelY = 0; pixelY < height; pixelY++) {
    const normalizedY = (pixelY + 0.5) / height;

    for (let pixelX = 0; pixelX < width; pixelX++) {
      const normalizedX = (pixelX + 0.5) / width;

      const sx = (normalizedX - 0.5) * cosA - (normalizedY - 0.5) * sinA + 0.5;
      const sy = (normalizedX - 0.5) * sinA + (normalizedY - 0.5) * cosA + 0.5;

      let r = deepRgb[0] * ambientAmount;
      let g = deepRgb[1] * ambientAmount;
      let b = deepRgb[2] * ambientAmount;
      let a = ambientAmount;

      for (const band of bands) {
        const warp = fbm2(sx * band.freqMul * 2 + band.loopX, band.phase + band.loopY, 3);
        const spineY = band.centerY + (warp - 0.5) * 0.5 * (0.4 + foldAmount);
        const thickness =
          0.05 + foldAmount * 0.09 + fbm2(sx * band.freqMul * 3 + 5.2, band.loopX * 0.7, 2) * 0.03;
        const d = (sy - spineY) / Math.max(0.001, thickness);
        if (d < -1.4 || d > 3.2) continue;

        const spread = d < 0 ? 0.32 : 0.75 + foldAmount * 0.4;
        const shape = Math.exp(-(d * d) / (2 * spread * spread));

        const shimmer =
          0.65 + 0.35 * fbm2(sx * band.freqMul * 6 + band.loopX * 1.4, sy * 8 + band.phase, 3);
        const w = shape * shimmer;
        if (w <= 0.002) continue;

        const edge = clamp01(1 - Math.abs(d) * 1.4);
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

      a = Math.min(1, a) * globalIntensity;
      const pixelIndex = (pixelY * width + pixelX) * 4;
      buffer[pixelIndex] = Math.min(255, r);
      buffer[pixelIndex + 1] = Math.min(255, g);
      buffer[pixelIndex + 2] = Math.min(255, b);
      buffer[pixelIndex + 3] = Math.round(a * 255);
    }
  }

  if (stars) paintStars(buffer, width, height, loopPhase, starCount, seed, globalIntensity);

  return buffer;
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
    '-crf', '32',
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

async function renderAuroraGradientVideo(config) {
  const {
    width,
    height,
    colors,
    frameCount,
    fps,
    outputPathAlpha,
    outputPathFallback,
    fallbackBackground,
  } = config;

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
    const rgbaBuffer = renderAuroraGradientFrameToBuffer(width, height, colors, loopPhase, config);
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
