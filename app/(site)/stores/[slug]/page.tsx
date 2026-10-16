import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StoreDetail } from "@/components/stores/store-detail";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { parseStoreSlugParam } from "@/lib/sanity/catalog-params";
import { getStoreBySlug, SanityFetchError } from "@/lib/sanity/fetch";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

function StoreDetailFallback() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[16/10] animate-pulse rounded-3xl bg-brand/10" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-brand/10" />
          <div className="h-24 animate-pulse rounded-2xl bg-brand/10" />
        </div>
      </div>
    </Container>
  );
}

async function StoreDetailContent({ params }: StorePageProps) {
  const { slug: rawSlug } = await params;
  const slug = parseStoreSlugParam(rawSlug);

  if (!slug) {
    notFound();
  }

  let store;

  try {
    store = await getStoreBySlug(slug);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return (
        <Container className="py-12">
          <ErrorState />
          <p className="mt-6 text-center text-sm">
            <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
              Back to catalog
            </Link>
          </p>
        </Container>
      );
    }

    throw error;
  }

  if (!store) {
    notFound();
  }

  return (
    <Container className="py-10 sm:py-14">
      <StoreDetail store={store} />
    </Container>
  );
}

export async function generateMetadata({
  params,
}: StorePageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = parseStoreSlugParam(rawSlug);

  if (!slug) {
    return { title: "Store not found" };
  }

  try {
    const store = await getStoreBySlug(slug);
    if (!store) {
      return { title: "Store not found" };
    }

    return {
      title: store.title,
      description: store.description ?? undefined,
    };
  } catch {
    return { title: "Store" };
  }
}

export default function StorePage(props: StorePageProps) {
  return (
    <main className="flex-1">
      <Suspense fallback={<StoreDetailFallback />}>
        <StoreDetailContent params={props.params} />
      </Suspense>
    </main>
  );
}
