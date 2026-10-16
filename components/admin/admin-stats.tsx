import type { AdminDashboardStats } from "@/lib/sanity/types";

type AdminStatsProps = {
  stats: AdminDashboardStats;
};

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-brand-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

export function AdminStats({ stats }: AdminStatsProps) {
  return (
    <div className="space-y-8">
      <section aria-labelledby="admin-stats-catalog">
        <h2 id="admin-stats-catalog" className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Catalog
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Stores total" value={stats.storesTotal} />
          <StatCard
            label="Stores on storefront"
            value={stats.storesPublished}
            hint={`Hidden: ${Math.max(0, stats.storesTotal - stats.storesPublished)}`}
          />
          <StatCard label="Offers total" value={stats.offersTotal} />
          <StatCard label="Published" value={stats.offersPublished} />
          <StatCard label="Drafts" value={stats.offersDraft} />
        </div>
      </section>

      <section aria-labelledby="admin-stats-orders">
        <h2 id="admin-stats-orders" className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Bookings
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total" value={stats.bookingsTotal} />
          <StatCard label="Pending" value={stats.bookingsPending} />
          <StatCard label="Active" value={stats.bookingsActive} hint="pending + confirmed" />
        </div>
      </section>

      <section aria-labelledby="admin-stats-users">
        <h2 id="admin-stats-users" className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
          Users (view only)
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Profiles total" value={stats.usersTotal} />
          <StatCard label="Customers" value={stats.usersCustomer} />
          <StatCard label="Sellers" value={stats.usersSeller} />
          <StatCard label="Administrators" value={stats.usersAdmin} />
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Assigning the admin role is done only in Sanity Studio — roles cannot be changed on the site.
        </p>
      </section>
    </div>
  );
}
