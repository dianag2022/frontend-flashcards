"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SortableDeckList } from "@/components/admin/SortableDeckList";
import { DeckListSkeleton, PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { api } from "@/lib/api";
import { deckStore } from "@/lib/deck-store";
import type { Deck } from "@/types/api";

function DecksPageContent() {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [draftingId, setDraftingId] = useState<string | null>(null);
  const [publishMessage, setPublishMessage] = useState("");

  const loadDecks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const remote = await api.listAdminDecks(token);
      const merged = deckStore.mergeDecks(remote);
      setDecks(merged);
    } catch (err) {
      const local = deckStore.getDecks();
      setDecks(local);
      if (local.length === 0) {
        setError(err instanceof Error ? err.message : "Error al cargar mazos.");
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  async function handleReorder(orderedIds: string[]) {
    deckStore.reorderDecks(orderedIds);
    setDecks(deckStore.getDecks());
    if (token) {
      try {
        await api.reorderDecks(orderedIds, token);
      } catch {
        // order saved locally
      }
    }
  }

  async function handlePublish(deck: Deck) {
    if (!token) return;
    setPublishingId(deck.id);
    setPublishMessage("");
    try {
      const { deck: published } = await api.publishDeck(deck.id, token);
      deckStore.upsertDeck(published);
      setDecks(deckStore.getDecks());
      setPublishMessage(`"${published.title}" publicado correctamente.`);
    } catch (err) {
      setPublishMessage(err instanceof Error ? err.message : "Error al publicar.");
    } finally {
      setPublishingId(null);
    }
  }

  async function handleDraft(deck: Deck) {
    if (!token) return;
    const ok = await confirm({
      title: "Pasar a borrador",
      message: `¿Pasar "${deck.title}" a borrador? Se ocultará de la app y todas sus tarjetas pasarán a borrador.`,
      confirmLabel: "Pasar a borrador",
    });
    if (!ok) return;

    setDraftingId(deck.id);
    setPublishMessage("");
    try {
      const { deck: drafted, flashcardsDrafted } = await api.draftDeck(deck.id, token);
      deckStore.upsertDeck(drafted);
      setDecks(deckStore.getDecks());
      setPublishMessage(
        `"${drafted.title}" movido a borrador (${flashcardsDrafted} tarjeta${flashcardsDrafted === 1 ? "" : "s"}).`,
      );
    } catch (err) {
      setPublishMessage(err instanceof Error ? err.message : "Error al pasar a borrador.");
    } finally {
      setDraftingId(null);
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Selecciona un tema</h1>
          <p className="mt-2 text-muted">
            ¿Qué área de la psicología gestionarás hoy?
          </p>
        </div>
        <Link href="/admin/decks/new">
          <Button>
            <Plus className="h-4 w-4" />
            Nuevo mazo
          </Button>
        </Link>
      </div>

      {loading && <DeckListSkeleton />}
      {error && !loading && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {publishMessage && !loading && (
        <p className="mb-4 text-sm text-brand-teal">{publishMessage}</p>
      )}

      {!loading && decks.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-muted">Aún no hay mazos. Crea el primero.</p>
          <Link href="/admin/decks/new" className="mt-4 inline-block">
            <Button>Crear mazo</Button>
          </Link>
        </div>
      )}

      {!loading && decks.length > 0 && (
        <SortableDeckList
          decks={decks}
          onReorder={handleReorder}
          onPublish={handlePublish}
          onDraft={handleDraft}
          publishingId={publishingId}
          draftingId={draftingId}
        />
      )}
    </div>
  );
}

export default function AdminDecksPage() {
  return (
    <Suspense fallback={<PageLoadingState />}>
      <DecksPageContent />
    </Suspense>
  );
}
