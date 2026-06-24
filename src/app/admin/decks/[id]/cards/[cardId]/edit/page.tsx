"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FlashcardForm } from "@/components/admin/FlashcardForm";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { deckStore } from "@/lib/deck-store";
import type { Flashcard } from "@/types/api";

export default function EditCardPage() {
  const params = useParams<{ id: string; cardId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [card, setCard] = useState<Flashcard | null>(null);

  useEffect(() => {
    const found =
      deckStore.getCards().find((c) => c.id === params.cardId) ?? null;
    setCard(found);
  }, [params.cardId]);

  async function handleUpdate(data: { front: string; back: string }) {
    if (!token || !card) throw new Error("Tarjeta no encontrada.");

    try {
      const updated = await api.updateFlashcard(card.id, data, token);
      deckStore.upsertCard(updated);
    } catch (err) {
      if (err instanceof ApiClientError && [404, 405].includes(err.status)) {
        deckStore.upsertCard({ ...card, ...data });
      } else {
        throw err;
      }
    }
    router.push(`/admin/decks/${params.id}`);
  }

  if (!card) {
    return <p className="text-muted">Tarjeta no encontrada.</p>;
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/decks/${params.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al mazo
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Editar tarjeta</h1>
      <Card className="p-6">
        <FlashcardForm
          initial={{ front: card.front, back: card.back }}
          submitLabel="Guardar cambios"
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/admin/decks/${params.id}`)}
        />
      </Card>
    </div>
  );
}
