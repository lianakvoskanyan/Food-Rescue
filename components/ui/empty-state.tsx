import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: ReactNode;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div
      className="glass-panel border-dashed border-brand/20 px-6 py-12 text-center"
      role="status"
    >
      <p className="font-medium text-brand-dark">{title}</p>
      <div className="mt-2 text-sm leading-relaxed text-muted">{description}</div>
    </div>
  );
}
