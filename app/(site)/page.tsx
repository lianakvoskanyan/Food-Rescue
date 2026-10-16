import { Suspense } from "react";
import { HomePageContent } from "@/components/home/home-page-content";
import { HomePageFallback } from "@/components/home/home-page-fallback";

type HomePageProps = {
  searchParams: Promise<{ q?: string; category?: string }>;
};

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <main className="flex-1">
      <Suspense fallback={<HomePageFallback />}>
        <HomePageContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
