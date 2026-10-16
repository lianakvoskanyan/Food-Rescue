import Link from "next/link";
import type { FoodOfferPublicationStatus } from "@/lib/sanity/types";

type SellerOfferPublicationNoticeProps = {
  status: FoodOfferPublicationStatus;
  /** Right after creating a draft */
  justCreated?: boolean;
};

export function SellerOfferPublicationNotice({
  status,
  justCreated = false,
}: SellerOfferPublicationNoticeProps) {
  if (justCreated || status === "draft") {
    return (
      <div
        className="rounded-2xl border border-amber-200/80 bg-amber-50 px-4 py-4 sm:px-5"
        role="status"
      >
        <p className="font-semibold text-amber-950">
          {justCreated ? "Offer created" : "Not published yet"}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-amber-900/90">
          This is currently a <strong>draft</strong>: customers{" "}
          <strong>do not see</strong> it in the catalog and cannot book. After review,{" "}
          the <strong>administrator confirms publication</strong> in the admin panel — then the bundle
          appears on the site.
        </p>
        <p className="mt-2 text-xs text-amber-800/85">
          You can edit details and photos; only an administrator sets &ldquo;Published&rdquo;
          status.
        </p>
      </div>
    );
  }

  if (status === "published") {
    return (
      <div
        className="rounded-2xl border border-brand/25 bg-brand/5 px-4 py-4 sm:px-5"
        role="status"
      >
        <p className="font-semibold text-brand-dark">Published on site</p>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Offer is visible in the catalog and available for booking (when bundles remain).
        </p>
      </div>
    );
  }

  if (status === "soldOut") {
    return (
      <div
        className="rounded-2xl border border-brand/15 bg-surface px-4 py-3 text-sm text-muted"
        role="status"
      >
        Sold out status — may not show on the storefront until you change stock or
        status.
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl border border-brand/15 bg-surface px-4 py-3 text-sm text-muted"
      role="status"
    >
      Expired status — offer is unavailable for new bookings. For republication,
      contact the{" "}
      <Link href="/profile" className="font-medium text-brand underline-offset-2 hover:underline">
        administrator
      </Link>
      .
    </div>
  );
}
