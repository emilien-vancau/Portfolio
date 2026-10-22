import Image from "next/image";
import type { GalleryImage } from "@/lib/data";

export default function MasonryGallery({ images }: { images: GalleryImage[] }) {
  return (
    <div className="columns-1 gap-2 sm:columns-2 lg:columns-3">
      {images.map((img) => (
        <figure
          key={img.src}
          className="group relative mb-6 break-inside-avoid overflow-hidden rounded-2xl border border-[#26315f] bg-[#101b3f] transition-all hover:border-[#a7e0e7]/50"
        >
          <Image
            src={img.src}
            alt={img.alt}
            width={img.width}
            height={img.height}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="block h-auto w-full"
            loading={img.src === "/imgs/M51_final_lrgb.jpg" ? "eager" : "lazy"}
          />

          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-[#0a1230]/90 via-[#0a1230]/50 to-transparent px-5 pb-4 pt-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-within:opacity-100">
            <span
              className="text-lg italic text-[#e5ebeb]"
              style={{ fontFamily: "var(--font-display-astro)" }}
            >
              {img.title}
            </span>
            {img.caption && (
              <span className="meta-label text-[#a7e0e7]">{img.caption}</span>
            )}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}