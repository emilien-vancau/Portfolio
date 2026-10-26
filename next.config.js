/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

module.exports = {
  output: "export",          // create folder /out
  trailingSlash: true,       // /astro/ → astro/index.html, plus fiable sur Pages
  images: { unoptimized: true }, // l'optimiseur next/image n'existe pas en statique
  basePath,
  assetPrefix: basePath || undefined,
};
