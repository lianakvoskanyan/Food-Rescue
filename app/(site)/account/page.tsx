import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/auth/profile-form";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { requireCustomerAccount } from "@/lib/auth/account-access";
import {
  getCustomerBookingStats,
  SanityFetchError,
} from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "Account",
};

async function CustomerAccountContent() {
  const auth = await requireCustomerAccount("/account");

  let stats = { total: 0, active: 0 };

  try {
    stats = await getCustomerBookingStats(auth.profile.id);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  const displayName =
    auth.profile.displayName?.trim() || auth.email.split("@")[0] || "Customer";

  return (
    <>
      <section className="rounded-2xl border border-brand/10 bg-surface p-5 sm:p-6">
        <p className="text-sm text-muted">Welcome</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-brand-dark">
          {displayName}
        </h2>
        <p className="mt-2 text-sm text-muted">{auth.email}</p>
      </section>

      <section
        aria-labelledby="account-stats-heading"
        className="grid gap-4 sm:grid-cols-2"
      >
        <h2 id="account-stats-heading" className="sr-only">
          Booking statistics
        </h2>
        <div className="rounded-2xl border border-brand/10 bg-surface p-5">
          <p className="text-sm font-medium text-brand-dark">Bookings total</p>
          <p className="mt-2 font-display text-3xl font-semibold text-brand-dark">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-brand/10 bg-surface p-5">
          <p className="text-sm font-medium text-brand-dark">Active</p>
          <p className="mt-2 font-display text-3xl font-semibold text-brand">
            {stats.active}
          </p>
          <p className="mt-1 text-xs text-muted">
            Statuses &ldquo;Pending&rdquo; and &ldquo;Confirmed&rdquo;
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <ButtonLink href="/account/bookings" variant="primary">
          My bookings
        </ButtonLink>
        <ButtonLink href="/offers" variant="secondary">
          Offers catalog
        </ButtonLink>
      </section>

      <section aria-labelledby="account-profile-heading" className="space-y-3">
        <div>
          <h2
            id="account-profile-heading"
            className="font-display text-xl font-semibold text-brand-dark"
          >
            Profile name
          </h2>
          <p className="mt-1 text-sm text-muted">
            Email and role are set at registration and in Sanity Studio. Here you can change
            only the display name.
          </p>
        </div>
        <ProfileForm profile={auth.profile} />
      </section>

      <p className="text-sm text-muted">
        <Link href="/profile" className="text-brand underline-offset-2 hover:underline">
          Account technical details
        </Link>
      </p>
    </>
  );
}

function AccountFallback() {
  return (
    <div className="space-y-4">
      <div className="h-28 animate-pulse rounded-2xl bg-brand/10" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 animate-pulse rounded-2xl bg-brand/10" />
        <div className="h-24 animate-pulse rounded-2xl bg-brand/10" />
      </div>
    </div>
  );
}

export default function CustomerAccountPage() {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Container className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-brand-dark">
            Account
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your bookings and customer profile settings.
          </p>
        </div>

        <Suspense fallback={<AccountFallback />}>
          <CustomerAccountContent />
        </Suspense>
      </Container>
    </main>
  );
}
