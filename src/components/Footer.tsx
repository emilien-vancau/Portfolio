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
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-sm md:flex-row md:items-center">
        <p className="font-mono text-xs">
          © {new Date().getFullYear()} — Emilien Vancauwenberghe.
        </p>
        <div className="flex gap-5 font-mono text-xs">
          <a href="mailto:emilien.vancau@gmail.com" className="hover:underline">
            emilien.vancau@gmail.com
          </a>
          <a href="https://github.com/AlbireoDSE" className="hover:underline">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/emilien-vancauwenberghe-ab734b1b9/" className="hover:underline">
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
