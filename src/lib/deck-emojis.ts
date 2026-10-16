export const DEFAULT_DECK_EMOJI = "🧠";

export const DECK_EMOJIS = [
  { emoji: "🧠", label: "Cerebro" },
  { emoji: "❤️", label: "Corazón" },
  { emoji: "🫀", label: "Anatomía" },
  { emoji: "💡", label: "Idea" },
  { emoji: "📚", label: "Estudio" },
  { emoji: "🎯", label: "Enfoque" },
  { emoji: "🔬", label: "Ciencia" },
  { emoji: "🧩", label: "Cognición" },
  { emoji: "🧬", label: "Biología" },
  { emoji: "🧘", label: "Bienestar" },
  { emoji: "💭", label: "Pensamiento" },
  { emoji: "👁️", label: "Percepción" },
  { emoji: "🗣️", label: "Lenguaje" },
  { emoji: "🧒", label: "Desarrollo" },
  { emoji: "👨‍👩‍👧", label: "Familia" },
  { emoji: "🤝", label: "Social" },
  { emoji: "⚖️", label: "Ética" },
  { emoji: "🌙", label: "Sueño" },
  { emoji: "⚡", label: "Energía" },
  { emoji: "🌱", label: "Crecimiento" },
  { emoji: "🩺", label: "Clínica" },
  { emoji: "🧪", label: "Experimentos" },
  { emoji: "📝", label: "Evaluación" },
  { emoji: "🎭", label: "Emoción" },
] as const;

export type DeckEmoji = (typeof DECK_EMOJIS)[number]["emoji"];

export function isAllowedDeckEmoji(value: string): boolean {
  return DECK_EMOJIS.some((item) => item.emoji === value);
}

export function deckEmoji(deck: { emoji?: string | null }): string {
  const value = deck.emoji?.trim();
  if (value && isAllowedDeckEmoji(value)) return value;
  if (value) return value;
  return DEFAULT_DECK_EMOJI;
}
