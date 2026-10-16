import Link from "next/link";

export function AuthConfigNotice() {
  return (
    <div
      className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950"
      role="alert"
    >
      <p className="font-medium">Authentication not configured</p>
      <p className="mt-2 leading-relaxed">
        Add <code className="rounded bg-amber-100 px-1">AUTH_SECRET</code> to{" "}
        <code className="rounded bg-amber-100 px-1">.env.local</code> (for registration also{" "}
        <code className="rounded bg-amber-100 px-1">SANITY_API_WRITE_TOKEN</code>), then
        restart the dev server.
      </p>
      <p className="mt-3">
        <Link href="/" className="font-medium underline-offset-2 hover:underline">
          Home
        </Link>
      </p>
    </div>
  );
}
