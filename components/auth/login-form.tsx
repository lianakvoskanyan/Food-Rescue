"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/lib/auth/actions";

type LoginFormProps = {
  nextPath: string;
};

const initialState: AuthFormState = {};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-brand-dark">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-brand-dark">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

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
        {pending ? "Signing in..." : "Sign in"}
      </button>

      <p className="text-center text-sm text-muted">
        No account?{" "}
        <Link href="/register" className="font-medium text-brand underline-offset-2 hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
