export default function Eyebrow({
  children,
  variant = "pro",
}: {
  children: React.ReactNode;
  variant?: "pro" | "astro";
}) {
  return (
    <p
      className={
        "meta-label mb-3 flex items-center gap-2 " +
        (variant === "astro" ? "text-[#a7e0e7]" : "text-[#2d3085]")
      }
    >
      <span
        className={
          "h-px w-8 " + (variant === "astro" ? "bg-[#a7e0e7]/60" : "bg-[#2d3085]/50")
        }
      />
      {children}
    </p>
  );
}
