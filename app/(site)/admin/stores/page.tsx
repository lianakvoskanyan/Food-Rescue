import { Suspense } from "react";
import type { Metadata } from "next";
import { AdminStoresList } from "@/components/admin/admin-stores-list";
import { ErrorState } from "@/components/ui/error-state";
import { requireAdminDashboard } from "@/lib/admin/access";
import { fetchAdminStores } from "@/lib/admin/service";

export const metadata: Metadata = {
  title: "Stores",
};

async function AdminStoresContent() {
  await requireAdminDashboard("/admin/stores");

  let stores;
  try {
    stores = await fetchAdminStores();
  } catch {
    return (
      <ErrorState
        title="Could not load stores"
        description="Try again later or check Sanity."
      />
    );
  }

  return <AdminStoresList stores={stores} />;
}

export default function AdminStoresPage() {
  return (
    <Suspense
      fallback={<div className="h-40 animate-pulse rounded-2xl bg-brand/10" role="status" />}
    >
      <AdminStoresContent />
    </Suspense>
  );
}
