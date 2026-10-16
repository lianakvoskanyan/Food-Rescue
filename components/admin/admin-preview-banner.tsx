import Link from "next/link";

type AdminPreviewBannerProps = {
  backHref: string;
  backLabel: string;
  title: string;
  lines: string[];
};

export function AdminPreviewBanner({
  backHref,
  backLabel,
  title,
  lines,
}: AdminPreviewBannerProps) {
  return (
    <div
      className="mb-6 space-y-2 rounded-2xl border border-amber-300/80 bg-amber-50 px-4 py-4 text-sm text-amber-950"
      role="status"
    >
      <p className="font-semibold text-amber-950">{title}</p>
      <ul className="list-inside list-disc space-y-0.5 text-amber-900/90">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <Link
        href={backHref}
        className="inline-flex pt-1 text-sm font-semibold text-brand underline-offset-2 hover:underline"
      >
        {backLabel}
      </Link>
    </div>
  );
}
