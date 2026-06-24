import type { ContentStatus, Flashcard } from "@/types/api";

export function isDraftStatus(status: ContentStatus | undefined): boolean {
  return status !== "published";
}

export function isDraftDeck(deck: { status?: ContentStatus }): boolean {
  return isDraftStatus(deck.status);
}

export function countByStatus(cards: Flashcard[]) {
  const published = cards.filter((c) => c.status === "published").length;
  return { published, draft: cards.length - published, total: cards.length };
}
