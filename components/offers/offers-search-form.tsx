type OffersSearchFormProps = {
  action?: string;
  placeholder: string;
  initialQuery?: string;
  categorySlug?: string;
  submitLabel?: string;
};

export function OffersSearchForm({
  action = "/offers",
  placeholder,
  initialQuery = "",
  categorySlug,
  submitLabel = "Search offers",
}: OffersSearchFormProps) {
  return (
    <form action={action} method="get" role="search" className="space-y-3">
      <label htmlFor="offers-search-input" className="block text-sm font-medium text-brand-dark">
        Search offers
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="offers-search-input"
          name="q"
          type="search"
          defaultValue={initialQuery}
          placeholder={placeholder}
          className="min-h-12 flex-1 rounded-2xl border border-brand/10 bg-background/80 px-4 text-base text-brand-dark shadow-inner shadow-brand/5 placeholder:text-muted/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        />
        {categorySlug ? (
          <input type="hidden" name="category" value={categorySlug} />
        ) : null}
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-6 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(27,67,50,0.8)] transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
