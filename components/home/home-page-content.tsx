import { HeroSection } from "@/components/home/hero-section";
import { HomeSections } from "@/components/home/home-sections";
import { ErrorState } from "@/components/ui/error-state";
import { selectHomeHeroImage } from "@/lib/home/hero-image";
import { getHomePageData, SanityFetchError } from "@/lib/sanity/fetch";
import type { HomePageData } from "@/lib/sanity/types";

type HomePageContentProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

type HomePageViewProps = {
  data: HomePageData;
  query?: string;
  categorySlug?: string;
};

function HomePageView({ data, query, categorySlug }: HomePageViewProps) {
  const heroImage = selectHomeHeroImage(data);

  return (
    <>
      {data.settings ? (
        <HeroSection
          settings={data.settings}
          categories={data.categories}
          heroImage={heroImage}
          initialQuery={query}
          activeCategory={categorySlug}
        />
      ) : null}
      <HomeSections data={data} query={query} categorySlug={categorySlug} />
    </>
  );
}

export async function HomePageContent({ searchParams }: HomePageContentProps) {
  const params = await searchParams;
  const query = params.q?.trim();
  const categorySlug = params.category?.trim();

  let data: HomePageData | null = null;

  try {
    data = await getHomePageData();
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return (
        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <ErrorState />
          </div>
        </div>
      );
    }

    throw error;
  }

  return (
    <HomePageView data={data} query={query} categorySlug={categorySlug} />
  );
}
