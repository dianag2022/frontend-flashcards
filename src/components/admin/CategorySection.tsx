"use client";

import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  EyeOff,
  FolderOpen,
  Plus,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import { IconButton, iconLinkClass } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { ColorPicker } from "@/components/admin/ColorPicker";
import { countByStatus, isDraftStatus } from "@/lib/deck-status";
import { categoryColor, withAlpha } from "@/lib/category-colors";
import type { Category, Flashcard } from "@/types/api";

interface CategorySectionProps {
  category: Category;
  deckId: string;
  cards: Flashcard[];
  selectedIds: Set<string>;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onPublishCard: (id: string) => Promise<void>;
  onDraftCard: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
  onPublishCategory: (id: string) => Promise<void>;
  onDraftCategory: (id: string) => Promise<void>;
  onChangeColor: (id: string, color: string) => Promise<void>;
  busyId?: string | null;
  deleting?: boolean;
  publishing?: boolean;
  drafting?: boolean;
}

export function CategorySection({
  category,
  deckId,
  cards,
  selectedIds,
  collapsed,
  onToggleCollapse,
  onToggleSelect,
  onToggleSelectAll,
  onPublishCard,
  onDraftCard,
  onDelete,
  onDeleteCategory,
  onPublishCategory,
  onDraftCategory,
  onChangeColor,
  busyId,
  deleting,
  publishing,
  drafting,
}: CategorySectionProps) {
  const counts = countByStatus(cards);
  const color = categoryColor(category);
  const isDraft = isDraftStatus(category.status);
  const categoryBusy = Boolean(deleting || publishing || drafting);

  return (
    <section
      id={`category-${category.id}`}
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-border bg-card card-shadow border-l-4"
      style={{ borderLeftColor: color }}
    >
      <div
        className="p-4 sm:p-5"
        style={{
          background: `linear-gradient(to right, ${withAlpha(color, 0.12)}, transparent)`,
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="min-w-0 flex-1 text-left"
            aria-expanded={!collapsed}
          >
            <div className="mb-1 flex flex-wrap items-center gap-2">
              {collapsed ? (
                <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
              ) : (
                <ChevronDown className="h-5 w-5 shrink-0 text-muted" />
              )}
              <FolderOpen className="h-5 w-5 shrink-0" style={{ color }} />
              <h2 className="text-lg font-semibold">{category.title}</h2>
              <StatusBadge status={category.status} />
            </div>
            {category.description && (
              <p className="pl-7 text-sm text-muted">{category.description}</p>
            )}
            <p className="mt-1.5 pl-7 text-xs text-muted">
              {counts.total} tarjeta{counts.total === 1 ? "" : "s"} ·{" "}
              {counts.published} publicada{counts.published === 1 ? "" : "s"} ·{" "}
              {counts.draft} borrador{counts.draft === 1 ? "" : "es"}
              {collapsed ? " · Pulsa para ver tarjetas" : ""}
            </p>
            {isDraft && counts.published > 0 && (
              <p className="mt-2 pl-7 text-xs font-medium text-amber-800">
                Hay tarjetas publicadas, pero el subtema sigue en borrador. La app no
                puede abrirlo hasta que publiques la categoría.
              </p>
            )}
          </button>
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
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
            {isDraft ? (
              <IconButton
                label="Publicar categoría"
                variant="secondary"
                loading={publishing}
                disabled={categoryBusy}
                onClick={() => onPublishCategory(category.id)}
              >
                <Upload className="h-4 w-4" />
              </IconButton>
            ) : (
              <IconButton
                label="Pasar categoría a borrador"
                loading={drafting}
                disabled={categoryBusy}
                onClick={() => onDraftCategory(category.id)}
              >
                <EyeOff className="h-4 w-4" />
              </IconButton>
            )}
            <IconButton
              label="Eliminar categoría"
              variant="danger"
              loading={deleting}
              disabled={categoryBusy}
              onClick={() => onDeleteCategory(category.id)}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-border bg-background/70 p-3 sm:p-4">
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-muted">Color del subtema</p>
            <ColorPicker
              compact
              value={color}
              onChange={(next) => onChangeColor(category.id, next)}
            />
          </div>
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
            categoryChipStyle={{
              backgroundColor: withAlpha(color, 0.12),
              color,
            }}
            emptyMessage="No hay tarjetas en esta categoría."
          />
        </div>
      )}
    </section>
  );
}
