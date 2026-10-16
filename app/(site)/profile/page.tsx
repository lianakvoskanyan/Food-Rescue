import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/auth/profile-form";
import { Container } from "@/components/ui/container";
import { requireAuth } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Profile",
};

type ProfilePageProps = {
  searchParams: Promise<{ error?: string }>;
};

function roleLabel(role: string) {
  switch (role) {
    case "seller":
      return "Seller";
    case "admin":
      return "Admin";
    default:
      return "Customer";
  }
}

async function ProfilePageContent({ searchParams }: ProfilePageProps) {
  const auth = await requireAuth("/profile");
  const params = await searchParams;

  return (
    <>
      {params.error === "access_denied" ? (
        <p
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
          role="alert"
        >
          Your role does not have access to the requested section.
        </p>
      ) : null}

      <dl className="grid gap-4 rounded-2xl border border-brand/10 bg-surface p-5 text-sm">
        <div>
          <dt className="font-medium text-brand-dark">Email</dt>
          <dd className="mt-1 text-muted">{auth.email}</dd>
        </div>
        <div>
          <dt className="font-medium text-brand-dark">Role</dt>
          <dd className="mt-1 text-muted">{roleLabel(auth.profile.role)}</dd>
        </div>
        <div>
          <dt className="font-medium text-brand-dark">User ID</dt>
          <dd className="mt-1 break-all text-muted">{auth.userId}</dd>
        </div>
      </dl>

      <ProfileForm profile={auth.profile} />

      <div className="flex flex-wrap gap-4 text-sm">
        {auth.profile.role === "seller" ? (
          <Link href="/seller" className="text-brand underline-offset-2 hover:underline">
            Seller dashboard
          </Link>
        ) : null}
        {auth.profile.role === "admin" ? (
          <Link href="/admin" className="text-brand underline-offset-2 hover:underline">
            Admin panel
          </Link>
        ) : null}
        {auth.profile.role === "customer" ? (
          <Link href="/account" className="text-brand underline-offset-2 hover:underline">
            Account
          </Link>
        ) : null}
        {auth.profile.role === "customer" ? (
          <Link href="/account/bookings" className="text-brand underline-offset-2 hover:underline">
            My bookings
          </Link>
        ) : null}
        <Link href="/offers" className="text-brand underline-offset-2 hover:underline">
          Offers catalog
        </Link>
      </div>
    </>
  );
}

function ProfileFallback() {
  return <div className="h-80 animate-pulse rounded-2xl bg-brand/10" />;
}

export default function ProfilePage(props: ProfilePageProps) {
  return (
    <main className="flex-1 py-10 sm:py-14">
      <Container className="max-w-2xl space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold text-brand-dark">Profile</h1>
          <p className="mt-2 text-sm text-muted">
            Sign-in with email and password (Auth.js); role and name — userProfile document in Sanity.
          </p>
        </div>
        <Suspense fallback={<ProfileFallback />}>
          <ProfilePageContent searchParams={props.searchParams} />
        </Suspense>
      </Container>
    </main>
  );
}
