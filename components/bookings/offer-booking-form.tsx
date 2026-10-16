"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createBookingAction, type BookingFormState } from "@/lib/bookings/actions";

export type OfferBookingAccess = "guest" | "customer" | "forbidden" | "preview";

type OfferBookingFormProps = {
  offerId: string;
  maxQuantity: number;
  loginHref: string;
  returnPath: string;
  access: OfferBookingAccess;
};

const initialState: BookingFormState = {};

export function OfferBookingForm({
  offerId,
  maxQuantity,
  loginHref,
  returnPath,
  access,
}: OfferBookingFormProps) {
  const [state, formAction, pending] = useActionState(
    createBookingAction,
    initialState,
  );

  if (access === "preview") {
    return (
      <section className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4">
        <h2 className="font-display text-lg font-semibold text-brand-dark">
          Book
        </h2>
        <p className="mt-2 text-sm text-amber-950/90">
          Booking is disabled in preview mode. After publication, customers will be able to
          place an order on the public page.
        </p>
      </section>
    );
  }

  if (access === "forbidden") {
    return (
      <section className="rounded-2xl border border-brand/10 bg-background p-4">
        <h2 className="font-display text-lg font-semibold text-brand-dark">
          Book
        </h2>
        <p className="mt-2 text-sm text-muted">
          Booking is for customers only. Sellers manage orders in
          Orders.
        </p>
      </section>
    );
  }

  if (access === "guest") {
    return (
      <section className="rounded-2xl border border-brand/10 bg-background p-4">
        <h2 className="font-display text-lg font-semibold text-brand-dark">
          Book
        </h2>
        <p className="mt-2 text-sm text-muted">
          Sign in as a customer to book a bundle. After sign-in you will return to this
          offer.
        </p>
        <Link
          href={loginHref}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Sign in and book
        </Link>
      </section>
    );
  }

  const safeMax = Math.max(1, Math.min(maxQuantity, 20));

  return (
    <section className="rounded-2xl border border-brand/10 bg-background p-4">
      <h2 className="font-display text-lg font-semibold text-brand-dark">
        Book
      </h2>
      <p className="mt-1 text-sm text-muted">
        Available now: {maxQuantity} {maxQuantity === 1 ? "bundle" : "bundles"}
      </p>

      {state.success ? (
        <div
          className="mt-4 rounded-xl border border-brand/25 bg-brand/10 px-4 py-4 text-sm text-brand-dark"
          role="status"
        >
          <p className="font-display text-lg font-semibold">{state.success}</p>
          {state.bookingNumber ? (
            <p className="mt-2 text-muted">
              Booking number:{" "}
              <span className="font-medium text-brand-dark">{state.bookingNumber}</span>
            </p>
          ) : null}
          <p className="mt-2 text-muted">
            We saved your order. View details and status in your account.
          </p>
          <Link
            href="/account/bookings"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Go to my bookings
          </Link>
        </div>
      ) : (
        <form action={formAction} className="mt-4 space-y-4">
          <input type="hidden" name="offerId" value={offerId} />
          <input type="hidden" name="returnPath" value={returnPath} />

          <div className="space-y-1.5">
            <label htmlFor="booking-quantity" className="text-sm font-medium text-brand-dark">
              Number of bundles
            </label>
            <select
              id="booking-quantity"
              name="quantity"
              defaultValue="1"
              disabled={pending}
              className="min-h-11 w-full rounded-xl border border-brand/10 bg-surface px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              {Array.from({ length: safeMax }, (_, index) => {
                const value = index + 1;
                return (
                  <option key={value} value={value}>
                    {value}
                  </option>
                );
              })}
            </select>
          </div>

          {state.error ? (
            <p className="text-sm text-red-700" role="alert">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || maxQuantity < 1}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "Booking..." : "Book"}
          </button>
        </form>
      )}
    </section>
  );
}
