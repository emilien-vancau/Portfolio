#!/usr/bin/env node
/**
 * render-aurora-gradient.mjs
 * ---------------------------------------------------------------------------
 * Pré-génère le gradient aurore boréale sous forme d'une séquence de frames
 * PNG (canal alpha réel conservé) qui boucle parfaitement, puis — si ffmpeg
 * est disponible sur le PATH — les assemble en un unique WebP animé.
 *
 * C'est la seule étape où le gradient est "calculé" : à l'exécution, le
 * composant React ne fait plus que lire/afficher cet asset déjà généré
 * (voir AuroraGradient.tsx) — aucun calcul temps réel dans le navigateur.
 *
 * Pourquoi un WebP animé et pas un .mp4 (comme le flow gradient) ?
 * Le MP4 n'a pas de canal alpha. Pour laisser voir l'arrière-plan à travers
 * le ciel nocturne (transparent), il faut un format qui supporte la
 * transparence ET l'animation : le WebP animé convient et est bien
 * supporté par les navigateurs actuels. Une séquence PNG reste le format
 * de secours universel si ffmpeg n'est pas installé sur la machine qui
 * build le projet.
 *
 * Dépendances :
 *   npm i canvas        (requis)
 *   ffmpeg sur le PATH  (optionnel, pour l'étape d'encodage finale)
 *
 * Usage :
 *   node render-aurora-gradient.mjs \
 *     --out ./public/gradients/aurora \
 *     --width 480 --height 270 \
 *     --frames 90 --fps 30
 */
import { createCanvas } from 'canvas';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { renderAuroraFrame, AURORA_DEFAULT_PALETTE } from './aurora-gradient.js';

function parseArgs(argv) {
  const args = {
    out: './public/gradients/aurora',
    width: 480,
    height: 270,
    frames: 90,
    fps: 30,
    encode: true,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--width') args.width = Number(argv[++i]);
    else if (a === '--height') args.height = Number(argv[++i]);
    else if (a === '--frames') args.frames = Number(argv[++i]);
    else if (a === '--fps') args.fps = Number(argv[++i]);
    else if (a === '--no-encode') args.encode = false;
  }
  return args;
}

function main() {
  const { out, width, height, frames, fps, encode } = parseArgs(process.argv.slice(2));
  if (!existsSync(out)) mkdirSync(out, { recursive: true });

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  console.log(`Génération de ${frames} frames (${width}x${height}) -> ${out}`);
  for (let i = 0; i < frames; i++) {
    // i/frames revient exactement à 0 à la frame suivante : bouclage garanti
    const t = i / frames;
    ctx.clearRect(0, 0, width, height);
    renderAuroraFrame(ctx, width, height, t, {
      palette: AURORA_DEFAULT_PALETTE,
      bandCount: 3,
      scale: 55,
      fold: 60,
      drift: 45,
      intensity: 1,
      ambient: 0,
      groundGlow: 0.2,
      stars: false,
    });
    const buf = canvas.toBuffer('image/png');
    const filename = path.join(out, `frame-${String(i).padStart(4, '0')}.png`);
    writeFileSync(filename, buf);
  }
  console.log('Séquence de frames terminée.');

  if (encode) {
    const outFile = path.join(out, 'aurora.webp');
    try {
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-framerate', String(fps),
          '-i', path.join(out, 'frame-%04d.png'),
          '-vcodec', 'libwebp',
          '-lossless', '0',
          '-q:v', '80',
          '-loop', '0',
          '-an',
          '-vsync', '0',
          outFile,
        ],
        { stdio: 'inherit' }
      );
      console.log(`WebP animé écrit : ${outFile}`);
    } catch (err) {
      console.warn('ffmpeg introuvable ou a échoué — la séquence PNG reste disponible.');
      console.warn('Encodage manuel possible ensuite, par exemple :');
      console.warn(
        `  ffmpeg -framerate ${fps} -i ${out}/frame-%04d.png -vcodec libwebp -lossless 0 -q:v 80 -loop 0 -an -vsync 0 ${outFile}`
      );
    }
  }
}

main();
