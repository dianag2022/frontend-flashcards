export const DEFAULT_DECK_EMOJI = "🧠";

export const DECK_EMOJIS = [
  { emoji: "🧠", label: "Cerebro", group: "Psicología y estudio" },
  { emoji: "❤️", label: "Corazón", group: "Psicología y estudio" },
  { emoji: "🫀", label: "Anatomía", group: "Psicología y estudio" },
  { emoji: "💡", label: "Idea", group: "Psicología y estudio" },
  { emoji: "📚", label: "Estudio", group: "Psicología y estudio" },
  { emoji: "🎯", label: "Enfoque", group: "Psicología y estudio" },
  { emoji: "🔬", label: "Ciencia", group: "Psicología y estudio" },
  { emoji: "🧩", label: "Cognición", group: "Psicología y estudio" },
  { emoji: "🧬", label: "Biología", group: "Psicología y estudio" },
  { emoji: "🧘", label: "Bienestar", group: "Psicología y estudio" },
  { emoji: "💭", label: "Pensamiento", group: "Psicología y estudio" },
  { emoji: "👁️", label: "Percepción", group: "Psicología y estudio" },
  { emoji: "🗣️", label: "Lenguaje", group: "Psicología y estudio" },
  { emoji: "🧒", label: "Desarrollo", group: "Psicología y estudio" },
  { emoji: "👨‍👩‍👧", label: "Familia", group: "Psicología y estudio" },
  { emoji: "🤝", label: "Social", group: "Psicología y estudio" },
  { emoji: "⚖️", label: "Ética", group: "Psicología y estudio" },
  { emoji: "🌙", label: "Sueño", group: "Psicología y estudio" },
  { emoji: "⚡", label: "Energía", group: "Psicología y estudio" },
  { emoji: "🌱", label: "Crecimiento", group: "Psicología y estudio" },
  { emoji: "🩺", label: "Clínica", group: "Psicología y estudio" },
  { emoji: "🧪", label: "Experimentos", group: "Psicología y estudio" },
  { emoji: "📝", label: "Evaluación", group: "Psicología y estudio" },
  { emoji: "🎭", label: "Emoción", group: "Psicología y estudio" },
  { emoji: "🎓", label: "Graduación", group: "Psicología y estudio" },
  { emoji: "📱", label: "Móvil", group: "Psicología y estudio" },
  { emoji: "💻", label: "Digital", group: "Psicología y estudio" },
  { emoji: "📘", label: "Texto", group: "Psicología y estudio" },
  { emoji: "📕", label: "Manual", group: "Psicología y estudio" },
  { emoji: "📒", label: "Apuntes", group: "Psicología y estudio" },
  { emoji: "📊", label: "Estadística", group: "Investigación y estadística" },
  { emoji: "📈", label: "Tendencia", group: "Investigación y estadística" },
  { emoji: "📉", label: "Descenso", group: "Investigación y estadística" },
  { emoji: "🔢", label: "Números", group: "Investigación y estadística" },
  { emoji: "🧮", label: "Cálculo", group: "Investigación y estadística" },
  { emoji: "📐", label: "Medición", group: "Investigación y estadística" },
  { emoji: "💪", label: "Fortaleza", group: "Motivación, logros y avisos" },
  { emoji: "💙", label: "Apoyo", group: "Motivación, logros y avisos" },
  { emoji: "💚", label: "Cuidado", group: "Motivación, logros y avisos" },
  { emoji: "🏆", label: "Logro", group: "Motivación, logros y avisos" },
  { emoji: "✨", label: "Brillo", group: "Motivación, logros y avisos" },
  { emoji: "🌟", label: "Destacado", group: "Motivación, logros y avisos" },
  { emoji: "🙌", label: "Ánimo", group: "Motivación, logros y avisos" },
  { emoji: "📣", label: "Anuncio", group: "Motivación, logros y avisos" },
  { emoji: "🔋", label: "Recarga", group: "Motivación, logros y avisos" },
  { emoji: "📌", label: "Importante", group: "Motivación, logros y avisos" },
  { emoji: "💌", label: "Mensaje", group: "Motivación, logros y avisos" },
  { emoji: "🔊", label: "Aviso", group: "Motivación, logros y avisos" },
  { emoji: "💬", label: "Comentario", group: "Motivación, logros y avisos" },
  { emoji: "🔔", label: "Notificación", group: "Motivación, logros y avisos" },
  { emoji: "🚀", label: "Impulso", group: "Aprendizaje y progreso" },
  { emoji: "🔑", label: "Clave", group: "Aprendizaje y progreso" },
  { emoji: "📖", label: "Lectura", group: "Aprendizaje y progreso" },
  { emoji: "🔎", label: "Búsqueda", group: "Aprendizaje y progreso" },
  { emoji: "🔓", label: "Acceso", group: "Aprendizaje y progreso" },
] as const;

export type DeckEmoji = (typeof DECK_EMOJIS)[number]["emoji"];

export const DECK_EMOJI_GROUPS = [
  "Psicología y estudio",
  "Investigación y estadística",
  "Motivación, logros y avisos",
  "Aprendizaje y progreso",
] as const;

export function isAllowedDeckEmoji(value: string): boolean {
  return DECK_EMOJIS.some((item) => item.emoji === value);
}

export function deckEmoji(deck: { emoji?: string | null }): string {
  const value = deck.emoji?.trim();
  if (value && isAllowedDeckEmoji(value)) return value;
  if (value) return value;
  return DEFAULT_DECK_EMOJI;
}
