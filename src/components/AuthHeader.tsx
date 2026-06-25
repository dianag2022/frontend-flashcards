import { Logo } from "@/components/Logo";

export function AuthHeader({
  subtitle,
  panelNote,
}: {
  subtitle?: string;
  panelNote?: string;
}) {
  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <Logo size="lg" />
      {subtitle && <p className="mt-4 text-sm text-muted">{subtitle}</p>}
      {panelNote && <p className="mt-1 text-xs text-muted">{panelNote}</p>}
    </div>
  );
}
