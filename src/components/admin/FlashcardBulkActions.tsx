"use client";

import { EyeOff, Upload, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

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
    <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-brand-teal/20 bg-brand-teal/5 px-4 py-2.5">
      <p className="text-sm text-muted">
        <span className="font-medium text-foreground">{selectedCount}</span> seleccionada
        {selectedCount === 1 ? "" : "s"}
      </p>
      <div className="flex items-center gap-1">
        <IconButton
          label="Publicar seleccionadas"
          variant="secondary"
          loading={publishing}
          onClick={onPublishSelected}
        >
          <Upload className="h-4 w-4" />
        </IconButton>
        <IconButton
          label="Pasar a borrador"
          loading={drafting}
          onClick={onDraftSelected}
        >
          <EyeOff className="h-4 w-4" />
        </IconButton>
        <IconButton label="Limpiar selección" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </IconButton>
      </div>
    </div>
  );
}
