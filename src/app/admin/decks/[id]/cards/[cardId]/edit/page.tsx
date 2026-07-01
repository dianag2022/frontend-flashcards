"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FlashcardForm } from "@/components/admin/FlashcardForm";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Flashcard } from "@/types/api";

export default function EditCardPage() {
  const params = useParams<{ id: string; cardId: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [card, setCard] = useState<Flashcard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCard = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.getAdminFlashcard(params.id, params.cardId, token);
      setCard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la tarjeta.");
      setCard(null);
    } finally {
      setLoading(false);
    }
  }, [params.id, params.cardId, token]);

  useEffect(() => {
    loadCard();
  }, [loadCard]);

  async function handleUpdate(data: { front: string; back: string }) {
    if (!token || !card) throw new Error("Tarjeta no encontrada.");
    await api.updateFlashcard(card.id, data, token);
    router.push(`/admin/decks/${params.id}`);
  }

  if (loading) return <PageLoadingState label="Cargando tarjeta" />;

  if (!card) {
    return (
      <div>
        <p className="text-muted">{error || "Tarjeta no encontrada."}</p>
        <Link href={`/admin/decks/${params.id}`} className="mt-4 inline-block text-brand-teal">
          Volver al deck
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/decks/${params.id}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al deck
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
