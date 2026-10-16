"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageField } from "@/components/admin/ImageField";
import { isRichTextEmpty } from "@/lib/rich-text";

export interface FlashcardFormData {
  front: string;
  back: string;
  frontImageUrl?: string;
  backImageUrl?: string;
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
  const [frontImageUrl, setFrontImageUrl] = useState(initial.frontImageUrl ?? "");
  const [backImageUrl, setBackImageUrl] = useState(initial.backImageUrl ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isRichTextEmpty(front) || isRichTextEmpty(back)) {
      setError("Completa el frente y el reverso de la tarjeta.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await onSubmit({
        front,
        back,
        frontImageUrl: frontImageUrl || undefined,
        backImageUrl: backImageUrl || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar la tarjeta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <RichTextEditor
        label="Frente (pregunta / término)"
        value={front}
        onChange={setFront}
        placeholder="¿Qué es la memoria de trabajo?"
      />
      <ImageField
        label="Imagen del frente (opcional)"
        value={frontImageUrl}
        onChange={setFrontImageUrl}
      />
      <RichTextEditor
        label="Reverso (respuesta / definición)"
        value={back}
        onChange={setBack}
        placeholder="Sistema de capacidad limitada para almacenamiento temporal..."
      />
      <ImageField
        label="Imagen del reverso (opcional)"
        value={backImageUrl}
        onChange={setBackImageUrl}
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
