type SectionHeaderProps = {
  title: string;
  description?: string;
  id?: string;
};

export function SectionHeader({ title, description, id }: SectionHeaderProps) {
  return (
    <header className="mb-10 max-w-2xl space-y-3">
      <div className="flex items-center gap-3">
        <span
          className="h-8 w-1 rounded-full bg-gradient-to-b from-brand to-accent"
          aria-hidden
        />
        <h2 id={id} className="font-display text-3xl font-semibold tracking-tight text-brand-dark sm:text-4xl">
          {title}
        </h2>
      </div>
      {description ? (
        <p className="pl-4 text-base leading-relaxed text-muted sm:text-lg">{description}</p>
      ) : null}
    </header>
  );
}
