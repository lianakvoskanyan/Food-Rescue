import type { FoodOfferPublicationStatus } from "@/lib/sanity/types";

const config: Record<
  FoodOfferPublicationStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Awaiting publication",
    className: "bg-amber-100 text-amber-950",
  },
  published: {
    label: "On site",
    className: "bg-brand/15 text-brand-dark",
  },
  soldOut: {
    label: "Sold out",
    className: "bg-muted/15 text-muted",
  },
  expired: {
    label: "Expired",
    className: "bg-muted/15 text-muted",
  },
};

export function SellerOfferStatusBadge({
  status,
}: {
  status: FoodOfferPublicationStatus;
}) {
  const item = config[status] ?? {
    label: status,
    className: "bg-muted/15 text-muted",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.className}`}
    >
      {item.label}
    </span>
  );
}
