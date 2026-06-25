"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { DeckCard } from "@/components/admin/DeckCard";
import type { Deck } from "@/types/api";

interface SortableDeckListProps {
  decks: Deck[];
  onReorder: (orderedIds: string[]) => void;
  onPublish?: (deck: Deck) => void;
  onDraft?: (deck: Deck) => void;
  publishingId?: string | null;
  draftingId?: string | null;
}

export function SortableDeckList({
  decks,
  onReorder,
  onPublish,
  onDraft,
  publishingId,
  draftingId,
}: SortableDeckListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = decks.findIndex((d) => d.id === active.id);
    const newIndex = decks.findIndex((d) => d.id === over.id);
    const reordered = arrayMove(decks, oldIndex, newIndex);
    onReorder(reordered.map((d) => d.id));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={decks.map((d) => d.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {decks.map((deck) => (
            <DeckCard
              key={deck.id}
              deck={deck}
              sortable
              onPublish={onPublish}
              onDraft={onDraft}
              publishingId={publishingId}
              draftingId={draftingId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
