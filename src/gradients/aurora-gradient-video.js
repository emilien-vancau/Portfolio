/**
 * Aurora Gradient
 * ---------------
 * Un effet de rideaux de lumière (aurore boréale) qui ondulent et dérivent
 * doucement, avec un ciel transparent entre les rideaux (canal alpha réel)
 * pour laisser voir ce qu'il y a derrière.
 *
 * Architecture volontairement calquée sur flow-gradient-video.js — mêmes
 * conventions, même forme d'API — mais le code lui-même est isolé et ne
 * partage aucun import avec lui (duplication assumée), afin qu'une évolution
 * de l'un ne puisse jamais casser l'autre.
 *
 * Comme pour le flow gradient, tout le mouvement (dérive des rideaux,
 * ondulation) est piloté par un seul `loopPhase` dans [0, 1). Le bouclage
 * est garanti différemment que pour le flow (qui utilise des fréquences en
 * nombre entier de cycles) : ici, la dérive est un point qui parcourt un
 * cercle dans l'espace du bruit — comme cos/sin sont périodiques, l'image à
 * loopPhase = 0 est identique à loopPhase → 1, donc aucune couture visible
 * en boucle.
 *
 * Deux façons de l'utiliser :
 *
 * 1) Live, calcul dynamique à chaque frame :
 *
 *   import { createAuroraGradient } from './aurora-gradient-video.js';
 *
 *   const canvas = document.querySelector('canvas');
 *   const gradient = createAuroraGradient(canvas, ['#EAFFF4', '#4BE8A0', '#2E6E80', '#16224D'], {
 *     scale: 55,
 *     distortion: 55,
 *     swirl: 40,
 *     intensity: 100,
 *     loopDurationMs: 22500,
 *   });
 *   gradient.play();
 *
 * 2) Précalculé (moins cher) : mêmes fonctions `precomputeAuroraGradientFrames`
 *    / `createPrecomputedAuroraGradientPlayer` que pour le flow gradient.
 *
 * Pour un export vidéo qui boucle parfaitement (l'option recommandée, voir
 * render-aurora-gradient-video.mjs) : ne jamais rendre la frame
 * loopPhase = 1, elle est strictement identique à loopPhase = 0.
 */

// ---------------------------------------------------------------------------
// Couleurs : sRGB hex <-> OKLab (dupliqué depuis flow-gradient-video.js à
// l'identique — même rationale : éviter les mélanges "boueux" en blend RGB
// direct — mais gardé ici pour que ce fichier reste totalement autonome).
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
// Petits utilitaires math (mêmes noms que flow-gradient-video.js)
// ---------------------------------------------------------------------------

function clamp01(value) {
  return Math.min(1, Math.max(0, value));
}

