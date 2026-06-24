"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface DeckFormData {
  title: string;
  description: string;
}

interface DeckFormProps {
  initial?: DeckFormData;
  submitLabel: string;
  onSubmit: (data: DeckFormData) => Promise<void>;
  onCancel?: () => void;
}

export function DeckForm({
  initial = { title: "", description: "" },
  submitLabel,
  onSubmit,
  onCancel,
}: DeckFormProps) {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
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
      await onSubmit({ title: title.trim(), description: description.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el mazo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Título del mazo"
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
