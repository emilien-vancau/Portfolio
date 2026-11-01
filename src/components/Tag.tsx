export default function Tag({
  children,
  variant = "pro",
  backgroundColor,
}: {
  children: React.ReactNode;
  variant?: "pro" | "astro";
  backgroundColor?: string;
}) {
  return (
    <span
      style={backgroundColor ? { backgroundColor } : undefined}
      className={
        "meta-label tag-label inline-flex items-center rounded-full border px-2.5 py-1 cursor-pointer " +
        (variant === "astro"
          ? "border-[#26315f] text-[#a7e0e7] "
          : "border-[#c9d2e0] text-[#2d3085] ") +
        (backgroundColor
          ? variant === "astro"
            ? "transition-[border-color,box-shadow] duration-200 hover:border-[#a7e0e7]/70 hover:shadow-sm"
            : "transition-[border-color,box-shadow] duration-200 hover:border-[#2d3085]/60 hover:shadow-sm"
          : variant === "astro"
            ? "bg-[#101b3f] transition-[filter] duration-200 hover:brightness-110"
            : "bg-white transition-[filter] duration-200 hover:brightness-95")
      }
    >
      {children}
    </span>
  );
}
