import { sanitizeRichText } from "@/lib/rich-text";

export function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const safe = sanitizeRichText(html);
  if (!safe) return null;

  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
