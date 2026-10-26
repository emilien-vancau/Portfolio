/**
 * aurora-gradient.js
 * ---------------------------------------------------------------------------
 * Générateur PROCÉDURAL du gradient "aurore boréale", volontairement isolé
 * du flow gradient existant (aucune fonction, aucune constante partagée —
 * quitte à dupliquer des utilitaires similaires comme le bruit de Perlin).
 *
 * Pensé pour de la GÉNÉRATION (pré-rendu hors-ligne), pas du calcul temps
 * réel : `renderAuroraFrame` est une fonction pure qui dessine une frame sur
 * un CanvasRenderingContext2D standard. Elle fonctionne aussi bien :
 *   - dans le navigateur (un <canvas> classique), pour prévisualiser,
 *   - que dans Node via le package `canvas` (voir render-aurora-gradient.mjs),
 *     qui est l'usage prévu en production.
 *
 * Boucle parfaite (seamless loop) :
 * Le paramètre `tNormalized` doit varier dans [0, 1[. En interne, le temps
 * n'est jamais utilisé comme un décalage linéaire (ce qui empêcherait un
 * bouclage propre) : on le convertit en un point qui parcourt un cercle
 * dans l'espace du bruit (`loopOffset`). Comme cos/sin sont périodiques,
 * l'image à t=0 et t→1 est rigoureusement identique : la vidéo/animation
 * pré-générée boucle sans à-coup.
 *
 * Transparence ("voir l'arrière-plan") :
 * Chaque pixel a un canal alpha réel calculé à partir de l'intensité
 * lumineuse locale : le ciel nocturne n'est PAS peint en dur, seuls les
 * rideaux de lumière (et, en option, un léger glow d'horizon) sont opaques.
 * Le paramètre `intensity` multiplie globalement cet alpha — c'est le
 * réglage "opacité" que l'on peut aussi ré-exposer côté composant React.
 */

// ---------------------------------------------------------------------------
// Palette par défaut (4 rôles : rim = bord lumineux, glow = corps du rideau,
// horizon = teinte basse/froide, deep = ambiance très discrète en option)
// ---------------------------------------------------------------------------
export const AURORA_DEFAULT_PALETTE = {
  rim: '#EAFFF4',
  glow: '#4BE8A0',
  horizon: '#2E6E80',
  deep: '#16224D',
};

// ---------------------------------------------------------------------------
// Bruit (implémentation propre, indépendante de celle du flow gradient)
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

const ROT_COS = Math.cos(0.5);
const ROT_SIN = Math.sin(0.5);

function fbm2(x, y, octaves = 4) {
  let value = 0;
  let amp = 0.5;
  let cx = x;
  let cy = y;
  for (let i = 0; i < octaves; i++) {
    value += amp * valueNoise2D(cx, cy);
    const rx = cx * ROT_COS - cy * ROT_SIN;
    const ry = cx * ROT_SIN + cy * ROT_COS;
    cx = rx * 2 + 100;
    cy = ry * 2 + 100;
    amp *= 0.5;
  }
  return value;
}

/** Point qui parcourt un cercle de rayon `radius` — garantit le bouclage. */
function loopOffset(tNormalized, radius) {
  const angle = tNormalized * Math.PI * 2;
  return [Math.cos(angle) * radius, Math.sin(angle) * radius];
}

