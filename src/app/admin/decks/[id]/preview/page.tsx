"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FlashcardPreview } from "@/components/admin/FlashcardPreview";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Category, Deck, Flashcard } from "@/types/api";

function PreviewContent() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const deckId = params.id;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    if (!token || !deckId) return;
    setLoading(true);
    setError("");
    try {
      const [deckData, categoriesRes, remoteCards] = await Promise.all([
        api.getAdminDeck(deckId, token),
        api.listAdminCategories(deckId, token),
        api.listAdminFlashcards(deckId, token),
      ]);
      setDeck(deckData);
      setCategories(categoriesRes.categories);
      setCards(remoteCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar la vista previa.");
      setDeck(null);
      setCategories([]);
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [deckId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <PageLoadingState label="Cargando vista previa" />;
  if (error) return <p className="text-center text-sm text-red-600">{error}</p>;
  if (!deck) return <p className="text-center text-muted">Deck no encontrado.</p>;

  return (
    <FlashcardPreview
      deck={deck}
      categories={categories}
      cards={cards}
      backHref={`/admin/decks/${deckId}`}
    />
  );
}

export default function DeckPreviewPage() {
  return (
    <Suspense fallback={<PageLoadingState label="Cargando vista previa" />}>
      <PreviewContent />
    </Suspense>
  );
}
