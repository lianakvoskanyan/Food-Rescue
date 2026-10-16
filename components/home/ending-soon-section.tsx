"use client";

import Link from "next/link";
import { useMemo } from "react";
import { FoodOfferCard } from "@/components/offers/food-offer-card";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeader } from "@/components/ui/section-header";
import { useOfferNowMs } from "@/lib/offers/client-clock";
import {
  getReservationDeadlineMs,
  isOfferBookableEndingSoon,
} from "@/lib/offers/lifecycle";
import type { FoodOffer } from "@/lib/sanity/types";

type EndingSoonSectionProps = {
  offers: FoodOffer[];
};

export function EndingSoonSection({ offers }: EndingSoonSectionProps) {
  const nowMs = useOfferNowMs();

  const visibleOffers = useMemo(() => {
    if (nowMs === 0) {
      return offers.filter((offer) => isOfferBookableEndingSoon(offer));
    }
    return offers
      .filter((offer) => isOfferBookableEndingSoon(offer, nowMs))
      .sort((a, b) => {
        const aDeadline = getReservationDeadlineMs(a, nowMs) ?? Number.MAX_SAFE_INTEGER;
        const bDeadline = getReservationDeadlineMs(b, nowMs) ?? Number.MAX_SAFE_INTEGER;
        return aDeadline - bDeadline;
      });
  }, [offers, nowMs]);

  if (offers.length === 0) {
    return null;
  }

  if (visibleOffers.length === 0) {
    return null;
  }

  return (
    <section
      id="ending-soon"
      aria-labelledby="ending-soon-heading"
      className="relative overflow-hidden border-y border-accent/25 bg-gradient-to-br from-accent/15 via-surface to-brand/5 py-12 sm:py-16"
    >
      <div
        className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
        aria-hidden
      />
      <Container className="relative">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-brand">
              Hot deals
            </p>
            <SectionHeader
              id="ending-soon-heading"
              title="Ending soon"
              description="Book within the next 3 hours — reservation closes when the timer hits zero."
            />
          </div>
          <ButtonLink
            href="/offers"
            variant="secondary"
            className="mb-2 shrink-0 self-start sm:mb-10 sm:self-auto"
          >
            All offers
          </ButtonLink>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleOffers.map((offer) => (
            <li key={offer._id} className="relative">
              <div className="absolute -inset-0.5 rounded-[1.15rem] bg-gradient-to-br from-accent via-brand/40 to-accent/60 opacity-90" />
              <div className="relative rounded-2xl bg-surface p-0.5 shadow-sm">
                <FoodOfferCard offer={offer} urgent />
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center text-xs text-muted">
          Prices and stock come from Sanity.{" "}
          <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
            See the full catalog
          </Link>
        </p>
      </Container>
    </section>
  );
}
