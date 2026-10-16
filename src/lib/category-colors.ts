export const DEFAULT_CATEGORY_COLOR = "#2eab95";

export const CATEGORY_COLORS = [
  { hex: "#2eab95", label: "Teal" },
  { hex: "#4a86c9", label: "Azul" },
  { hex: "#9b7fd4", label: "Violeta" },
  { hex: "#e07a5f", label: "Coral" },
  { hex: "#e9c46a", label: "Mostaza" },
  { hex: "#ef476f", label: "Rosa" },
  { hex: "#264653", label: "Navy" },
  { hex: "#fb8500", label: "Naranja" },
  { hex: "#6a994e", label: "Verde" },
  { hex: "#118ab2", label: "Cian" },
] as const;

export function isAllowedCategoryColor(value: string): boolean {
  const hex = value.trim().toLowerCase();
  return CATEGORY_COLORS.some((item) => item.hex.toLowerCase() === hex);
}

export function withAlpha(hex: string, alpha: number): string {
  const normalized = hex.replace("#", "").slice(0, 6);
  const a = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, "0");
  return `#${normalized}${a}`;
}

export function categoryColor(category: { id: string; color?: string | null }): string {
  const value = category.color?.trim();
  if (value && /^#([0-9a-f]{6})$/i.test(value)) return value;
  const index = category.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length].hex;
}

export function categoryColorLabel(hex: string): string {
  return (
    CATEGORY_COLORS.find((item) => item.hex.toLowerCase() === hex.toLowerCase())
      ?.label ?? hex
  );
}
