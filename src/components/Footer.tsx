"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAstro = pathname?.startsWith("/astro");

  return (
    <footer
      className={
        "border-t px-6 py-10 " +
        (isAstro
          ? "border-[#26315f] bg-[#0a1230] text-[#9fb0d6]"
          : "border-[#c9d2e0] bg-[#e5ebeb] text-[#4a5578]")
      }
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-6 text-sm">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="font-mono text-xs">
            © {new Date().getFullYear()} — Emilien Vancauwenberghe.
          </p>
          <div className="flex gap-5 font-mono text-xs">
            <a href="mailto:emilien.vancau@gmail.com" className="hover:underline">
              emilien.vancau@gmail.com
            </a>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-start">
          <p className="font-mono text-xs tracking-wider">Built with:</p>
          <ul className="flex flex-wrap gap-2 font-mono text-[10px]">
            {["Next.js", "React", "TypeScript", "Tailwind CSS", "FeralUI"].map((tool) => (
              <li
                key={tool}
                className={
                  "rounded-full border px-2.5 py-1 " +
                  (isAstro ? "border-[#26315f]" : "border-[#c9d2e0]")
                }
              >
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
