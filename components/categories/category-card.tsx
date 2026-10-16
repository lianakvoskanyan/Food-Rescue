import Image from "next/image";
import Link from "next/link";
import { urlForImage } from "@/lib/sanity/image";
import { siteCardInteractiveClass } from "@/components/ui/site-card";
import type { Category } from "@/lib/sanity/types";

type CategoryCardProps = {
  category: Category;
  variant?: "default" | "prominent";
};

export function CategoryCard({ category, variant = "default" }: CategoryCardProps) {
  const prominent = variant === "prominent";
  const imageUrl = category.image
    ? urlForImage(category.image).width(480).height(360).fit("crop").url()
    : null;

  return (
    <Link
      href={`/offers?category=${encodeURIComponent(category.slug.current)}`}
      className={`block h-full ${prominent ? "p-5 sm:p-6" : "p-4"} ${siteCardInteractiveClass}`}
    >
      <div
        className={`relative mb-4 overflow-hidden bg-brand/5 ${
          prominent ? "aspect-[5/4] rounded-2xl" : "aspect-[4/3] rounded-xl"
        }`}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={category.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium uppercase tracking-wide text-muted">
            {category.title.slice(0, 1)}
          </div>
        )}
      </div>
      <h3
        className={`font-display font-semibold text-brand-dark ${
          prominent ? "text-xl sm:text-2xl" : "text-lg"
        }`}
      >
        {category.title}
      </h3>
      {category.description ? (
        <p className="mt-1 line-clamp-2 text-sm text-muted">{category.description}</p>
      ) : null}
    </Link>
  );
}
