type ErrorStateProps = {
  title?: string;
  description?: string;
};

export function ErrorState({
  title = "Could not load data",
  description = "Check your Sanity connection and environment variables, then refresh the page.",
}: ErrorStateProps) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center"
      role="alert"
    >
      <p className="font-medium text-red-900">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-red-800">{description}</p>
    </div>
  );
}
