"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { registerAction, type AuthFormState } from "@/lib/auth/actions";
import type { RegisterRole } from "@/lib/auth/validation";

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const [accountRole, setAccountRole] = useState<RegisterRole>("customer");

  return (
    <form action={formAction} className="space-y-4">
      <fieldset className="space-y-3 rounded-2xl border border-brand/10 bg-surface/80 p-4">
        <legend className="text-sm font-semibold text-brand-dark">Account type</legend>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-brand/10 bg-background px-3 py-3 has-[:checked]:border-brand/30 has-[:checked]:ring-1 has-[:checked]:ring-brand/20">
          <input
            type="radio"
            name="accountRole"
            value="customer"
            checked={accountRole === "customer"}
            onChange={() => setAccountRole("customer")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-brand-dark">Customer</span>
            <span className="mt-0.5 block text-xs text-muted">
              Book bundles and manage orders.
            </span>
          </span>
        </label>
        <label className="flex cursor-pointer gap-3 rounded-xl border border-brand/10 bg-background px-3 py-3 has-[:checked]:border-brand/30 has-[:checked]:ring-1 has-[:checked]:ring-brand/20">
          <input
            type="radio"
            name="accountRole"
            value="seller"
            checked={accountRole === "seller"}
            onChange={() => setAccountRole("seller")}
            className="mt-1"
          />
          <span>
            <span className="block text-sm font-medium text-brand-dark">Seller</span>
            <span className="mt-0.5 block text-xs text-muted">
              After registration you can create a store and add offers.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="register-full-name" className="text-sm font-medium text-brand-dark">
          Name (optional)
        </label>
        <input
          id="register-full-name"
          name="fullName"
          type="text"
          autoComplete="name"
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-brand-dark">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className="text-sm font-medium text-brand-dark">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        <p className="text-xs text-muted">At least 8 characters. Admin role is not available at registration.</p>
      </div>

      {accountRole === "seller" ? (
        <p className="rounded-xl border border-amber-200/80 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-950">
          After sign-in, sellers set up their store in the dashboard. Storefront publication — after
          administrator review.
        </p>
      ) : null}

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Registering..." : "Create account"}
      </button>

      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand underline-offset-2 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
