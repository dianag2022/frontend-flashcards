import type { Category, Deck } from "@/types/api";

export function sortDecksByOrder(decks: Deck[]): Deck[] {
  return [...decks].sort((a, b) => {
    if (a.order != null && b.order != null && a.order !== b.order) {
      return a.order - b.order;
    }
    if (a.order != null && b.order == null) return -1;
    if (a.order == null && b.order != null) return 1;
    return 0;
  });
}

function timestamp(value?: string): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function sortCategoriesNewestFirst(categories: Category[]): Category[] {
  return [...categories].sort((a, b) => {
    const aTime = timestamp(a.createdAt ?? a.updatedAt);
    const bTime = timestamp(b.createdAt ?? b.updatedAt);
    if (bTime !== aTime) return bTime - aTime;
    return b.id.localeCompare(a.id);
  });
}
