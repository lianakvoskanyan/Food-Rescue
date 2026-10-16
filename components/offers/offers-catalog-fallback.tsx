import { Container } from "@/components/ui/container";

export function OffersCatalogFallback() {
  return (
    <Container className="py-10 sm:py-14">
      <div className="mb-8 space-y-3">
        <div className="h-12 w-2/3 max-w-lg animate-pulse rounded-xl bg-brand/10" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-brand/10" />
      </div>
      <div className="mb-8 h-44 animate-pulse rounded-2xl bg-brand/10" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((key) => (
          <div key={key} className="h-80 animate-pulse rounded-2xl bg-brand/10" />
        ))}
      </div>
    </Container>
  );
}
