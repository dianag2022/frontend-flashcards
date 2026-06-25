"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

interface FlashcardFormData {
  front: string;
  back: string;
}

interface FlashcardFormProps {
  initial?: FlashcardFormData;
  submitLabel: string;
  onSubmit: (data: FlashcardFormData) => Promise<void>;
  onCancel?: () => void;
}

export function FlashcardForm({
  initial = { front: "", back: "" },
  submitLabel,
  onSubmit,
  onCancel,
}: FlashcardFormProps) {
  const [front, setFront] = useState(initial.front);
  const [back, setBack] = useState(initial.back);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) {
      setError("Completa el frente y el reverso de la tarjeta.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({ front: front.trim(), back: back.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la tarjeta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Frente (pregunta / término)"
        value={front}
        onChange={(e) => setFront(e.target.value)}
        placeholder="¿Qué es la memoria de trabajo?"
        required
      />
      <Textarea
        label="Reverso (respuesta / definición)"
        value={back}
        onChange={(e) => setBack(e.target.value)}
        placeholder="Sistema de capacidad limitada para almacenamiento temporal..."
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
