import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "brand-gradient text-white hover:opacity-90 shadow-sm disabled:opacity-60 [&_svg]:text-white",
  secondary:
    "bg-white text-foreground border border-border hover:bg-background",
  ghost: "bg-transparent text-muted hover:bg-background hover:text-foreground",
  danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100",
};

export function IconButton({
  label,
  variant = "ghost",
  loading,
  className = "",
  children,
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-pulse rounded-full bg-current opacity-40" />
      ) : (
        children
      )}
    </button>
  );
}

export function iconLinkClass(variant: Variant = "ghost") {
  return `inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${variants[variant]}`;
}
