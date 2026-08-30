export default function Tag({
  children,
  variant = "pro",
}: {
  children: React.ReactNode;
  variant?: "pro" | "astro";
}) {
  return (
    <span
      className={
        "meta-label inline-flex items-center rounded-full border px-2.5 py-1 " +
        (variant === "astro"
          ? "border-[#26315f] bg-[#101b3f] text-[#a7e0e7]"
          : "border-[#c9d2e0] bg-white text-[#2d3085]")
      }
    >
      {children}
    </span>
  );
}
