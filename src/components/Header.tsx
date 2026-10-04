"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS_PRO = [
  { href: "/#experience", label: "Background" },
  { href: "/#projets", label: "Personal projects" },
  { href: "/#contact", label: "Contact" },
];

const NAV_LINKS_ASTRO = [
  { href: "/astro#observations", label: "Observations" },
  { href: "/astro#materiel", label: "Gear" },
  { href: "/astro#contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const isAstro = pathname?.startsWith("/astro");
  const links = isAstro ? NAV_LINKS_ASTRO : NAV_LINKS_PRO;

  return (
    <header
      className={
        "sticky top-0 z-50 border-b backdrop-blur transition-colors " +
        (isAstro
          ? "bg-[#0a1230]/85 border-[#26315f]"
          : "bg-[#e5ebeb]/90 border-[#c9d2e0]")
      }
    >
      <div
        className={
          "mx-auto flex items-center justify-between gap-6 py-4 " +
          (isAstro ? "max-w-7xl px-6" : "w-full px-[20rem]")
        }
      >
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                "text-sm transition-opacity hover:opacity-100 " +
                (isAstro
                  ? "text-[#9fb0d6] opacity-90 hover:text-[#a7e0e7]"
                  : "text-[#4a5578] opacity-90 hover:text-[#2d3085]")
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <ThemeToggle isAstro={!!isAstro} />
      </div>
    </header>
  );
}

function ThemeToggle({ isAstro }: { isAstro: boolean }) {
  return (
    <div
      role="group"
      aria-label="Choisir un univers"
      className={
        "relative flex items-center rounded-full border p-1 text-xs font-mono " +
        (isAstro
          ? "border-[#26315f] bg-[#101b3f]"
          : "border-[#c9d2e0] bg-white")
      }
    >
      <span
        aria-hidden
        className={
          "absolute top-1 bottom-1 w-[92px] rounded-full transition-transform duration-300 ease-out " +
          (isAstro ? "translate-x-[92px] bg-[#2d3085]" : "translate-x-0 bg-[#152451]")
        }
      />
      <Link
        href="/"
        aria-current={!isAstro}
        className={
          "relative z-10 flex w-[92px] items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors " +
          (!isAstro ? "text-white" : isAstro ? "text-[#9fb0d6]" : "text-[#4a5578]")
        }
      >
        <span aria-hidden>{"</>"}</span> Info
      </Link>
      <Link
        href="/astro"
        aria-current={isAstro}
        className={
          "relative z-10 flex w-[92px] items-center justify-center gap-1.5 rounded-full py-1.5 transition-colors " +
          (isAstro ? "text-white" : "text-[#4a5578]")
        }
      >
        <span aria-hidden>✦</span> Astro
      </Link>
    </div>
  );
}
