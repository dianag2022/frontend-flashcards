"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FlashcardForm } from "@/components/admin/FlashcardForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { deckStore } from "@/lib/deck-store";

export default function NewCardPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const deckId = params.id;

  async function handleCreate(data: { front: string; back: string }) {
    if (!token) throw new Error("Sesión no válida.");
    const { flashcard } = await api.createFlashcard(
      { deckId, ...data },
      token,
    );
    deckStore.upsertCard(flashcard);
    deckStore.updateDeckCardCount(deckId);
    router.push(`/admin/decks/${deckId}`);
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/decks/${deckId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al mazo
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Nueva tarjeta</h1>
      <p className="mb-6 text-sm text-muted">
        Las tarjetas se guardan como borrador hasta que publiques el mazo.
      </p>
      <Card className="p-6">
        <FlashcardForm
          submitLabel="Crear tarjeta"
          onSubmit={handleCreate}
          onCancel={() => router.push(`/admin/decks/${deckId}`)}
        />
      </Card>
    </div>
  );
}
