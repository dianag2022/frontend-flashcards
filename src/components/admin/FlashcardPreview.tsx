"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Category, Deck, Flashcard } from "@/types/api";

interface FlashcardPreviewProps {
  deck: Deck;
  categories?: Category[];
  cards: Flashcard[];
  backHref: string;
  initialCardId?: string | null;
}

function previewBadgeLabel(title: string) {
  return title.trim().slice(0, 24).toUpperCase();
}

export function FlashcardPreview({
  deck,
  categories = [],
  cards,
  backHref,
  initialCardId,
}: FlashcardPreviewProps) {
  const searchParams = useSearchParams();
  const cardParam = initialCardId ?? searchParams.get("card");

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (!cardParam || cards.length === 0) return;
    const idx = cards.findIndex((c) => c.id === cardParam);
    if (idx >= 0) setIndex(idx);
  }, [cardParam, cards]);

  const current = cards[index];
  const total = cards.length;
  const progress = total > 0 ? ((index + 1) / total) * 100 : 0;
  const currentCategory = current
    ? categories.find((c) => c.id === current.categoryId)
    : undefined;

  const goTo = useCallback(
    (nextIndex: number) => {
      setFlipped(false);
      setIndex(Math.max(0, Math.min(total - 1, nextIndex)));
    },
    [total],
  );

  function toggleFlip() {
    setFlipped((prev) => !prev);
  }

  if (total === 0) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <Link
          href={backHref}
          className="mb-8 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-brand-teal card-shadow"
          aria-label="Volver"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <Card className="p-8 text-muted">
          No hay tarjetas para previsualizar. Crea al menos una tarjeta primero.
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col px-2 pb-8">
      <header className="relative mb-6 pt-2 text-center">
        <Link
          href={backHref}
          className="absolute left-0 top-2 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-brand-teal card-shadow transition hover:bg-background"
          aria-label="Volver al Deck"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="px-12 text-lg font-bold leading-snug text-foreground">
          {deck.title}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {index + 1} de {total}
        </p>
        <div className="mx-auto mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-brand-teal/15">
          <div
            className="progress-gradient h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <div className="relative flex flex-1 flex-col">
        {index > 0 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute -left-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-muted transition hover:text-brand-teal"
            aria-label="Tarjeta anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {index < total - 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute -right-1 top-1/2 z-10 -translate-y-1/2 rounded-full p-1 text-muted transition hover:text-brand-teal"
            aria-label="Tarjeta siguiente"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}

        <button
          type="button"
          onClick={toggleFlip}
          className="flip-card mx-auto w-full text-left"
          aria-label={flipped ? "Ver pregunta" : "Ver respuesta"}
        >
          <div className={`flip-card-inner w-full ${flipped ? "is-flipped" : ""}`}>
            <Card className="flip-card-face min-h-[340px] justify-between border-2 border-brand-teal/20 p-8">
              <div className="flex flex-col items-center">
                <span className="rounded-full bg-brand-teal px-4 py-1.5 text-xs font-bold tracking-wide text-white">
                  {previewBadgeLabel(currentCategory?.title ?? deck.title)}
                </span>
                {current.status === "draft" && (
                  <span className="mt-2 rounded-full bg-amber-50 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                    Borrador
                  </span>
                )}
              </div>
              <p className="my-auto px-2 text-center text-lg font-bold leading-relaxed text-foreground">
                {current.front}
              </p>
              <span className="text-center text-xs text-transparent">.</span>
            </Card>

            <Card className="flip-card-face flip-card-back min-h-[340px] justify-between border-2 border-brand-blue/20 p-8">
              <div className="flex flex-col items-center">
                <span className="rounded-full bg-brand-blue/10 px-4 py-1.5 text-xs font-bold tracking-wide text-brand-blue">
                  RESPUESTA
                </span>
              </div>
              <p className="my-auto px-2 text-center text-base leading-relaxed text-foreground">
                {current.back}
              </p>
              <span className="text-center text-xs text-transparent">.</span>
            </Card>
          </div>
        </button>
      </div>

      <div className="mt-8 space-y-3">
        <Button
          type="button"
          className="w-full py-3.5"
          onClick={toggleFlip}
        >
          <Eye className="h-4 w-4" />
          {flipped ? "Ver pregunta" : "Ver respuesta"}
        </Button>
        <p className="text-center text-xs text-muted">
          Toca la tarjeta o el botón para girar
        </p>
      </div>
    </div>
  );
}
