"use client";

import Link from "next/link";
import { EyeOff, Pencil, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Flashcard } from "@/types/api";

interface FlashcardListProps {
  cards: Flashcard[];
  deckId: string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPublishCard: (id: string) => Promise<void>;
  onDraftCard: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busyId?: string | null;
}

export function FlashcardList({
  cards,
  deckId,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPublishCard,
  onDraftCard,
  onDelete,
  busyId,
}: FlashcardListProps) {
  if (cards.length === 0) {
    return (
      <Card className="p-8 text-center text-muted">
        No hay tarjetas en este mazo. Crea una manualmente o usa la generación con IA.
      </Card>
    );
  }

  const allSelected = cards.every((c) => selectedIds.has(c.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1 text-sm text-muted">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onToggleSelectAll}
            className="h-4 w-4 rounded border-border accent-brand-teal"
          />
          Seleccionar todas
        </label>
        <span>{selectedIds.size} seleccionada{selectedIds.size === 1 ? "" : "s"}</span>
      </div>

      {cards.map((card) => {
        const isBusy = busyId === card.id;
        const isDraft = card.status !== "published";

        return (
          <Card
            key={card.id}
            className={`p-5 ${selectedIds.has(card.id) ? "ring-2 ring-brand-teal/30" : ""}`}
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(card.id)}
                  onChange={() => onToggleSelect(card.id)}
                  className="h-4 w-4 rounded border-border accent-brand-teal"
                />
                <StatusBadge status={card.status} />
              </div>
              <div className="flex flex-wrap gap-2">
                {isDraft ? (
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    disabled={isBusy}
                    onClick={() => onPublishCard(card.id)}
                  >
                    <Upload className="h-4 w-4" />
                    Publicar
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    className="px-3 py-2"
                    disabled={isBusy}
                    onClick={() => onDraftCard(card.id)}
                  >
                    <EyeOff className="h-4 w-4" />
                    Pasar a borrador
                  </Button>
                )}
                <Link href={`/admin/decks/${deckId}/cards/${card.id}/edit`}>
                  <Button variant="ghost" className="px-3 py-2">
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  className="px-3 py-2"
                  disabled={isBusy}
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
            <p className="mb-2 text-sm font-semibold text-foreground">{card.front}</p>
            <p className="text-sm text-muted">{card.back}</p>
          </Card>
        );
      })}
    </div>
  );
}
