"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { DeckForm } from "@/components/admin/DeckForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function NewDeckPage() {
  const router = useRouter();
  const { token } = useAuth();

  async function handleCreate(data: { title: string; description: string }) {
    if (!token) throw new Error("Sesión no válida.");
    const { deck } = await api.createDeck(data, token);
    router.push(`/admin/decks/${deck.id}`);
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 text-2xl font-bold">Nuevo Deck</h1>
      <p className="mb-6 text-muted">
        Los Decks nuevos se crean como borrador y no son visibles en la app móvil
        hasta que los publiques.
      </p>
      <Card className="p-6">
        <DeckForm
          submitLabel="Crear Deck"
          onSubmit={handleCreate}
          onCancel={() => router.push("/admin")}
        />
      </Card>
    </div>
  );
}
