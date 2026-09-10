#!/usr/bin/env node
/**
 * Flow Gradient — video export
 * -----------------------------
 * Renders the flow gradient to a perfectly looping video file, offline
 * (Node.js + ffmpeg), so the browser never has to compute anything: the
 * component just plays a <video loop> tag.
 *
 * This reuses the exact same math as the original flow-gradient.js
 * (same color blending, warp, swirl, blob orbits), rewritten here to write
 * straight into a raw pixel buffer instead of a canvas — so it can run in
 * plain Node.js with no browser/DOM/canvas dependency at all.
 *
 * Requirements: Node.js and ffmpeg (with libx264) available on PATH.
 *
 * Usage:
 *   node render-flow-gradient-video.mjs
 *
 * Edit the CONFIG block below to change colors, size, duration, etc.
 * Re-run any time the gradient's look needs to change — the output file
 * is a static asset you commit/deploy, not something generated at runtime.
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
  colors: ["#C9D2E0", "#9FB0D6", "#5d6ba8", "#293d80", "#C9D2E0"],
  scale: 0,
  distortion: 42,
  swirl: 50,

  width: 360, // render resolution — the video is upscaled for free by the
  height: 280, // <video> element's CSS size, so this doesn't need to match
  //             the on-screen display size.

  frameCount: 600, // frames per loop — more = smoother motion, bigger file
  fps: 30, // playback framerate; loopDuration = frameCount / fps seconds (here: 3s)

  outputPath: path.resolve(gradientsDirectory, '../../public/gradients/flow-gradient-loop.mp4'),
};

// ---------------------------------------------------------------------------
// Color math: sRGB hex <-> OKLab (same as flow-gradient.js)
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
// General math + stop spacing + blob orbits (same as flow-gradient.js)
// ---------------------------------------------------------------------------

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function getDefaultStopGaps(colorCount) {
  return Array.from({ length: Math.max(0, colorCount - 1) }, (_, i) => (i + 1) / colorCount);
}

function getStopBoundaries(colorCount, customGaps) {
  const gaps =
    customGaps && customGaps.length === colorCount - 1 ? customGaps : getDefaultStopGaps(colorCount);
  return [0, ...gaps, 1];
}

function getStopInfluenceWeight(colorCount, customGaps, stopIndex) {
  const boundaries = getStopBoundaries(colorCount, customGaps);
  return (boundaries[stopIndex + 1] - boundaries[stopIndex]) * colorCount;
}

function getBlobOrbitFrequencies(blobIndex) {
  const frequencyX = 2 + (blobIndex % 3);
  const frequencyY = 3 + ((blobIndex + 1) % 4);
  const phaseOffset = blobIndex * 0.37 * Math.PI * 2;
  return { frequencyX, frequencyY, phaseOffset };
}

function getBlobPosition(blobIndex, loopPhase) {
  const { frequencyX, frequencyY, phaseOffset } = getBlobOrbitFrequencies(blobIndex);
  const angleX = loopPhase * Math.PI * 2 * frequencyX + phaseOffset;
  const angleY = loopPhase * Math.PI * 2 * frequencyY + phaseOffset * 1.5;
  return [0.5 + 0.5 * Math.sin(angleX), 0.5 + 0.5 * Math.cos(angleY)];
}

const WARP_PRIMARY_FREQUENCY = 5;
const WARP_SECONDARY_FREQUENCY = 1;
const BLOB_BLEND_SHARPNESS = 3.5;

// ---------------------------------------------------------------------------
// Core renderer — writes straight into a raw RGB24 buffer (no canvas needed)
// ---------------------------------------------------------------------------

function renderFlowGradientFrameToBuffer(width, height, colors, loopPhase, options = {}) {
  const { scale = 0, distortion = 42, swirl = 50, stopGaps = null } = options;

  const zoomFactor = 0.4 + (scale / 100) * 1.2;
  const distortionAmount = distortion / 100;
  const swirlAmount = swirl / 100;

  const blobColorsOklab = colors.map(hexToOklab);
  const blobWeights = colors.map((_, i) => getStopInfluenceWeight(colors.length, stopGaps, i));
  const blobPositions = colors.map((_, i) => getBlobPosition(i, loopPhase));

  const warpPrimaryAngle = loopPhase * Math.PI * 2 * WARP_PRIMARY_FREQUENCY;
  const warpSecondaryAngle = loopPhase * Math.PI * 2 * WARP_SECONDARY_FREQUENCY;

  const buffer = Buffer.allocUnsafe(width * height * 3); // RGB24, no alpha needed for video

  for (let pixelY = 0; pixelY < height; pixelY++) {
    const normalizedY = (pixelY + 0.5) / height;

    for (let pixelX = 0; pixelX < width; pixelX++) {
      const normalizedX = (pixelX + 0.5) / width;

      let u = (normalizedX - 0.5) / zoomFactor + 0.5;
      let v = (normalizedY - 0.5) / zoomFactor + 0.5;

      const edgeDistance = smoothstep01(Math.hypot(u - 0.5, v - 0.5));
      const warpStrength = 1 - edgeDistance;

      for (let octave = 1; octave <= 2; octave++) {
        u +=
          ((distortionAmount * warpStrength) / octave) *
          Math.sin(warpPrimaryAngle + octave * 0.4 * smoothstep01(v)) *
          Math.cos(warpSecondaryAngle + octave * 2.4 * smoothstep01(v));

        v +=
          ((distortionAmount * warpStrength) / octave) *
          Math.cos(warpPrimaryAngle + octave * 2 * smoothstep01(u));
      }

      const swirlAngle = -3 * swirlAmount * edgeDistance;
      const cosSwirl = Math.cos(swirlAngle);
      const sinSwirl = Math.sin(swirlAngle);
      const centeredU = u - 0.5;
      const centeredV = v - 0.5;
      u = cosSwirl * centeredU - sinSwirl * centeredV + 0.5;
      v = sinSwirl * centeredU + cosSwirl * centeredV + 0.5;

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

      const pixelIndex = (pixelY * width + pixelX) * 3;
      buffer[pixelIndex] = r;
      buffer[pixelIndex + 1] = g;
      buffer[pixelIndex + 2] = b;
    }
  }

  return buffer;
}

// ---------------------------------------------------------------------------
// Encode: pipe raw frames straight into ffmpeg
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

async function renderFlowGradientVideo(config) {
  const { width, height, colors, frameCount, fps, outputPath } = config;

  const ffmpeg = spawn(resolveFfmpegPath(), [
    '-y', // overwrite output file if it exists
    '-f', 'rawvideo',
    '-pixel_format', 'rgb24',
    '-video_size', `${width}x${height}`,
    '-framerate', String(fps),
    '-i', 'pipe:0',
    '-frames:v', String(frameCount),
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p', // widest browser/device compatibility
    '-crf', '18', // visual quality (lower = better/bigger; 18 is near-lossless)
    '-preset', 'slow',
    '-movflags', '+faststart', // lets the video start playing before fully downloaded
    outputPath,
  ]);

  ffmpeg.stderr.on('data', () => {}); // ffmpeg logs progress to stderr; ignore unless debugging

  const ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`))));
    ffmpeg.on('error', reject);
  });

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const loopPhase = frameIndex / frameCount; // never render phase 1 — identical to phase 0, that's what makes the loop seamless
    const frameBuffer = renderFlowGradientFrameToBuffer(width, height, colors, loopPhase, config);

    const canWriteMore = ffmpeg.stdin.write(frameBuffer);
    if (!canWriteMore) {
      // Respect backpressure so we don't buffer the whole video in memory.
      await new Promise((resolve) => ffmpeg.stdin.once('drain', resolve));
    }

    process.stdout.write(`\rRendering frame ${frameIndex + 1}/${frameCount}`);
  }
  process.stdout.write('\n');

  ffmpeg.stdin.end();
  await ffmpegDone;
  console.log(`Done: ${outputPath}`);
}

renderFlowGradientVideo(CONFIG).catch((error) => {
  console.error(error);
  process.exit(1);
});
