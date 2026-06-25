import type { ContentStatus } from "@/types/api";

export function StatusBadge({ status }: { status: ContentStatus }) {
  const styles =
    status === "published"
      ? "bg-brand-teal/10 text-brand-teal"
      : "bg-amber-50 text-amber-700";

  const label = status === "published" ? "Publicado" : "Borrador";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}
