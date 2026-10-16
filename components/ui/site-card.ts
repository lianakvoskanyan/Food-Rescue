/** Shared card surfaces for catalog tiles. */
export const siteCardBaseClass =
  "overflow-hidden rounded-3xl border border-brand/10 bg-surface/95 shadow-[0_18px_40px_-28px_rgba(27,67,50,0.45)] backdrop-blur-sm";

export const siteCardInteractiveClass = `${siteCardBaseClass} transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-[0_28px_50px_-24px_rgba(27,67,50,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand`;
