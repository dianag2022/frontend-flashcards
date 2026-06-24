"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AIGenerator } from "@/components/admin/AIGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { deckStore } from "@/lib/deck-store";

export default function AIPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const deckId = params.id;

  async function handleApprove(cards: { front: string; back: string }[]) {
    if (!token) throw new Error("Sesión no válida.");

    for (const card of cards) {
      const { flashcard } = await api.createFlashcard(
        { deckId, ...card },
        token,
      );
      deckStore.upsertCard(flashcard);
    }
    deckStore.updateDeckCardCount(deckId);
    router.push(`/admin/decks/${deckId}`);
  }

  return (
    <div>
      <Link
        href={`/admin/decks/${deckId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al mazo
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Generar tarjetas con IA</h1>
      <p className="mb-6 text-muted">
        Revisa y aprueba cada borrador antes de guardarlo. El contenido permanece
        privado hasta publicar el mazo.
      </p>
      <AIGenerator onApprove={handleApprove} />
    </div>
  );
}
