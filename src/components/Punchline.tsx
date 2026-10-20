export default function Punchline({
  children,
  author,
}: {
  children: React.ReactNode;
  author?: string;
}) {
  return (
    <figure className="mb-6">
      <blockquote
        className="text-2xl italic leading-snug text-[#a7e0e7] md:text-4xl"
        style={{ fontFamily: "var(--font-display-astro)" }}
      >
        “{children}”
      </blockquote>
      {author && (
        <figcaption className="meta-label mt-3 text-[#9fb0d6]">
          — {author}
        </figcaption>
      )}
    </figure>
  );
}