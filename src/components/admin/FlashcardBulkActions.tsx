"use client";

import { EyeOff, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface FlashcardBulkActionsProps {
  selectedCount: number;
  publishing: boolean;
  drafting: boolean;
  onPublishSelected: () => void;
  onDraftSelected: () => void;
  onClearSelection: () => void;
}

export function FlashcardBulkActions({
  selectedCount,
  publishing,
  drafting,
  onPublishSelected,
  onDraftSelected,
  onClearSelection,
}: FlashcardBulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <Card className="mb-4 flex flex-wrap items-center justify-between gap-3 border-brand-teal/30 bg-brand-teal/5 p-4">
      <p className="text-sm font-medium">
        {selectedCount} tarjeta{selectedCount === 1 ? "" : "s"} seleccionada
        {selectedCount === 1 ? "" : "s"}
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="px-3 py-2 text-sm"
          loading={publishing}
          onClick={onPublishSelected}
        >
          <Upload className="h-4 w-4" />
          Publicar seleccionadas
        </Button>
        <Button
          variant="ghost"
          className="px-3 py-2 text-sm"
          loading={drafting}
          onClick={onDraftSelected}
        >
          <EyeOff className="h-4 w-4" />
          Pasar a borrador
        </Button>
        <Button variant="ghost" className="px-3 py-2 text-sm" onClick={onClearSelection}>
          Limpiar
        </Button>
      </div>
    </Card>
  );
}
