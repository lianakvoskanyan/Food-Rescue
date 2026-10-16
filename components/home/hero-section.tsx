import Image from "next/image";
import Link from "next/link";
import { OffersSearchForm } from "@/components/offers/offers-search-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import type { HomeHeroImage } from "@/lib/home/hero-image";
import { urlForImage } from "@/lib/sanity/image";
import type { Category, SiteSettings } from "@/lib/sanity/types";

type HeroSectionProps = {
  settings: SiteSettings;
  categories: Category[];
  heroImage: HomeHeroImage | null;
  initialQuery?: string;
  activeCategory?: string;
};

export function HeroSection({
  settings,
  categories,
  heroImage,
  initialQuery = "",
  activeCategory,
}: HeroSectionProps) {
  const catalogHref = settings.heroCtaHref?.trim() || "/offers";
  const catalogLabel = settings.heroCtaLabel?.trim() || "Browse catalog";

  const heroImageUrl = heroImage
    ? urlForImage(heroImage.source).width(960).height(1200).fit("crop").url()
    : null;

  return (
    <section className="relative overflow-hidden pb-8 pt-8 sm:pb-14 sm:pt-12">
      <div
        className="pointer-events-none absolute -left-40 top-0 h-[28rem] w-[28rem] rounded-full bg-brand/12 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-accent/25 blur-3xl"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div className="order-2 space-y-7 lg:order-1">
            {settings.heroBadge ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-brand/15 bg-surface/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-light" aria-hidden />
                {settings.heroBadge}
              </p>
            ) : null}

            <div className="space-y-4">
              <h1 className="font-display text-[2.35rem] font-semibold leading-[1.05] tracking-tight text-brand-dark sm:text-5xl lg:text-[3.25rem]">
                {settings.heroTitle}
              </h1>
              {settings.heroSubtitle ? (
                <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
                  {settings.heroSubtitle}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ButtonLink href={catalogHref} className="min-h-12 px-7 text-base">
                {catalogLabel}
              </ButtonLink>
              <ButtonLink href="/register" variant="secondary" className="min-h-12 px-6">
                For sellers
              </ButtonLink>
              {(initialQuery || activeCategory) && (
                <Link
                  href="/"
                  className="text-sm font-medium text-brand underline-offset-4 hover:underline"
                >
                  Clear filters
                </Link>
              )}
            </div>

            <div className="rounded-3xl border border-brand/10 bg-surface/95 p-4 shadow-[0_24px_60px_-48px_rgba(27,67,50,0.45)] sm:p-5">
              <OffersSearchForm
                action="/offers"
                placeholder={settings.searchPlaceholder}
                initialQuery={initialQuery}
                categorySlug={activeCategory}
                submitLabel="Find bundles"
              />
            </div>

            {categories.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Categories
                </p>
                <ul className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const slug = category.slug?.current;
                    if (!slug) {
                      return null;
                    }
                    const isActive = activeCategory === slug;
                    return (
                      <li key={category._id}>
                        <Link
                          href={`/offers?category=${encodeURIComponent(slug)}`}
                          className={`inline-flex rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                            isActive
                              ? "border-brand bg-brand text-white"
                              : "border-brand/15 bg-surface text-brand-dark hover:border-brand/30 hover:bg-brand/5"
                          }`}
                        >
                          {category.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div
                className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-brand/20 via-accent/15 to-brand-light/10 blur-sm"
                aria-hidden
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/60 bg-brand/5 shadow-[0_32px_64px_-32px_rgba(22,61,43,0.55)] sm:aspect-[5/6] lg:aspect-[4/5]">
                {heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    alt={heroImage?.alt ?? ""}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 1024px) 90vw, 44vw"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-brand/10 to-accent-soft/40 p-8 text-center">
                    <span className="font-display text-5xl text-brand/30" aria-hidden>
                      FR
                    </span>
                    <p className="max-w-xs text-sm leading-relaxed text-muted">
                      Add a photo to an offer or category in Sanity — it will appear here
                      automatically.
                    </p>
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-brand-dark/50 to-transparent"
                  aria-hidden
                />
                <p className="absolute bottom-5 left-5 right-5 text-sm font-medium text-white drop-shadow-md">
                  Fresh bundles from local bakeries, cafés, and shops
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
