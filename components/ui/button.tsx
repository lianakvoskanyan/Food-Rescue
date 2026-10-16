import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { toNextLinkHref } from "@/lib/nav/normalize-nav-href";

const baseStyles =
  "inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition-[transform,box-shadow,background-color,border-color] duration-200 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

type ButtonVariant = "primary" | "secondary" | "ghost";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-br from-brand to-brand-dark text-white shadow-[0_12px_28px_-12px_rgba(27,67,50,0.65)] hover:shadow-[0_16px_32px_-12px_rgba(27,67,50,0.55)] hover:brightness-105",
  secondary:
    "border border-brand/15 bg-surface/90 text-brand-dark shadow-sm backdrop-blur-sm hover:border-brand/30 hover:bg-surface",
  ghost: "text-brand-dark hover:bg-brand/8",
};

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className" | "children">;

type AppLinkHref = ComponentProps<typeof Link>["href"];

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  const linkHref: AppLinkHref = toNextLinkHref(href);

  return (
    <Link
      href={linkHref}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
}
