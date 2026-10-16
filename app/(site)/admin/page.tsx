import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminStats } from "@/components/admin/admin-stats";
import { ErrorState } from "@/components/ui/error-state";
import { requireAdminDashboard } from "@/lib/admin/access";
import { fetchAdminDashboardStats } from "@/lib/admin/service";
import { SanityFetchError } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Overview",
};

async function AdminOverviewContent() {
  await requireAdminDashboard("/admin");

  let stats;
  try {
    stats = await fetchAdminDashboardStats();
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return (
        <ErrorState
          title="Could not load statistics"
          description="Check your Sanity connection and environment variables."
        />
      );
    }
    throw error;
  }

  return <AdminStats stats={stats} />;
}

function AdminOverviewFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="h-28 animate-pulse rounded-2xl bg-brand/10" />
      ))}
    </div>
  );
}

export default function AdminOverviewPage() {
  return (
    <Suspense fallback={<AdminOverviewFallback />}>
      <AdminOverviewContent />
    </Suspense>
  );
}
