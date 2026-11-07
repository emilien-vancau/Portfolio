// scripts/gradients/render-northern-lights-video.mjs
import { chromium } from "playwright";
import { build } from "esbuild";
import { spawn } from "node:child_process";
import { once } from "node:events";

const W = 1620, H = 800, FPS = 35;
const LOOP_S = 30; // durée de la boucle
const FADE_S = 10;  // durée du fondu de raccord
const OUT = "public/gradients/northern-lights-loop.mp4";

// Copie de la constante `ee` de NorthernLights.jsx (non exportée)
const recipe = {
  type: "AURORA", speed: 26, startT: 34.90208959999887,
  stops: ["#EAFFF4", "#4BE8A0", "#2E6E80", "#16224D"],
  divs: [0.25, 0.5, 0.75], mesh: null,
  params: { scale: 65, distortion: 65, swirl: 46, dir: 0 },
  size: 50, hexStyle: "hive", ballStyle: "convex", glintHorizon: 0.44,
  city: null, pixelStyle: "quilt", cover: 50, rings: 12, weave: 20,
  cube: null, shapeForm: null, shapeSoften: 0, mist: null, lines: [],
  tile: "square", warp: 0, refract: 50,
};

const RATE = (recipe.speed / 100) * 1.2; // unités de t / seconde (comme le composant)
const L = LOOP_S * FPS, C = FADE_S * FPS;
const tAt = (i) => recipe.startT + (i * RATE) / FPS;
const smooth = (x) => x * x * (3 - 2 * x);

// 1. On bundle le composant pour le navigateur
const { outputFiles } = await build({
  stdin: {
    contents: `import { paintRecipe } from "./src/components/NorthernLights.jsx";
               window.paintRecipe = paintRecipe;`,
    resolveDir: process.cwd(),
  },
  bundle: true, format: "iife", write: false,
  define: { "process.env.NODE_ENV": '"production"' },
});

// 2. Chromium headless (WebGL logiciel : lent mais déterministe)
const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage();
await page.setContent("<body></body>");
await page.addScriptTag({ content: outputFiles[0].text });
await page.evaluate(({ recipe, W, H }) => {
  const mk = () => Object.assign(document.createElement("canvas"), { width: W, height: H });
  const a = mk(), b = mk(), out = mk();
  const ctx = out.getContext("2d");
  window.renderFrame = (t0, t1, w) => {
    window.paintRecipe(a, recipe, t0);
    ctx.globalAlpha = 1;
    ctx.drawImage(a, 0, 0);
    if (t1 !== null && w > 0) {
      window.paintRecipe(b, recipe, t1);
      ctx.globalAlpha = w;
      ctx.drawImage(b, 0, 0);
    }
    return out.toDataURL("image/png");
  };
}, { recipe, W, H });

// 3. ffmpeg reçoit les PNG sur stdin
const ff = spawn("ffmpeg", [
  "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-profile:v", "main", "-pix_fmt", "yuv420p",
  "-crf", "24", "-preset", "slow", "-movflags", "+faststart", "-an", OUT,
], { stdio: ["pipe", "inherit", "inherit"] });

const F0 = L - C; // index de la première image du fondu

for (let i = 0; i < L; i++) {
  const fading = i >= F0;
  // fin de boucle : on fond de t_i vers t_{i-L} (le temps juste avant le début),
  // pour que la dernière image soit continue avec la toute première.
  const dataUrl = await page.evaluate(
    ([a, b, w]) => window.renderFrame(a, b, w),
    fading
      ? [tAt(i), tAt(i - L), smooth((i - F0 + 1) / C)]
      : [tAt(i), null, 0],
  );
  const buf = Buffer.from(dataUrl.split(",")[1], "base64");
  if (!ff.stdin.write(buf)) await once(ff.stdin, "drain");
  if (i % 24 === 0) console.log(`${i}/${L}`);
}
ff.stdin.end();
await once(ff, "close");
await browser.close();