// ---------------------------------------------------------------------------
// Couleur
// ---------------------------------------------------------------------------
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// Rendu d'une frame
// ---------------------------------------------------------------------------

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} tNormalized  progression dans [0, 1[ (boucle à 1)
 * @param {object} [options]
 * @param {{rim:string,glow:string,horizon:string,deep:string}} [options.palette]
 * @param {number} [options.bandCount=3]   nombre de rideaux de lumière
 * @param {number} [options.scale=50]      0-100, fréquence spatiale ("Scale")
 * @param {number} [options.fold=50]       0-100, ondulation des rideaux ("Fold")
 * @param {number} [options.drift=50]      0-100, dérive horizontale ("Drift")
 * @param {number} [options.direction=0]   0-3, quarts de tour
 * @param {number} [options.intensity=1]   0-1, opacité globale (voir l'arrière-plan)
 * @param {number} [options.ambient=0]     0-1, léger voile "deep" uniforme (0 = totalement transparent hors rideaux)
 * @param {number} [options.groundGlow=0.2] 0-1, lueur d'horizon en bas de cadre
 * @param {boolean} [options.stars=false]  ajoute un semis d'étoiles scintillantes
 * @param {number} [options.starCount=60]
 * @param {number} [options.seed=0]
 */
export function renderAuroraFrame(ctx, width, height, tNormalized, options = {}) {
  const {
    palette = AURORA_DEFAULT_PALETTE,
    bandCount = 3,
    scale = 50,
    fold = 50,
    drift = 50,
    direction = 0,
    intensity = 1,
    ambient = 0,
    groundGlow = 0.2,
    stars = false,
    starCount = 60,
    seed = 0,
  } = options;

  const rim = hexToRgb(palette.rim);
  const glow = hexToRgb(palette.glow);
  const horizon = hexToRgb(palette.horizon);
  const deep = hexToRgb(palette.deep);

  const freq = 1 + (1 - scale / 100) * 2.8;
  const foldN = fold / 100;
  const driftN = 0.15 + (drift / 100) * 1.1;
  const angle = (direction % 4) * (Math.PI / 2);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const image = ctx.createImageData(width, height);
  const data = image.data;

  // Un décalage de bruit différent par rideau, mais chacun boucle parfaitement.
  const bands = [];
  for (let k = 0; k < bandCount; k++) {
    const [loopX, loopY] = loopOffset(tNormalized, driftN * 6 + k * 1.7);
    bands.push({
      centerY: 0.14 + (k / Math.max(1, bandCount - 1)) * 0.34 + seed * 0.001,
      freqMul: freq * (1 + k * 0.18),
      loopX,
      loopY,
      phase: k * 12.9,
    });
  }

  for (let y = 0; y < height; y++) {
    const ny = y / height;
    for (let x = 0; x < width; x++) {
      const nx = x / width;

      // rotation d'échantillonnage pour le paramètre `direction`
      const sx = (nx - 0.5) * cosA - (ny - 0.5) * sinA + 0.5;
      const sy = (nx - 0.5) * sinA + (ny - 0.5) * cosA + 0.5;

      let r = deep[0] * ambient;
      let g = deep[1] * ambient;
      let b = deep[2] * ambient;
      let a = ambient;

      for (const band of bands) {
        const warp = fbm2(sx * band.freqMul * 2 + band.loopX, band.phase + band.loopY, 3);
        const spineY = band.centerY + (warp - 0.5) * 0.5 * (0.4 + foldN);
        const thickness =
          0.05 + foldN * 0.09 + fbm2(sx * band.freqMul * 3 + 5.2, band.loopX * 0.7, 2) * 0.03;
        const d = (sy - spineY) / Math.max(0.001, thickness);
        if (d < -1.4 || d > 3.2) continue;

        // bord bas net, dégradé vers le haut (silhouette typique d'un rideau d'aurore)
        const spread = d < 0 ? 0.32 : 0.75 + foldN * 0.4;
        const shape = Math.exp(-(d * d) / (2 * spread * spread));

        const shimmer =
          0.65 + 0.35 * fbm2(sx * band.freqMul * 6 + band.loopX * 1.4, sy * 8 + band.phase, 3);
        const w = shape * shimmer;
        if (w <= 0.002) continue;

        const edge = Math.max(0, 1 - Math.abs(d) * 1.4);
        r += mix(glow[0], rim[0], edge) * w;
        g += mix(glow[1], rim[1], edge) * w;
        b += mix(glow[2], rim[2], edge) * w;
        a += w;
      }

      // lueur d'horizon discrète, en bas de cadre uniquement
      if (groundGlow > 0) {
        const groundT = Math.max(0, (ny - 0.72) / 0.28);
        if (groundT > 0) {
          const gw = groundT * groundT * groundGlow * 0.5;
          r += horizon[0] * gw;
          g += horizon[1] * gw;
          b += horizon[2] * gw;
          a += gw;
        }
      }

      a = Math.min(1, a) * intensity;
      const i = (y * width + x) * 4;
      data[i] = Math.min(255, r);
      data[i + 1] = Math.min(255, g);
      data[i + 2] = Math.min(255, b);
      data[i + 3] = Math.round(a * 255);
    }
  }

  if (stars) paintStars(data, width, height, tNormalized, starCount, seed, intensity);

  ctx.putImageData(image, 0, 0);
}

/** Semis d'étoiles scintillantes optionnel (désactivé par défaut : le Hero a déjà StarField). */
function paintStars(data, width, height, tNormalized, count, seed, intensity) {
  for (let i = 0; i < count; i++) {
    const hx = hash21(i * 12.9898 + seed, 3.7);
    const hy = hash21(i * 78.233 + seed, 9.1);
    const x = Math.floor(hx * width);
    const y = Math.floor(hy * height * 0.7); // les étoiles restent dans le haut du ciel
    const twinkle = 0.5 + 0.5 * Math.sin(tNormalized * Math.PI * 2 + i * 12.9);
    const alpha = Math.max(0, twinkle - 0.4) * 1.6 * intensity;
    if (alpha <= 0) continue;
    const idx = (y * width + x) * 4;
    const v = 255 * Math.min(1, alpha);
    data[idx] = Math.max(data[idx], v);
    data[idx + 1] = Math.max(data[idx + 1], v);
    data[idx + 2] = Math.max(data[idx + 2], v);
    data[idx + 3] = Math.max(data[idx + 3], v);
  }
}