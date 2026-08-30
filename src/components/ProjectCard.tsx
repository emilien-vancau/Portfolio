import StatusTag, { StatusType } from "./StatusTag";
import Tag from "./Tag";

type ProjectCardProps = {
  title: string;
  period: string;
  description: string;
  statusTag: StatusType;
  tags: string[];
  href?: string;
  variant?: "pro" | "astro";
  isDisplay?: boolean;
};

export default function ProjectCard({
  title,
  period,
  description,
  statusTag,
  tags,
  href,
  variant = "pro",
  isDisplay = false,
}: ProjectCardProps) {
  if (!isDisplay) return null;

  const isAstro = variant === "astro";

  const content = (
    <div
      className={
        "group flex h-full flex-col gap-4 rounded-2xl border p-6 transition-all " +
        (isAstro
          ? "border-[#26315f] bg-[#101b3f] hover:border-[#a7e0e7]/50"
          : "border-[#c9d2e0] bg-white hover:border-[#2d3085]/40 hover:shadow-[0_8px_24px_-12px_rgba(21,36,81,0.25)]")
      }
    >
      <div className="flex items-start justify-between gap-3">
        <h3
          className={
            "text-lg font-semibold " + (isAstro ? "text-[#e5ebeb]" : "text-[#152451]")
          }
        >
          {title}
        </h3>
        <StatusTag status={statusTag}/>  
      </div>
      <p className={"meta-label " + (isAstro ? "text-[#9fb0d6]" : "text-[#4a5578]")}>
        {period}
      </p>
      <p className={"text-sm leading-relaxed " + (isAstro ? "text-[#c3cde8]" : "text-[#4a5578]")}>
        {description}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        {tags.map((t) => (
          <Tag key={t} variant={variant}>
            {t}
          </Tag>
        ))}
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return content;
}
