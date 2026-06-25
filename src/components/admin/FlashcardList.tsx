"use client";

import Link from "next/link";
import { EyeOff, Pencil, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconButton, iconLinkClass } from "@/components/ui/IconButton";
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
    <div className="space-y-3">
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
        {selectedIds.size > 0 && (
          <span>{selectedIds.size} seleccionada{selectedIds.size === 1 ? "" : "s"}</span>
        )}
      </div>

      {cards.map((card) => {
        const isBusy = busyId === card.id;
        const isDraft = card.status !== "published";

        return (
          <Card
            key={card.id}
            className={`p-4 ${selectedIds.has(card.id) ? "ring-2 ring-brand-teal/30" : ""}`}
          >
            <div className="mb-2 flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.has(card.id)}
                  onChange={() => onToggleSelect(card.id)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-border accent-brand-teal"
                />
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <StatusBadge status={card.status} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{card.front}</p>
                  <p className="mt-1 text-sm text-muted">{card.back}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {isDraft ? (
                  <IconButton
                    label="Publicar tarjeta"
                    variant="secondary"
                    disabled={isBusy}
                    loading={isBusy}
                    onClick={() => onPublishCard(card.id)}
                  >
                    <Upload className="h-4 w-4" />
                  </IconButton>
                ) : (
                  <IconButton
                    label="Pasar a borrador"
                    disabled={isBusy}
                    loading={isBusy}
                    onClick={() => onDraftCard(card.id)}
                  >
                    <EyeOff className="h-4 w-4" />
                  </IconButton>
                )}
                <Link
                  href={`/admin/decks/${deckId}/cards/${card.id}/edit`}
                  title="Editar tarjeta"
                  aria-label="Editar tarjeta"
                  className={iconLinkClass()}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <IconButton
                  label="Eliminar tarjeta"
                  variant="danger"
                  disabled={isBusy}
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
