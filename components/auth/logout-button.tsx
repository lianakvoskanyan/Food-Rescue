import { logoutAction } from "@/lib/auth/actions";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className = "",
  label = "Sign out",
}: LogoutButtonProps) {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className={`text-sm font-medium text-brand-dark transition-colors hover:text-brand ${className}`}
      >
        {label}
      </button>
    </form>
  );
}
