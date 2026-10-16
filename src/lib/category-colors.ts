export const DEFAULT_CATEGORY_COLOR = "#2eab95";

export const CATEGORY_COLORS = [
  { hex: "#2eab95", label: "Teal" },
  { hex: "#4a86c9", label: "Azul" },
  { hex: "#9b7fd4", label: "Violeta" },
  { hex: "#297197", label: "Petróleo" },
  { hex: "#e07a5f", label: "Coral" },
  { hex: "#81b29a", label: "Salvia" },
  { hex: "#e9c46a", label: "Mostaza" },
  { hex: "#f4a261", label: "Naranja" },
  { hex: "#e76f51", label: "Terracota" },
  { hex: "#2a9d8f", label: "Verde agua" },
  { hex: "#264653", label: "Navy" },
  { hex: "#e63946", label: "Rojo" },
  { hex: "#457b9d", label: "Acero" },
  { hex: "#1d3557", label: "Azul noche" },
  { hex: "#06d6a0", label: "Menta" },
  { hex: "#118ab2", label: "Cian" },
  { hex: "#ef476f", label: "Rosa" },
  { hex: "#ffd166", label: "Ámbar" },
  { hex: "#7b2cbf", label: "Púrpura" },
  { hex: "#fb8500", label: "Naranja vivo" },
  { hex: "#219ebc", label: "Celeste" },
  { hex: "#8ecae6", label: "Cielo" },
  { hex: "#d62828", label: "Carmesí" },
  { hex: "#6a994e", label: "Verde" },
  { hex: "#bc4749", label: "Granate" },
  { hex: "#6d597a", label: "Malva" },
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
