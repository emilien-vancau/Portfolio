import Link from "next/link";
import Eyebrow from "@/components/Eyebrow";
import Tag from "@/components/Tag";
import ProjectCard from "@/components/ProjectCard";
import FlowGradientVideo from "@/components/FlowGradientVideo";
import { identity, skills, workExperiences, proProjects, education } from "@/lib/data";

export default function ProHome() {
  
  const visibleWorkExperiences = workExperiences.filter((item) => item.isDisplay);
  const visibleEducation = education.filter((item) => item.isDisplay);
  const visibleProjects = proProjects.filter((project) => project.isDisplay);

  return (
    <div className="theme-pro">
      {/* ---------------------------------------------------------- HERO */}
      <section className="gradient-denchou mx-auto min-h-[calc(85vh-4rem)] flex flex-col justify-evenly gap-9 px-[20rem] pb-5 pt-5">
        <FlowGradientVideo />
        <div className="flex flex-col gap-15"> 
          <div className="flex flex-col gap-2">
            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-[#152451] md:text-6xl">
              {identity.lastName} {identity.firstName}
            </h1>
            <h2 className="text-xl font-semibold text-[#152451]">
              {identity.proTitle}
            </h2>
          </div>
          
          <p className="max-w-xl text-lg leading-relaxed text-[#364165]">
            {identity.proTagline}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#projets"
              className="rounded-full bg-[#152451] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#2d3085]"
            >
              View my projects
            </a>
            <a
              href="#contact"
              className="rounded-full border border-[#c9d2e0] bg-white px-6 py-3 text-sm font-medium text-[#152451] transition-colors hover:border-[#2d3085]"
            >
              Contact me
            </a>
            <Link
              href="/astro"
              className="ml-auto text-sm text-[#2d3085] underline decoration-[#a7e0e7] decoration-2 underline-offset-4 hover:text-[#152451]"
            >
              ✦ Follow my exploration of the heavens
            </Link>
          </div>

        </div>
        
      </section>

      {/* ------------------------------------------------------- SKILLS */}
      <section className="border-y border-[#c9d2e0] bg-white/60 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-2xl font-semibold text-[#152451] md:text-3xl">
            Computing skills
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((group) => (
              <div key={group.category}>
                <p className="meta-label mb-3 text-[#2d3085]">{group.category}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Tag key={item}>{item}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- EXPERIENCE */}
      <section id="experience" className="scroll-mt-24 px-6 pt-20">
        <div className="mx-auto max-w-6xl">
          
          <h2 className="mb-12 text-2xl font-semibold text-[#152451] md:text-3xl">
            Work experience
          </h2>
          <ol className="relative border-l border-[#c9d2e0] pl-8">
            {visibleWorkExperiences.map((item) => (
              <li key={item.role + item.period} className="mb-12 last:mb-0">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#2d3085]" />
                <p className="meta-label mb-2 text-[#4a5578]">{item.period}</p>
                <h3 className="text-lg font-semibold text-[#152451]">
                  {item.role}
                  <span className="font-normal text-[#4a5578]"> — {item.place}</span>
                </h3>
                <ul className="mt-2 max-w-2xl list-disc space-y-1 pl-5 text-sm leading-relaxed text-[#4a5578]">
                  {item.description.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {item.toolsTechnologies.length > 0 && (
                  <div className="mt-4 max-w-2xl">
                    <p className="meta-label mb-2 text-[#2d3085]">Tools &amp; technologies</p>
                    <div className="flex flex-wrap gap-2">
                      {item.toolsTechnologies.map((technology) => (
                        <Tag key={technology} backgroundColor="#ebf0f0">
                          {technology}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------- EDUCATION */}
      <section id="education" className="scroll-mt-24 px-6 pt-20 pb-20">
        <div className="mx-auto max-w-6xl">
          
          <h2 className="mb-12 text-2xl font-semibold text-[#152451] md:text-3xl">
            Education
          </h2>
          <ol className="relative border-l border-[#c9d2e0] pl-8">
            {visibleEducation.map((item) => (
              <li key={item.degree + item.period} className="mb-12 last:mb-0">
                <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#2d3085]" />
                <p className="meta-label mb-2 text-[#4a5578]">{item.period}</p>
                <h3 className="text-lg font-semibold text-[#152451]">
                  {item.degree}
                  <span className="font-normal text-[#4a5578]"> — {item.institution}</span>
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4a5578]">
                  {item.specialization}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------ PROJETS */}
      <section
        id="projets"
        className="scroll-mt-24 border-t border-[#c9d2e0] bg-white/60 px-6 py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold text-[#152451] md:text-3xl">
              My personal projects
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {visibleProjects.map((project) => (
              <ProjectCard key={project.title} variant="pro" {...project} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ SOCIALS */}
      <section
        id="socials"
        className="scroll-mt-24 border-t border-[#c9d2e0] px-6 py-16"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-8 text-2xl font-semibold text-[#152451] md:text-3xl">
            Find me online
          </h2>
          <div className="flex flex-wrap gap-4">
            <a
              href="https://github.com/AlbireoDSE"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my GitHub profile (opens in a new tab)"
              className="group flex min-w-52 items-center gap-4 rounded-2xl border border-[#c9d2e0] bg-white px-6 py-5 text-[#152451] shadow-sm transition-all hover:-translate-y-1 hover:border-[#2d3085] hover:shadow-md"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 shrink-0">
                <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 1.71 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.51 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.15a10.6 10.6 0 0 1 5.57 0c2.12-1.45 3.06-1.15 3.06-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.28-2.61 5.22-5.1 5.5.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
              </svg>
              <span className="font-medium transition-colors group-hover:text-[#2d3085]">GitHub</span>
              <span aria-hidden="true" className="ml-auto text-[#4a5578] transition-transform group-hover:translate-x-1">↗</span>
            </a>
            <a
              href="https://www.linkedin.com/in/emilien-vancauwenberghe-ab734b1b9/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my LinkedIn profile (opens in a new tab)"
              className="group flex min-w-52 items-center gap-4 rounded-2xl border border-[#c9d2e0] bg-white px-6 py-5 text-[#152451] shadow-sm transition-all hover:-translate-y-1 hover:border-[#2d3085] hover:shadow-md"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 shrink-0">
                <path d="M5.2 3.5a1.9 1.9 0 1 1 0 3.8 1.9 1.9 0 0 1 0-3.8ZM3.6 9h3.2v11.4H3.6V9Zm5.2 0h3.1v1.6h.05A3.4 3.4 0 0 1 15 8.7c3.3 0 3.9 2.2 3.9 5v6.7h-3.2v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v6H8.8V9Z" />
              </svg>
              <span className="font-medium transition-colors group-hover:text-[#2d3085]">LinkedIn</span>
              <span aria-hidden="true" className="ml-auto text-[#4a5578] transition-transform group-hover:translate-x-1">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ CONTACT */}
      <section id="contact" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl bg-[#152451] px-8 py-14 md:px-14"
          style={{
            backgroundImage: "url('/svgs/silk-card.svg#svgView(preserveAspectRatio(none))')",
            backgroundSize: "100% 100%",
          }}
          >
          <h2 className="max-w-lg text-2xl font-semibold text-white md:text-3xl">
            Reach out to me:
          </h2>
          <a
            href={`mailto:${identity.email}`}
            className="rounded-full bg-[#a7e0e7] px-6 py-3 text-sm font-medium text-[#152451] transition-colors hover:bg-white"
          >
            {identity.email}
          </a>
        </div>
      </section>
    </div>
  );
}
