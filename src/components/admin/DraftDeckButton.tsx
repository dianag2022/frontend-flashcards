"use client";

import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface DraftDeckButtonProps {
  drafting: boolean;
  onDraft: () => void;
  variant?: "banner" | "inline";
}

export function DraftDeckButton({
  drafting,
  onDraft,
  variant = "banner",
}: DraftDeckButtonProps) {
  if (variant === "inline") {
    return (
      <Button variant="secondary" onClick={onDraft} loading={drafting}>
        <EyeOff className="h-4 w-4" />
        Pasar a borrador
      </Button>
    );
  }

  return (
    <Card className="mb-6 border-2 border-amber-200/80 bg-amber-50/60 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">
            Ocultar de la app móvil
          </p>
          <p className="mt-1 text-sm text-muted">
            Pasa el Deck completo a borrador. Todas las tarjetas dejarán de ser
            visibles en la app.
          </p>
        </div>
        <Button variant="secondary" onClick={onDraft} loading={drafting} className="shrink-0">
          <EyeOff className="h-4 w-4" />
          Pasar Deck a borrador
        </Button>
      </div>
    </Card>
  );
}
