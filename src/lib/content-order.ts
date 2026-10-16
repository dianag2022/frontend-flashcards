import type { Category, Deck, Flashcard } from "@/types/api";

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

function newestFirst<T extends { id: string; updatedAt?: string; createdAt?: string }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aTime = timestamp(a.updatedAt ?? a.createdAt);
    const bTime = timestamp(b.updatedAt ?? b.createdAt);
    if (bTime !== aTime) return bTime - aTime;
    return b.id.localeCompare(a.id);
  });
}

export function sortCategoriesNewestFirst(categories: Category[]): Category[] {
  return newestFirst(categories);
}

export function sortFlashcardsNewestFirst(cards: Flashcard[]): Flashcard[] {
  return newestFirst(cards);
}
