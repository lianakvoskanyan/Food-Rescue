"use client";

import { useActionState } from "react";
import { updateProfileAction, type AuthFormState } from "@/lib/auth/actions";
import type { UserProfile } from "@/lib/auth/types";

type ProfileFormProps = {
  profile: UserProfile;
};

const initialState: AuthFormState = {};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(
    updateProfileAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4 rounded-2xl border border-brand/10 bg-surface p-5">
      <div className="space-y-1.5">
        <label htmlFor="profile-full-name" className="text-sm font-medium text-brand-dark">
          Name
        </label>
        <input
          id="profile-full-name"
          name="fullName"
          type="text"
          defaultValue={profile.displayName ?? ""}
          className="min-h-11 w-full rounded-xl border border-brand/10 bg-background px-3 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
      </div>

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="text-sm text-brand" role="status">
          {state.success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save name"}
      </button>
    </form>
  );
}
