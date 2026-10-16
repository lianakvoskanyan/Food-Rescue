import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FoodOfferDetail } from "@/components/offers/food-offer-detail";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { getCurrentAuthState } from "@/lib/auth/session";
import { parseOfferSlugParam } from "@/lib/sanity/catalog-params";
import {
  getFoodOfferBySlug,
  isPublicFoodOffer,
  SanityFetchError,
} from "@/lib/sanity/fetch";

type OfferDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function OfferDetailFallback() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-[16/10] animate-pulse rounded-3xl bg-brand/10" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 animate-pulse rounded-xl bg-brand/10" />
          <div className="h-8 w-1/3 animate-pulse rounded-xl bg-brand/10" />
          <div className="h-32 animate-pulse rounded-2xl bg-brand/10" />
        </div>
      </div>
    </Container>
  );
}

async function OfferDetailContent({ params }: OfferDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = parseOfferSlugParam(rawSlug);

  if (!slug) {
    notFound();
  }

  let offer;

  try {
    offer = await getFoodOfferBySlug(slug);
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

  if (!isPublicFoodOffer(offer)) {
    notFound();
  }

  const relatedOffers = (offer.relatedOffers ?? []).filter(isPublicFoodOffer);
  const auth = await getCurrentAuthState();
  const loginHref = `/login?next=${encodeURIComponent(`/offers/${slug}`)}`;
  const bookingAccess =
    !auth
      ? ("guest" as const)
      : auth.profile.role === "customer"
        ? ("customer" as const)
        : ("forbidden" as const);

  return (
    <Container className="py-10 sm:py-14">
      <FoodOfferDetail
        offer={{ ...offer, relatedOffers }}
        bookingAccess={bookingAccess}
        loginHref={loginHref}
      />
    </Container>
  );
}

export async function generateMetadata({
  params,
}: OfferDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = parseOfferSlugParam(rawSlug);

  if (!slug) {
    return { title: "Offer not found" };
  }

  try {
    const offer = await getFoodOfferBySlug(slug);
    if (!isPublicFoodOffer(offer)) {
      return { title: "Offer not found" };
    }

    return {
      title: offer.title,
      description: offer.description ?? undefined,
    };
  } catch {
    return { title: "Offer" };
  }
}

export default function OfferDetailPage(props: OfferDetailPageProps) {
  return (
    <main className="flex-1">
      <Suspense fallback={<OfferDetailFallback />}>
        <OfferDetailContent params={props.params} />
      </Suspense>
    </main>
  );
}
