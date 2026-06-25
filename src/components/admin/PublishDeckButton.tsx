"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface PublishDeckButtonProps {
  publishing: boolean;
  onPublish: () => void;
  cardCount?: number;
  variant?: "banner" | "inline";
}

export function PublishDeckButton({
  publishing,
  onPublish,
  cardCount = 0,
  variant = "banner",
}: PublishDeckButtonProps) {
  if (variant === "inline") {
    return (
      <Button onClick={onPublish} loading={publishing}>
        <Upload className="h-4 w-4" />
        Publicar mazo
      </Button>
    );
  }

  return (
    <Card className="mb-6 border-2 border-brand-teal/40 bg-gradient-to-r from-brand-teal/10 to-brand-blue/10 p-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-foreground">
            Publicar en la app móvil
          </p>
          <p className="mt-1 text-sm text-muted">
            Publica el mazo en la app. Luego publica tarjetas individualmente o en lote.
          </p>
        </div>
        <Button onClick={onPublish} loading={publishing} className="shrink-0">
          <Upload className="h-4 w-4" />
          Publicar mazo
        </Button>
      </div>
    </Card>
  );
}
