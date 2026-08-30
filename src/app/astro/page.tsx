import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import ProjectCard from "@/components/ProjectCard";
import StarField from "@/components/StarField";
import { identity, astroProjects, equipment } from "@/lib/data";

export default function AstroHome() {
  const visibleProjects = astroProjects.filter((project) => project.isDisplay);

  return (
    <div className="theme-astro bg-[#0a1230]">
      {/* ---------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden px-6 pb-24 pt-16 md:pt-24">
        <StarField count={130} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top,_rgba(45,48,133,0.35),_transparent_60%)]"
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-8">
          <Eyebrow variant="astro">~/ciel</Eyebrow>
          <h1
            className="max-w-3xl text-4xl italic leading-[1.15] tracking-tight text-[#e5ebeb] md:text-6xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            Le ciel, observé depuis {identity.location}.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[#9fb0d6]">
            {identity.astroTagline}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#observations"
              className="rounded-full bg-[#a7e0e7] px-6 py-3 text-sm font-medium text-[#0a1230] transition-colors hover:bg-white"
            >
              Voir mes observations
            </a>
            <a
              href="#contact"
              className="rounded-full border border-[#26315f] px-6 py-3 text-sm font-medium text-[#e5ebeb] transition-colors hover:border-[#a7e0e7]"
            >
              Me contacter
            </a>
            <Link
              href="/"
              className="ml-auto text-sm text-[#a7e0e7] underline decoration-[#2d3085] decoration-2 underline-offset-4 hover:text-white"
            >
              {"</>"} Voir aussi mon univers informatique
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- ABOUT */}
      <section className="border-y border-[#26315f] bg-[#101b3f] px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-xl italic leading-relaxed text-[#e5ebeb] md:text-2xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            « Chaque session d&apos;observation commence pareil : une carte du
            ciel, un thermos de café, et la patience d&apos;attendre que les
            yeux s&apos;habituent à la nuit. »
          </p>
        </div>
      </section>

      {/* ------------------------------------------------- OBSERVATIONS */}
      <section id="observations" className="scroll-mt-24 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <Eyebrow variant="astro">~/observations</Eyebrow>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2
              className="text-2xl italic text-[#e5ebeb] md:text-3xl"
              style={{ fontFamily: "var(--font-display-astro)" }}
            >
              Observations &amp; projets
            </h2>
            <p className="max-w-md text-sm text-[#9fb0d6]">
              Les projets marqués <span className="text-[#a7e0e7]">« réel »</span>{" "}
              attendent tes vraies infos et photos — envoie-les-moi.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.title} variant="astro" {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- MATERIEL */}
      <section
        id="materiel"
        className="scroll-mt-24 border-t border-[#26315f] bg-[#101b3f] px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <Eyebrow variant="astro">~/materiel</Eyebrow>
          <h2
            className="mb-10 text-2xl italic text-[#e5ebeb] md:text-3xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            Le setup
          </h2>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-[#26315f] bg-[#26315f] sm:grid-cols-2 lg:grid-cols-4">
            {equipment.map((item) => (
              <div key={item.name} className="bg-[#0a1230] p-6">
                <p className="meta-label mb-2 text-[#a7e0e7]">{item.name}</p>
                <p className="text-sm text-[#c3cde8]">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ CONTACT */}
      <section id="contact" className="relative scroll-mt-24 overflow-hidden px-6 py-24">
        <StarField count={60} />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6">
          <Eyebrow variant="astro">~/contact</Eyebrow>
          <h2
            className="max-w-lg text-2xl italic text-[#e5ebeb] md:text-3xl"
            style={{ fontFamily: "var(--font-display-astro)" }}
          >
            Une session d&apos;observation à partager, une question de matériel ?
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
