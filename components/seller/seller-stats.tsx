import { formatPrice } from "@/lib/sanity/format";
import type { SellerDashboardStats } from "@/lib/sanity/types";

type SellerStatsProps = {
  stats: SellerDashboardStats;
};

type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
};

function StatCard({ label, value, hint, accent = false }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-brand/10 bg-surface p-5">
      <p className="text-sm font-medium text-brand-dark">{label}</p>
      <p
        className={`mt-2 font-display text-2xl font-semibold sm:text-3xl ${
          accent ? "text-brand" : "text-brand-dark"
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs leading-relaxed text-muted">{hint}</p> : null}
    </div>
  );
}

export function SellerStats({ stats }: SellerStatsProps) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="seller-finance-heading">
        <h2
          id="seller-finance-heading"
          className="font-display text-xl font-semibold text-brand-dark"
        >
          Finance
        </h2>
        <p className="mt-1 text-sm text-muted">
          Amounts from offer prices in Sanity. Revenue counts only completed
          orders; pipeline — pending and confirmed.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Revenue (completed)"
            value={formatPrice(stats.revenueCompleted)}
            hint={`${stats.setsSoldCompleted} bundles · avg. ${formatPrice(stats.averageOrderCompleted)}`}
            accent
          />
          <StatCard
            label="Expected revenue"
            value={formatPrice(stats.revenuePipeline)}
            hint="Pending + confirmed"
          />
          <StatCard
            label="Full rescued value"
            value={formatPrice(stats.rescueValueCompleted)}
            hint="From originalPrice of completed orders"
          />
          <StatCard
            label="Customer savings"
            value={formatPrice(stats.customerSavingsCompleted)}
            hint="originalPrice − price difference (completed)"
          />
        </div>
      </section>

      <section aria-labelledby="seller-catalog-heading">
        <h2
          id="seller-catalog-heading"
          className="font-display text-xl font-semibold text-brand-dark"
        >
          Catalog
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Offers total" value={String(stats.offersCount)} />
          <StatCard
            label="Published"
            value={String(stats.publishedOffersCount)}
          />
          <StatCard label="Drafts" value={String(stats.draftOffersCount)} />
          <StatCard label="Bundles available" value={String(stats.portionsAvailable)} />
          <StatCard
            label="Stock on storefront"
            value={formatPrice(stats.inventoryRetailValue)}
            hint="Published × price × qty"
          />
          <StatCard
            label="Would be full price"
            value={formatPrice(stats.inventoryFullValue)}
            hint="Published × originalPrice × qty"
          />
        </div>
      </section>

      <section aria-labelledby="seller-bookings-heading">
        <h2
          id="seller-bookings-heading"
          className="font-display text-xl font-semibold text-brand-dark"
        >
          Orders
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total" value={String(stats.bookingsTotal)} />
          <StatCard
            label="Active"
            value={String(stats.bookingsActive)}
            accent
          />
          <StatCard label="Pending" value={String(stats.bookingsPending)} />
          <StatCard label="Confirmed" value={String(stats.bookingsConfirmed)} />
          <StatCard label="Completed" value={String(stats.bookingsCompleted)} />
          <StatCard label="Cancelled" value={String(stats.bookingsCancelled)} />
        </div>
      </section>
    </div>
  );
}
