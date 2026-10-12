import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import StarField from "@/components/StarField";
import NorthernLightsLayer from "@/components/NorthernLightsLayer";
import MultiImageComparison from "@/components/MultiImageComparison";
import MasonryGallery from "@/components/MasonryGallery";
import {
  identity,
  astroProjects,
  equipment,
  astroComparisonImages,
  astroTexts,
  astroGallery,
} from "@/lib/data";

export default function AstroHome() {
  const visibleProjects = astroProjects.filter((project) => project.isDisplay);

  return (
    <div className="theme-astro bg-[#0a1230]">
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative mx-auto flex min-h-[calc(80vh-4rem)] flex-col justify-evenly overflow-hidden pb-24 pt-10 md:pt-15">
        <NorthernLightsLayer />
        <StarField count={130} className="z-10" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,_rgba(45,48,133,0.35),_transparent_60%)]"
        />
        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-8 px-6">
          <h1
            className="max-w-3xl text-4xl italic tracking-wide leading-[1.15] tracking-tight text-[#e5ebeb] md:text-6xl"
            style={{ fontFamily: "var(--font-display-astro)" }}>

            Deep Sky Encounter
          </h1>
          <h2 className="max-w-3xl text-lg leading-relaxed text-[#C2CEE1] md:text-xl">
            By {identity.firstName} {identity.lastName} — amateur astronomer, astrophotographer, and telescope maker.
          </h2>
          <p className="max-w-xl text-lg leading-relaxed text-[#C2CEE1]">
            {identity.astroTagline}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#observations"
              className="rounded-full bg-[#a7e0e7] px-6 py-3 text-sm font-medium text-[#0a1230] transition-colors hover:bg-white"
            >
              View my observations and projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-[#26315f] px-6 py-3 text-sm font-medium text-[#e5ebeb] transition-colors hover:border-[#a7e0e7]"
            >
              Contact me
            </a>
            <Link
              href="/"
              className="ml-auto text-sm text-[#a7e0e7] underline decoration-[#2d3085] decoration-2 underline-offset-4 hover:text-white"
            >
              {"</>"} See also My IT World
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- ABOUT */}
      <section className="relative isolate overflow-hidden border-y border-[#26315f] bg-[#101b3f] px-6 py-16">
        <StarField count={300} className="z-0" />
        <div className="relative z-10 mx-auto mt-10 max-w-7xl space-y-20">
          <article id="gear" className="scroll-mt-24 box-shadow-br grid gap-8 bg-[#1B275E] border-l-4 rounded-tr-lg rounded-br-lg border-[#a7e0e7] p-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start"
          style={{
              backgroundImage: "url('/svgs/edge-card.svg#svgView(preserveAspectRatio(none))')",
              backgroundSize: "100% 100%",
            }}
          >
            <div>
              <h2
                className="mb-6 text-2xl italic text-[#e5ebeb] md:text-3xl underline decoration-[#a7e0e7] decoration-2 underline-offset-4"
                style={{ fontFamily: "var(--font-display-astro)" }}
              >
                {astroTexts.acquisition.title}
              </h2>
              <p className="mb-6 text-lg leading-relaxed text-[#9fb0d6]">
                {astroTexts.acquisition.description}
              </p>
              <p className="text-lg leading-relaxed text-[#9fb0d6]">
                {astroTexts.acquisition.maintenance}
              </p>
            </div>
            <div className="md:mt-[3.75rem] md:w-full md:max-w-xl md:justify-self-end">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <img
                className="h-auto w-full rounded-lg object-cover"
                src="/imgs/setup.jpg"
                alt="setup1"
              />
              <div className="grid gap-px overflow-hidden rounded-2xl border border-[#26315f] bg-[#26315f]">
                {equipment.map((item) => (
                  <div key={item.name} className="bg-[#0a1230] p-6">
                    <p className="meta-label mb-2 text-[#a7e0e7]">{item.name}</p>
                    <p className="text-sm text-[#c3cde8]">{item.note}</p>
                  </div>
                ))}
              </div>
              </div>
            </div>
          </article>

          <article className="box-shadow-bl bg-[#1B275E] border-r-4 rounded-tl-lg rounded-bl-lg border-[#a7e0e7] p-6">
            <h2
              className="mb-6 text-2xl italic text-[#e5ebeb] md:text-3xl underline decoration-[#a7e0e7] decoration-2 underline-offset-4"
              style={{ fontFamily: "var(--font-display-astro)" }}
            >
              {astroTexts.processing.title}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-[#9fb0d6]">
              {astroTexts.processing.description}
            </p>
            <div className="box-shadow mb-6">
              <MultiImageComparison className="h-auto w-full rounded-lg object-cover" images={astroComparisonImages} />
            </div>
          </article>

          <article className="box-shadow-br relative isolate space-y-8 overflow-hidden bg-[#1B275E] border-l-4 rounded-tr-lg rounded-br-lg border-[#a7e0e7] p-6"
          >
            <img
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-1/2 z-0 h-full w-auto max-w-none -translate-x-1/2 opacity-20"
              src="/imgs/planisphere.png"
              alt=""
            />
            <div className="relative z-10 space-y-8">
              <div className="grid gap-x-8 gap-y-0 md:grid-cols-2">
                <h2
                  className="mb-6 text-2xl italic text-[#e5ebeb] md:text-3xl underline decoration-[#a7e0e7] decoration-2 underline-offset-4"
                  style={{ fontFamily: "var(--font-display-astro)" }}
                >
                  {astroTexts.dataStorytelling.title}
                </h2>
                <p className="mb-8 text-lg leading-relaxed text-[#9fb0d6] md:col-start-1 md:row-start-2">
                  {astroTexts.dataStorytelling.description1}
                </p>
                <img
                  className="h-auto w-full rounded-lg object-cover md:col-start-2 md:row-start-2"
                  src="/imgs/NGC2903_RGB_Annotated.jpg"
                  alt="NGC2903 RGB Annotated"
                />
              </div>
              <div className="grid gap-8 md:grid-cols-2 md:items-center">
                <img
                  className="h-auto w-full rounded-lg object-cover"
                  src="/imgs/NGC5353_astromapper.png"
                  alt="NGC5353 Astromapper"
                />
                <p className="text-lg leading-relaxed text-[#9fb0d6]">
                  {astroTexts.dataStorytelling.description2}
                </p>
              </div>
            </div>
          </article>

          <article className="box-shadow-bl bg-[#1B275E] border-r-4 rounded-tl-lg rounded-bl-lg border-[#a7e0e7] p-6">
            <h2
              className="mb-6 text-2xl italic text-[#e5ebeb] md:text-3xl underline decoration-[#a7e0e7] decoration-2 underline-offset-4"
              style={{ fontFamily: "var(--font-display-astro)" }}
            >
              {astroTexts.collaboration.title}
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-[#9fb0d6]">
              {astroTexts.collaboration.description}
            </p>
          </article>
        </div>
      </section>

      {/* ------------------------------------------------- OBSERVATIONS/PROJECTS/GALLERY */}
      <section id="observations" className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2
              className="text-2xl italic text-[#e5ebeb] md:text-3xl"
              style={{ fontFamily: "var(--font-display-astro)" }}
            >
              Observations &amp; projects
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.title} variant="astro" {...project} />
            ))}
          </div>
        </div>
      </section>
      
      <section
        id="gallery"
        className="scroll-mt-24 border-t border-[#26315f] px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            className="mb-10 text-2xl italic text-[#e5ebeb] md:text-3xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            Gallery
          </h2>
          <MasonryGallery images={astroGallery} />
        </div>
      </section>

      {/* ---------------------------------------------------- SOCIALS */}
      <section
        id="socials"
        className="scroll-mt-24 border-t border-[#26315f] bg-[#101b3f] px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <h2
            className="mb-10 text-2xl italic text-[#e5ebeb] md:text-3xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            Looking for more ?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <a
              href="https://www.flickr.com/people/154121771@N02/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my Flickr profile (opens in a new tab)"
              className="group flex items-center gap-4 rounded-xl border border-[#26315f] bg-[#0a1230] p-5 text-[#e5ebeb] transition-colors hover:border-[#a7e0e7] hover:bg-[#1B275E]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-8 w-8 shrink-0">
                <circle cx="7" cy="12" r="5" fill="#0063dc" />
                <circle cx="17" cy="12" r="5" fill="#ff0084" />
              </svg>
              <span className="font-medium group-hover:text-[#a7e0e7]">Flickr</span>
            </a>
            <a
              href="https://www.instagram.com/deepskyencounter/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my Instagram profile (opens in a new tab)"
              className="group flex items-center gap-4 rounded-xl border border-[#26315f] bg-[#0a1230] p-5 text-[#e5ebeb] transition-colors hover:border-[#a7e0e7] hover:bg-[#1B275E]"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-8 w-8 shrink-0 stroke-current" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              <span className="font-medium group-hover:text-[#a7e0e7]">Instagram</span>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ CONTACT */}
      <section id="contact" className="relative scroll-mt-24 overflow-hidden px-6 py-24">
        
        <div
          className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 rounded-xl bg-[#1B275E] bg-center p-16"
          style={{
            backgroundImage: "url('/svgs/edge-card.svg#svgView(preserveAspectRatio(none))')",
            backgroundSize: "100% 100%",
          }}
        >
          <h2
            className="max-w-lg text-2xl italic text-[#e5ebeb] md:text-3xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            Reach out to me:
          </h2>
          <a
            href={`mailto:${identity.email}`}
            className="rounded-full bg-[#a7e0e7] px-6 py-3 text-sm font-medium text-[#0a1230] transition-colors hover:bg-white"
          >
            {identity.email}
          </a>
        </div>
      </section>
    </div>
  );
}
