"use client";

import Link from "next/link";
import { FolderOpen, Plus, Sparkles, Trash2 } from "lucide-react";
import { IconButton, iconLinkClass } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { countByStatus } from "@/lib/deck-status";
import type { Category, Flashcard } from "@/types/api";

const CATEGORY_ACCENTS = [
  {
    bar: "border-l-brand-teal",
    chip: "bg-brand-teal/10 text-brand-teal",
    header: "from-brand-teal/10 to-transparent",
  },
  {
    bar: "border-l-brand-blue",
    chip: "bg-brand-blue/10 text-brand-blue",
    header: "from-brand-blue/10 to-transparent",
  },
  {
    bar: "border-l-brand-purple",
    chip: "bg-brand-purple/10 text-brand-purple",
    header: "from-brand-purple/10 to-transparent",
  },
  {
    bar: "border-l-brand-link",
    chip: "bg-brand-link/10 text-brand-link",
    header: "from-brand-link/10 to-transparent",
  },
] as const;

function accentFor(id: string) {
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CATEGORY_ACCENTS[index % CATEGORY_ACCENTS.length];
}

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
  onDeleteCategory: (id: string) => Promise<void>;
  busyId?: string | null;
  deleting?: boolean;
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
  onDeleteCategory,
  busyId,
  deleting,
}: CategorySectionProps) {
  const counts = countByStatus(cards);
  const accent = accentFor(category.id);

  return (
    <section
      id={`category-${category.id}`}
      className={`scroll-mt-6 overflow-hidden rounded-2xl border border-border bg-card card-shadow border-l-4 ${accent.bar}`}
    >
      <div className={`bg-gradient-to-r ${accent.header} p-4 sm:p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <FolderOpen className="h-5 w-5 shrink-0 text-muted" />
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <StatusBadge status={category.status} />
            </div>
            {category.description && (
              <p className="text-sm text-muted">{category.description}</p>
            )}
            <p className="mt-1.5 text-xs text-muted">
              {counts.total} tarjeta{counts.total === 1 ? "" : "s"} ·{" "}
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
            <IconButton
              label="Eliminar categoría"
              variant="danger"
              loading={deleting}
              onClick={() => onDeleteCategory(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-background/70 p-3 sm:p-4">
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
          nested
          categoryLabel={category.title}
          categoryChipClass={accent.chip}
          emptyMessage="No hay tarjetas en esta categoría."
        />
      </div>
    </section>
  );
}
