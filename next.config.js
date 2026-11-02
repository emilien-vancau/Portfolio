const basePath = process.env.NODE_ENV === "production" ? "/portfolio" : "";

/** @type {import('next').NextConfig} */

module.exports = {
  output: "export",          // create folder /out
  trailingSlash: true,       // /astro/ → astro/index.html, more viable for static hosting
  images: { unoptimized: true }, 
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
