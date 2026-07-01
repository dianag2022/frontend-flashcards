"use client";

import Link from "next/link";
import { Plus, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { iconLinkClass } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { countByStatus } from "@/lib/deck-status";
import type { Category, Flashcard } from "@/types/api";

interface CategorySectionProps {
  category: Category;
  deckId: string;
  cards: Flashcard[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPublishCard: (id: string) => Promise<void>;
  onDraftCard: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  busyId?: string | null;
}

export function CategorySection({
  category,
  deckId,
  cards,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onPublishCard,
  onDraftCard,
  onDelete,
  busyId,
}: CategorySectionProps) {
  const counts = countByStatus(cards);

  return (
    <section className="space-y-3">
      <Card className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <StatusBadge status={category.status} />
            </div>
            <p className="text-sm text-muted">{category.description}</p>
            <p className="mt-1.5 text-xs text-muted">
              {counts.published} publicada{counts.published === 1 ? "" : "s"} ·{" "}
              {counts.draft} borrador{counts.draft === 1 ? "" : "es"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href={`/admin/decks/${deckId}/cards/new?categoryId=${category.id}`}
              title="Nueva tarjeta"
              aria-label="Nueva tarjeta"
              className={iconLinkClass("primary")}
            >
              <Plus className="h-4 w-4 text-white" />
            </Link>
            <Link
              href={`/admin/decks/${deckId}/ai?categoryId=${category.id}`}
              title="Generar con IA"
              aria-label="Generar con IA"
              className={iconLinkClass("secondary")}
            >
              <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Card>

      <FlashcardList
        cards={cards}
        deckId={deckId}
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
        onPublishCard={onPublishCard}
        onDraftCard={onDraftCard}
        onDelete={onDelete}
        busyId={busyId}
        emptyMessage="No hay tarjetas en esta categoría."
      />
    </section>
  );
}