function smoothstep01(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Rôles de couleur
//
// À la différence du flow gradient (N blobs arbitraires mélangés par
// distance), l'aurore a 4 rôles fixes. `colors` reste néanmoins un tableau
// de hex — même convention d'appel que le flow gradient — mais on ne prend
// que les 4 premiers ([rim, glow, horizon, deep]) ; les rôles manquants
// retombent sur la palette par défaut.
// ---------------------------------------------------------------------------

const AURORA_DEFAULT_COLORS = ['#EAFFF4', '#4BE8A0', '#2E6E80', '#16224D']; // rim, glow, horizon, deep

function resolveAuroraColors(colors) {
  const resolved = AURORA_DEFAULT_COLORS.slice();
  if (colors) {
    for (let i = 0; i < Math.min(4, colors.length); i++) resolved[i] = colors[i];
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// Bruit (implémentation propre, indépendante de celle du flow gradient —
// le flow gradient n'a pas besoin de bruit de Perlin, il n'utilise que des
// sinus/cosinus animés, donc rien à réutiliser ici de toute façon).
// ---------------------------------------------------------------------------

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

/**
 * Point qui parcourt un cercle de rayon `radius` en fonction de loopPhase —
 * garantit le bouclage. `cycles` (entier >= 1) fait parcourir le cercle
 * plusieurs fois sur la durée totale du clip : c'est ce qui permet de régler
 * la VITESSE du mouvement indépendamment du nombre de frames et du frame
 * rate (voir `loopCycles` dans les options, et `loopDurationMs` dans
 * render-aurora-gradient-video.mjs). Comme cos/sin restent périodiques pour
 * n'importe quel entier de cycles, le bouclage reste parfait.
 */
function loopOffset(loopPhase, radius, cycles = 1) {
  const angle = loopPhase * cycles * Math.PI * 2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

function smoothstep(edge0, edge1, value) {
  const t = clamp01((value - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

// ---------------------------------------------------------------------------
// Core per-frame renderer
// ---------------------------------------------------------------------------

/**
 * Render one frame of the aurora gradient into a 2D canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width  Render width in pixels (keep this modest, comme
 *                        pour le flow gradient — 200-500px, upscalé en CSS).
 * @param {number} height Render height in pixels.
 * @param {string[]} colors Hex colors, dans l'ordre [rim, glow, horizon, deep].
 *   Les rôles manquants retombent sur AURORA_DEFAULT_COLORS.
 * @param {number} loopPhase Animation position in [0, 1).
 * @param {object} [options]
 * @param {number} [options.scale=50]       0-100, zoom du motif (même dial que le flow gradient).
 * @param {number} [options.distortion=50]  0-100, ondulation des rideaux (équivalent "fold").
 * @param {number} [options.swirl=40]       0-100, dérive horizontale (équivalent "drift").
 * @param {number} [options.direction=0]    0-3, quarts de tour.
 * @param {number} [options.intensity=100]  0-100, opacité globale — LE réglage "voir l'arrière-plan".
 * @param {number} [options.bandCount=3]    nombre de rideaux de lumière.
 * @param {number} [options.groundGlow=20]  0-100, lueur d'horizon en bas de cadre.
 * @param {number} [options.ambient=0]      0-100, léger voile "deep" uniforme.
 * @param {boolean} [options.stars=false]   semis d'étoiles scintillantes (désactivé par défaut).
 * @param {number} [options.starCount=60]
 * @param {number} [options.seed=0]
 * @param {number} [options.loopCycles=1]   nombre de tours de boucle sur la durée du clip —
 *   c'est ce paramètre (calculé automatiquement par render-aurora-gradient-video.mjs à partir
 *   de `loopDurationMs`) qui règle la VITESSE indépendamment du nombre de frames et du fps.
 *   Doit rester un entier >= 1 pour que le bouclage reste parfait.
 * @param {number} [options.position=30]    0-100, où se centre le rideau le long de l'axe
 *   perpendiculaire (0 = collé au bord de départ, 100 = collé au bord opposé). Combiné à
 *   `direction`, ça permet de décaler l'aurore dans n'importe quelle direction plutôt que
 *   de la laisser figée sur un bord.
 * @param {number} [options.variation=60]   0-100, à quel point l'intensité/la hauteur de
 *   chaque rideau varie d'un endroit à l'autre (0 = uniforme sur toute la largeur, 100 =
 *   zones franchement marquées et zones presque invisibles) — l'effet "par endroits" .
 */
function renderAuroraGradientFrame(ctx, width, height, colors, loopPhase, options = {}) {
  const {
    scale = 50,
    distortion = 50,
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

  // direction est un quart de tour (0/90/180/270°) : dans les 4 cas, la
  // position le long du rideau ("sx") ne dépend jamais que d'UNE seule des
  // deux coordonnées écran — nx pour 0°/180°, ny pour 90°/270°. On en profite
  // pour ne calculer la silhouette de chaque rideau (spine/épaisseur/rayons)
  // qu'une fois par colonne (ou par ligne selon l'orientation), au lieu de
  // le refaire pour chaque pixel : c'est ce qui rend une résolution plus
  // élevée jouable en temps de génération.
  const directionIsQuarterTurn = direction % 2 === 1;
  const staticAxisSize = directionIsQuarterTurn ? height : width; // axe qui porte spine/épaisseur/rayons
  const varyingAxisSize = directionIsQuarterTurn ? width : height; // axe qui porte "sy" (position dans le rideau)

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

      // Enveloppe basse fréquence, différente par rideau (offset k*7.3) :
      // certaines zones de la largeur sont franchement marquées (hautes,
      // lumineuses), d'autres presque absentes — l'effet "la grandeur varie
      // par endroit". `variation=0` désactive l'effet (retombe sur l'ancien
      // comportement uniforme).
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
      // l'enveloppe réduit aussi l'épaisseur (donc la hauteur visuelle du
      // rideau), pas seulement sa luminosité — un rideau "faible" à cet
      // endroit doit avoir l'air plus petit, pas juste plus terne.
      band.thickness[idx] = baseThickness * (0.25 + 0.9 * effectiveEnvelope);

      // Rayons/filaments fins : bruit "en crête" (transitions nettes, pas des
      // bosses arrondies) à haute fréquence + contraste resserré — c'est ce
      // qui donne des stries nettes plutôt qu'un dégradé flou.
      const filamentNoise = ridgedFbm2(
        sx * band.freqMul * 34 + band.loopX * 2.6,
        band.phase * 3.1 + band.loopY * 1.6,
        3
      );
      band.filament[idx] = smoothstep(0.45, 0.55, filamentNoise);
    }

    bands.push(band);
  }

  const imageData = ctx.createImageData(width, height);
  const pixels = imageData.data;

  // Boucle en deux variantes selon l'orientation, pour que l'index "statique"
  // (spine/épaisseur/rayons, constant sur tout un côté) soit bien calculé une
  // seule fois par ligne ou par colonne plutôt que par pixel.
  if (!directionIsQuarterTurn) {
    for (let pixelY = 0; pixelY < height; pixelY++) {
      const normalizedY = (pixelY + 0.5) / height;
      const sy = syLookup[pixelY];

      for (let pixelX = 0; pixelX < width; pixelX++) {
        const staticIdx = pixelX;
        const sxForShimmer = sxLookup[staticIdx];
        writeAuroraPixel(
          pixels, (pixelY * width + pixelX) * 4, bands, staticIdx, sy, sxForShimmer,
          normalizedY, deepRgb, ambientAmount, groundGlowAmount, horizonRgb,
          glowOklab, rimOklab, globalIntensity
        );
      }
    }
  } else {
    for (let pixelY = 0; pixelY < height; pixelY++) {
      const staticIdx = pixelY;
      const sxForShimmer = sxLookup[staticIdx];

      for (let pixelX = 0; pixelX < width; pixelX++) {
        const normalizedY = (pixelY + 0.5) / height; // "bas de cadre" reste l'axe écran réel, pas l'axe tourné
        const sy = syLookup[pixelX];
        writeAuroraPixel(
          pixels, (pixelY * width + pixelX) * 4, bands, staticIdx, sy, sxForShimmer,
          normalizedY, deepRgb, ambientAmount, groundGlowAmount, horizonRgb,
          glowOklab, rimOklab, globalIntensity
        );
      }
    }
  }

  if (stars) paintStars(pixels, width, height, loopPhase, starCount, seed, globalIntensity);

  ctx.putImageData(imageData, 0, 0);
}

/** Calcule et écrit un pixel RGBA — factorisé pour rester identique entre les deux orientations. */
function writeAuroraPixel(
  pixels, pixelIndex, bands, staticIdx, sy, sxForShimmer,
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

    // bord bas net, dégradé vers le haut — silhouette typique d'un rideau d'aurore.
    // Le Math.pow ajoute du contraste sur la silhouette elle-même (pas
    // seulement sur les rayons) : les bords redeviennent nets au lieu de se
    // diluer dans un dégradé.
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

  // léger S-curve sur l'alpha final : renforce le contraste global (zones
  // faibles encore plus discrètes, zones fortes encore plus franches) au
  // lieu d'un dégradé linéaire un peu plat.
  a = smoothstep(0.04, 0.92, Math.min(1, a)) * globalIntensity;
  pixels[pixelIndex] = Math.min(255, r);
  pixels[pixelIndex + 1] = Math.min(255, g);
  pixels[pixelIndex + 2] = Math.min(255, b);
  pixels[pixelIndex + 3] = Math.round(a * 255);
}

/** Semis d'étoiles scintillantes optionnel (désactivé par défaut : la page a déjà un StarField). */
function paintStars(pixels, width, height, loopPhase, count, seed, globalIntensity) {
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
    pixels[idx] = Math.max(pixels[idx], v);
    pixels[idx + 1] = Math.max(pixels[idx + 1], v);
    pixels[idx + 2] = Math.max(pixels[idx + 2], v);
    pixels[idx + 3] = Math.max(pixels[idx + 3], v);
  }
}

// ---------------------------------------------------------------------------
// Public API — même forme que flow-gradient-video.js
// ---------------------------------------------------------------------------

/**
 * Create an aurora gradient bound to a canvas element.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {string[]} colors Hex color stops [rim, glow, horizon, deep].
 * @param {object} [options] See `renderAuroraGradientFrame`.
 * @param {number} [options.loopDurationMs=22500] How long one full loop takes.
 */
function createAuroraGradient(canvas, colors, options = {}) {
  const ctx = canvas.getContext('2d');
  const loopDurationMs = options.loopDurationMs || 22500;

  let animationFrameId = null;
  let loopStartTimestamp = null;

  function draw(loopPhase) {
    renderAuroraGradientFrame(ctx, canvas.width, canvas.height, colors, loopPhase, options);
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

/**
 * Render `frameCount` frames covering one full loop and return them as
 * ready-to-draw ImageBitmaps. Même logique que precomputeFlowGradientFrames :
 * travail étalé sur plusieurs frames pour ne pas geler la page.
 *
 * @param {number} width
 * @param {number} height
 * @param {string[]} colors
 * @param {object} [options] Same options as `renderAuroraGradientFrame`.
 * @param {number} [options.frameCount=90]
 * @param {number} [framesPerBatch=4]
 * @param {(done: number, total: number) => void} [onProgress]
 * @returns {Promise<ImageBitmap[]>}
 */
async function precomputeAuroraGradientFrames(
  width,
  height,
  colors,
  options = {},
  framesPerBatch = 4,
  onProgress
) {
  const frameCount = options.frameCount || 90;

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  const ctx = offscreenCanvas.getContext('2d');

  const frames = [];

  for (let frameIndex = 0; frameIndex < frameCount; frameIndex++) {
    const loopPhase = frameIndex / frameCount; // ne jamais rendre la phase 1 — identique à la phase 0
    renderAuroraGradientFrame(ctx, width, height, colors, loopPhase, options);

    const imageData = ctx.getImageData(0, 0, width, height);
    const bitmap = await createImageBitmap(imageData);
    frames.push(bitmap);

    if (onProgress) onProgress(frameIndex + 1, frameCount);

    if ((frameIndex + 1) % framesPerBatch === 0) {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  }

  return frames;
}

/**
 * Play back a precomputed set of frames on a canvas, looping forever.
 * Identique à createPrecomputedFlowGradientPlayer.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {ImageBitmap[]} frames
 * @param {object} [options]
 * @param {number} [options.loopDurationMs=22500]
 */
function createPrecomputedAuroraGradientPlayer(canvas, frames, options = {}) {
  const ctx = canvas.getContext('2d');
  const loopDurationMs = options.loopDurationMs || 22500;
  const frameCount = frames.length;

  let animationFrameId = null;
  let loopStartTimestamp = null;
  let lastDrawnFrameIndex = -1;

  function drawFrameAtIndex(frameIndex) {
    if (frameIndex === lastDrawnFrameIndex) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(frames[frameIndex], 0, 0, canvas.width, canvas.height);
    lastDrawnFrameIndex = frameIndex;
  }

  function handleAnimationFrame(timestampMs) {
    if (loopStartTimestamp === null) loopStartTimestamp = timestampMs;
    const elapsedMs = (timestampMs - loopStartTimestamp) % loopDurationMs;
    const frameIndex = Math.floor((elapsedMs / loopDurationMs) * frameCount) % frameCount;
    drawFrameAtIndex(frameIndex);
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

  function destroy() {
    pause();
    frames.forEach((bitmap) => bitmap.close());
  }

  return { play, pause, destroy, drawFrameAtIndex };
}

export {
  createAuroraGradient,
  precomputeAuroraGradientFrames,
  createPrecomputedAuroraGradientPlayer,
  renderAuroraGradientFrame,
  resolveAuroraColors,
  AURORA_DEFAULT_COLORS,
  hexToRgb,
  hexToOklab,
  oklabToRgb,
};