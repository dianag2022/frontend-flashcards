"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { DeckForm } from "@/components/admin/DeckForm";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Deck } from "@/types/api";

export default function EditDeckPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDeck = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminDeck(params.id, token);
      setDeck(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el deck.");
      setDeck(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, token]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  async function handleUpdate(data: { title: string; description: string }) {
    if (!token || !deck) throw new Error("Deck no encontrado.");
    await api.updateDeck(deck.id, data, token);
    router.push(`/admin/decks/${deck.id}`);
  }

  if (loading) return <PageLoadingState label="Cargando deck" />;

  if (!deck) {
    return (
      <div>
        <p className="text-muted">{error || "Deck no encontrado."}</p>
        <Link href="/admin" className="mt-4 inline-block text-brand-teal">
          Volver a decks
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/decks/${deck.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al deck
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Editar deck</h1>
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
