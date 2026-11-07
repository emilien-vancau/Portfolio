# Portfolio

Personal portfolio website of **Emilien Vancauwenberghe**, AI & Machine Learning Engineer and amateur astrophotographer.

The site has two universes, switchable from the header:

- **IT** (`/`): professional profile with skills, work experience, education, personal software and AI projects, social links and contact.
- **Astro** (`/astro`): astrophotography portfolio with a night-sky theme, covering handmade acquisition, image processing (interactive before/after comparison), data storytelling, collaboration, observations, a masonry gallery and links to Flickr, Instagram and AstroBin.

## Tech stack

- [Next.js](https://nextjs.org/) 16 (App Router, static export)
- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- ESLint with the Next.js configuration
- Geist font, self-hosted via `next/font/local`

## Features

- Static export (`output: "export"`), deployable to any static host such as GitHub Pages.
- Pre-rendered gradient backgrounds (looping MP4/WebM videos) instead of runtime computation, for smooth performance.
- Animated starfield and aurora layers on the astro page, disabled automatically when `prefers-reduced-motion` is set.
- Custom interactive comparison slider for multi-image processing steps.
- Responsive layouts, keyboard-accessible navigation and `aria` labels on decorative and external elements.
- Content is centralised in a single data file, making updates straightforward.

## Getting started

### Prerequisites

- Node.js 20.9 or later
- npm

### Installation

```bash
git clone https://github.com/emilien-vancau/portfolio.git
cd portfolio
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
```

The static site is generated in the `out/` directory. To preview it locally:

```bash
npm run start
```

### Linting

```bash
npm run lint
```

### Generating gradients

The animated gradients are pre-rendered into files under `public/gradients/`.
Install the project dependencies and make sure `ffmpeg` is available on your
`PATH`. The aurora video renderer requires FFmpeg with the `libvpx-vp9` and
`libx264` encoders. The Northern Lights renderer also requires Playwright's
Chromium browser:

```bash
npm install
npx playwright install chromium
```

Run the relevant command to regenerate an asset:

```bash
# Flow gradient (public/gradients/flow-gradient-loop.mp4)
node scripts/gradients/render-flow-gradient-video.mjs

# Aurora gradient (WebM with transparency and MP4 fallback)
node scripts/gradients/old-render-aurora-gradient-video.mjs

# Northern Lights (public/gradients/northern-lights-loop.mp4)
npm run render:aurora
```

These commands overwrite the corresponding files in `public/gradients/`.

## Customising the content

Most of the text, projects, experience and gallery entries live in `src/lib/data.ts`. Edit that file to update the site without touching the components.

Images and gradient assets are referenced from `src/lib/assets.ts` and stored under `public/`.

## Deployment

The `basePath` is set to `/portfolio` in production (see `next.config.js`). For GitHub Pages, build the project and publish the contents of `out/` to the `gh-pages` branch, or use a GitHub Actions workflow. If you deploy at the domain root, remove or adjust the `basePath` value.

## License

All rights reserved. The code is shared for reference; the photographs, astrophotography images and written content belong to Emilien Vancauwenberghe and may not be reused without permission.

## Contact

- Email: emilien.vancau@gmail.com
- LinkedIn: [emilien-vancauwenberghe](https://www.linkedin.com/in/emilien-vancauwenberghe-ab734b1b9/)
- GitHub: [emilien-vancau](https://github.com/emilien-vancau)
