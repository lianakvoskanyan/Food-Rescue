import { Container } from "@/components/ui/container";

export function HomePageFallback() {
  return (
    <>
      <section className="py-8 sm:py-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-4">
              <div className="h-8 w-36 animate-pulse rounded-full bg-brand/10" />
              <div className="h-16 max-w-xl animate-pulse rounded-2xl bg-brand/10" />
              <div className="h-20 max-w-lg animate-pulse rounded-2xl bg-brand/10" />
              <div className="flex gap-3">
                <div className="h-12 w-40 animate-pulse rounded-full bg-brand/10" />
                <div className="h-12 w-36 animate-pulse rounded-full bg-brand/10" />
              </div>
              <div className="h-28 animate-pulse rounded-3xl bg-brand/10" />
            </div>
            <div className="aspect-[4/5] animate-pulse rounded-[1.75rem] bg-brand/10" />
          </div>
        </Container>
      </section>
      <section className="py-12">
        <Container>
          <div className="mb-8 h-10 w-64 animate-pulse rounded-xl bg-brand/10" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-80 animate-pulse rounded-2xl bg-brand/10" />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
