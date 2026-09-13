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
            <h1 className="hero-pro-text max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight text-[#152451] md:text-6xl">
              {identity.lastName} {identity.firstName}
            </h1>
            <h2 className="hero-pro-text text-xl font-semibold text-[#152451]">
              {identity.proTitle}
            </h2>
          </div>
          
          <p className="hero-pro-text max-w-xl text-lg leading-relaxed text-[#4a5578]">
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
              className="hero-pro-text ml-auto text-sm text-[#2d3085] underline decoration-[#a7e0e7] decoration-2 underline-offset-4 hover:text-[#152451]"
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
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4a5578]">
                  {item.description}
                </p>
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

      {/* ------------------------------------------------------ CONTACT */}
      <section id="contact" className="scroll-mt-24 px-6 py-24">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 rounded-3xl bg-[#152451] px-8 py-14 md:px-14">
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
