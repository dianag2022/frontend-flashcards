"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DeckForm } from "@/components/admin/DeckForm";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { deckStore } from "@/lib/deck-store";
import type { Deck } from "@/types/api";

export default function EditDeckPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);

  useEffect(() => {
    const found = deckStore.getDecks().find((d) => d.id === params.id) ?? null;
    setDeck(found);
  }, [params.id]);

  async function handleUpdate(data: { title: string; description: string }) {
    if (!token || !deck) throw new Error("Mazo no encontrado.");

    try {
      const updated = await api.updateDeck(deck.id, data, token);
      deckStore.upsertDeck(updated);
    } catch (err) {
      if (err instanceof ApiClientError && [404, 405].includes(err.status)) {
        deckStore.upsertDeck({
          ...deck,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      } else {
        throw err;
      }
    }
    router.push(`/admin/decks/${deck.id}`);
  }

  if (!deck) {
    return <p className="text-muted">Mazo no encontrado.</p>;
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/decks/${deck.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al mazo
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Editar mazo</h1>
      <Card className="p-6">
        <DeckForm
          initial={{ title: deck.title, description: deck.description }}
          submitLabel="Guardar cambios"
          onSubmit={handleUpdate}
          onCancel={() => router.push(`/admin/decks/${deck.id}`)}
        />
      </Card>
    </div>
  );
}
