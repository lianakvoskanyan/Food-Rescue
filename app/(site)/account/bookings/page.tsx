import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { BookingsList } from "@/components/bookings/bookings-list";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { requireRole } from "@/lib/auth/session";
import { getBookingsForProfile, SanityFetchError } from "@/lib/sanity/fetch";

export const metadata: Metadata = {
  title: "My bookings",
};

type AccountBookingsPageProps = {
  searchParams: Promise<{ cancelled?: string }>;
};

async function AccountBookingsContent({
  searchParams,
}: AccountBookingsPageProps) {
  const auth = await requireRole(["customer"], "/account/bookings");
  const params = await searchParams;

  let bookings;

  try {
    bookings = await getBookingsForProfile(auth.profile.id);
  } catch (error) {
    if (error instanceof SanityFetchError) {
      return <ErrorState />;
    }
    throw error;
  }

  return (
    <>
      {params.cancelled === "1" ? (
        <p
          className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-brand-dark"
          role="status"
        >
          Booking cancelled; bundles are available in the catalog again.
        </p>
      ) : null}

      <BookingsList bookings={bookings} />
    </>
  );
}

function BookingsFallback() {
  return <div className="h-64 animate-pulse rounded-2xl bg-brand/10" />;
}

export default function AccountBookingsPage(props: AccountBookingsPageProps) {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Container className="max-w-3xl space-y-6">
        <div>
          <Link
            href="/account"
            className="text-sm font-medium text-brand underline-offset-2 hover:underline"
          >
            ← Account
          </Link>
          <h1 className="mt-3 font-display text-3xl font-semibold text-brand-dark">
            My bookings
          </h1>
          <p className="mt-2 text-sm text-muted">
            Current offer data and statuses from Sanity. Confirmation and completion
            are done by the seller or administrator in Studio.
          </p>
        </div>

        <Suspense fallback={<BookingsFallback />}>
          <AccountBookingsContent searchParams={props.searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
