"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export interface CategoryFormData {
  title: string;
  description: string;
}

interface CategoryFormProps {
  initial?: CategoryFormData;
  submitLabel: string;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel?: () => void;
}

export function CategoryForm({
  initial = { title: "", description: "" },
  submitLabel,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
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
      setError(err instanceof Error ? err.message : "Error al guardar la categoría.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Título de la categoría"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Ej. Memoria, Atención, Aprendizaje"
        required
      />
      <Textarea
        label="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Breve descripción del tema..."
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
