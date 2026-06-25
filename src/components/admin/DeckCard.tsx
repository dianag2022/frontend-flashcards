"use client";

import Link from "next/link";
import { ChevronRight, EyeOff, GripVertical, Upload } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/Card";
import { IconButton } from "@/components/ui/IconButton";
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
  onDraft,
  publishingId,
  draftingId,
}: {
  deck: Deck;
  sortable?: boolean;
  onPublish?: (deck: Deck) => void;
  onDraft?: (deck: Deck) => void;
  publishingId?: string | null;
  draftingId?: string | null;
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
  const isDrafting = draftingId === deck.id;

  const card = (
    <Card className="flex items-center gap-3 p-4 transition hover:shadow-md">
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
      <Link
        href={`/admin/decks/${deck.id}`}
        className="flex min-w-0 flex-1 items-center gap-4"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-teal/10 text-lg">
          {iconForDeck(deck.id)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-foreground">{deck.title}</h3>
            <StatusBadge status={deck.status} />
          </div>
          <p className="line-clamp-1 text-sm text-muted">{deck.description}</p>
          <p className="mt-1.5 text-xs text-muted">
            {deck.cardCount} tarjeta{deck.cardCount === 1 ? "" : "s"}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
      </Link>
      {isDraft && onPublish && (
        <IconButton
          label="Publicar mazo"
          variant="secondary"
          loading={isPublishing}
          onClick={() => onPublish(deck)}
        >
          <Upload className="h-4 w-4" />
        </IconButton>
      )}
      {!isDraft && onDraft && (
        <IconButton
          label="Pasar a borrador"
          variant="secondary"
          loading={isDrafting}
          onClick={() => onDraft(deck)}
        >
          <EyeOff className="h-4 w-4" />
        </IconButton>
      )}
    </Card>
  );

  if (sortable) {
    return (
      <div ref={sortableHook.setNodeRef} style={style}>
        {card}
      </div>
    );
  }

  return card;
}

export function DeckCard({
  deck,
  sortable = false,
  onPublish,
  onDraft,
  publishingId,
  draftingId,
}: {
  deck: Deck;
  sortable?: boolean;
  onPublish?: (deck: Deck) => void;
  onDraft?: (deck: Deck) => void;
  publishingId?: string | null;
  draftingId?: string | null;
}) {
  return (
    <DeckCardContent
      deck={deck}
      sortable={sortable}
      onPublish={onPublish}
      onDraft={onDraft}
      publishingId={publishingId}
      draftingId={draftingId}
    />
  );
}
