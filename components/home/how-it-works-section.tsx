import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const steps = [
  {
    number: "1",
    title: "Choose a bundle",
    description:
      "Open the catalog or a category — offers and prices come from partner stores in real time.",
  },
  {
    number: "2",
    title: "Book online",
    description:
      "Choose portions and book with a customer account. Remaining bundles update automatically.",
  },
  {
    number: "3",
    title: "Pick up at the store",
    description:
      "Come during the pickup window at the venue address. You save food and money.",
  },
] as const;

export function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="section-band py-14 sm:py-20"
    >
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            How it works
          </p>
          <h2
            id="how-it-works-heading"
            className="mt-3 font-display text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl"
          >
            Three steps to a great deal
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted">
            A simple path for buyers — no extra apps or hidden terms.
          </p>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li
              key={step.number}
              className="relative rounded-3xl border border-brand/10 bg-surface p-6 shadow-[0_20px_50px_-40px_rgba(27,67,50,0.35)]"
            >
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-brand/10 font-display text-lg font-semibold text-brand"
                aria-hidden
              >
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-brand-dark">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <ButtonLink href="/offers" variant="primary" className="min-h-12 px-8">
            Browse catalog
          </ButtonLink>
          <ButtonLink href="/register" variant="secondary" className="min-h-12 px-8">
            Become a seller partner
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
