import type { ContentStatus, Deck, Flashcard } from "@/types/api";

const DECKS_KEY = "repaso_admin_decks";
const CARDS_KEY = "repaso_admin_cards";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const deckStore = {
  getDecks(): Deck[] {
    return readJson<Deck[]>(DECKS_KEY, []);
  },

  saveDecks(decks: Deck[]) {
    writeJson(DECKS_KEY, decks);
  },

  upsertDeck(deck: Deck) {
    const decks = deckStore.getDecks();
    const index = decks.findIndex((d) => d.id === deck.id);
    if (index >= 0) {
      decks[index] = deck;
    } else {
      decks.push(deck);
    }
    deckStore.saveDecks(decks);
    return deck;
  },

  removeDeck(id: string) {
    deckStore.saveDecks(deckStore.getDecks().filter((d) => d.id !== id));
    deckStore.saveCards(
      deckStore.getCards().filter((c) => c.deckId !== id),
    );
  },

  reorderDecks(orderedIds: string[]) {
    const map = new Map(deckStore.getDecks().map((d) => [d.id, d]));
    const reordered = orderedIds
      .map((id, index) => {
        const deck = map.get(id);
        return deck ? { ...deck, order: index } : null;
      })
      .filter(Boolean) as Deck[];
    const remaining = deckStore
      .getDecks()
      .filter((d) => !orderedIds.includes(d.id));
    deckStore.saveDecks([...reordered, ...remaining]);
  },

  mergeDecks(remote: Deck[]): Deck[] {
    const local = deckStore.getDecks();
    const map = new Map<string, Deck>();

    for (const deck of remote) {
      map.set(deck.id, deck);
    }
    for (const deck of local) {
      const existing = map.get(deck.id);
      if (!existing || deck.status === "draft") {
        map.set(deck.id, { ...existing, ...deck });
      }
    }

    const merged = Array.from(map.values()).sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );
    deckStore.saveDecks(merged);
    return merged;
  },

  getCards(): Flashcard[] {
    return readJson<Flashcard[]>(CARDS_KEY, []);
  },

  getCardsByDeck(deckId: string): Flashcard[] {
    return deckStore
      .getCards()
      .filter((c) => c.deckId === deckId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  },

  saveCards(cards: Flashcard[]) {
    writeJson(CARDS_KEY, cards);
  },

  upsertCard(card: Flashcard) {
    const cards = deckStore.getCards();
    const index = cards.findIndex((c) => c.id === card.id);
    if (index >= 0) {
      cards[index] = card;
    } else {
      cards.push(card);
    }
    deckStore.saveCards(cards);
    return card;
  },

  removeCard(id: string) {
    deckStore.saveCards(deckStore.getCards().filter((c) => c.id !== id));
  },

  mergeCards(deckId: string, remote: Flashcard[]): Flashcard[] {
    const local = deckStore.getCards().filter((c) => c.deckId === deckId);
    const map = new Map<string, Flashcard>();

    for (const card of remote) {
      map.set(card.id, card);
    }
    for (const card of local) {
      const existing = map.get(card.id);
      if (!existing) {
        map.set(card.id, card);
      } else {
        map.set(card.id, { ...existing, ...card, status: card.status });
      }
    }

    const other = deckStore.getCards().filter((c) => c.deckId !== deckId);
    const merged = [
      ...other,
      ...Array.from(map.values()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    ];
    deckStore.saveCards(merged);
    return deckStore.getCardsByDeck(deckId);
  },

  updateDeckCardCount(deckId: string) {
    const count = deckStore.getCardsByDeck(deckId).length;
    const decks = deckStore.getDecks().map((d) =>
      d.id === deckId ? { ...d, cardCount: count, updatedAt: new Date().toISOString() } : d,
    );
    deckStore.saveDecks(decks);
  },
};
