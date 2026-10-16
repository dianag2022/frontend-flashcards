"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { EmojiPicker } from "@/components/admin/EmojiPicker";
import { DEFAULT_DECK_EMOJI, isAllowedDeckEmoji } from "@/lib/deck-emojis";

interface DeckFormData {
  title: string;
  description: string;
  emoji: string;
}

interface DeckFormProps {
  initial?: Partial<DeckFormData>;
  submitLabel: string;
  onSubmit: (data: DeckFormData) => Promise<void>;
  onCancel?: () => void;
}

export function DeckForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: DeckFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [emoji, setEmoji] = useState(
    initial?.emoji && isAllowedDeckEmoji(initial.emoji)
      ? initial.emoji
      : DEFAULT_DECK_EMOJI,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Completa todos los campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        emoji,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el Deck.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Título del Deck"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ej. Teorías psicológicas"
        required
      />
      <Textarea
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Freud, Skinner, Piaget..."
        required
      />
      <EmojiPicker value={emoji} onChange={setEmoji} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
