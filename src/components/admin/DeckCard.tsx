"use client";

import Link from "next/link";
import { ChevronRight, GripVertical, Upload } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { isDraftDeck } from "@/lib/deck-status";
import type { Deck } from "@/types/api";

const ICONS = ["🧠", "💡", "📚", "🎯", "🔬", "🧩"];

function iconForDeck(id: string) {
  const index = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return ICONS[index % ICONS.length];
}

function DeckCardContent({
  deck,
  sortable,
  onPublish,
  publishingId,
}: {
  deck: Deck;
  sortable?: boolean;
  onPublish?: (deck: Deck) => void;
  publishingId?: string | null;
}) {
  const sortableHook = useSortable({ id: deck.id, disabled: !sortable });
  const style = sortable
    ? {
        transform: CSS.Transform.toString(sortableHook.transform),
        transition: sortableHook.transition,
      }
    : undefined;

  const isDraft = isDraftDeck(deck);
  const isPublishing = publishingId === deck.id;

  const cardBody = (
    <Card className="flex items-center gap-4 p-5 transition hover:shadow-md">
      {sortable && (
        <button
          type="button"
          className="cursor-grab text-muted active:cursor-grabbing"
          {...sortableHook.attributes}
          {...sortableHook.listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>
      )}
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-xl">
        {iconForDeck(deck.id)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">{deck.title}</h3>
          <StatusBadge status={deck.status} />
        </div>
        <p className="line-clamp-2 text-sm text-muted">{deck.description}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 max-w-32 flex-1 overflow-hidden rounded-full bg-border">
            <div
              className="progress-gradient h-full rounded-full"
              style={{ width: `${Math.min(deck.cardCount * 10, 100)}%` }}
            />
          </div>
          <span className="text-xs text-muted">
            {deck.cardCount} tarjeta{deck.cardCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
    </Card>
  );

  const wrapper = (
    <div className="space-y-2">
      <Link href={`/admin/decks/${deck.id}`}>{cardBody}</Link>
      {isDraft && onPublish && (
        <div className="flex justify-end px-1">
          <Button
            variant="secondary"
            className="px-4 py-2 text-sm"
            onClick={() => onPublish(deck)}
            loading={isPublishing}
          >
            <Upload className="h-4 w-4" />
            Publicar mazo
          </Button>
        </div>
      )}
    </div>
  );

  if (sortable) {
    return (
      <div ref={sortableHook.setNodeRef} style={style}>
        {wrapper}
      </div>
    );
  }

  return wrapper;
}

export function DeckCard({
  deck,
  sortable = false,
  onPublish,
  publishingId,
}: {
  deck: Deck;
  sortable?: boolean;
  onPublish?: (deck: Deck) => void;
  publishingId?: string | null;
}) {
  return (
    <DeckCardContent
      deck={deck}
      sortable={sortable}
      onPublish={onPublish}
      publishingId={publishingId}
    />
  );
}
