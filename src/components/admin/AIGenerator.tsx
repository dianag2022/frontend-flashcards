"use client";

import { useState } from "react";
import { Sparkles, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { DraftFlashcardPair } from "@/types/api";

interface AIGeneratorProps {
  onApprove: (cards: { front: string; back: string }[]) => Promise<void>;
}

export function AIGenerator({ onApprove }: AIGeneratorProps) {
  const [text, setText] = useState("");
  const [drafts, setDrafts] = useState<DraftFlashcardPair[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  async function handleGenerate() {
    if (!text.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al generar tarjetas");
      setDrafts(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al generar tarjetas");
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(index: number, field: "front" | "back", value: string) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
    );
  }

  function toggleApprove(index: number) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, approved: !d.approved } : d)),
    );
  }

  async function handleSaveApproved() {
    const approved = drafts.filter((d) => d.approved);
    if (approved.length === 0) {
      setError("Aprueba al menos una tarjeta antes de guardar.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onApprove(approved.map(({ front, back }) => ({ front, back })));
      setDrafts([]);
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar tarjetas");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold">Generación con IA</h2>
        </div>
        <p className="mb-4 text-sm text-muted">
          Pega texto de psicología y la IA generará borradores de tarjetas para que
          revises, edites y apruebes antes de publicar.
        </p>
        <Textarea
          label="Texto fuente"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Pega aquí apuntes, definiciones o contenido de un capítulo..."
          className="min-h-48"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <div className="mt-4">
          <Button onClick={handleGenerate} loading={loading}>
            <Sparkles className="h-4 w-4" />
            Generar borradores
          </Button>
        </div>
      </Card>

      {drafts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Borradores ({drafts.filter((d) => d.approved).length}/{drafts.length}{" "}
              aprobados)
            </h3>
            <Button onClick={handleSaveApproved} loading={saving}>
              <Check className="h-4 w-4" />
              Guardar aprobadas como borrador
            </Button>
          </div>
          {drafts.map((draft, index) => (
            <Card
              key={index}
              className={`p-5 ${draft.approved ? "ring-2 ring-brand-teal/30" : ""}`}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium text-muted">
                  Borrador #{index + 1}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="px-3 py-2"
                    onClick={() =>
                      setEditingIndex(editingIndex === index ? null : index)
                    }
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant={draft.approved ? "primary" : "secondary"}
                    className="px-3 py-2"
                    onClick={() => toggleApprove(index)}
                  >
                    <Check className="h-4 w-4" />
                    {draft.approved ? "Aprobada" : "Aprobar"}
                  </Button>
                </div>
              </div>
              {editingIndex === index ? (
                <div className="space-y-3">
                  <Input
                    label="Frente"
                    value={draft.front}
                    onChange={(e) => updateDraft(index, "front", e.target.value)}
                  />
                  <Textarea
                    label="Reverso"
                    value={draft.back}
                    onChange={(e) => updateDraft(index, "back", e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <p className="mb-2 font-medium">{draft.front}</p>
                  <p className="text-sm text-muted">{draft.back}</p>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
