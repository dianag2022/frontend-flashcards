"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FlashcardBulkActions } from "@/components/admin/FlashcardBulkActions";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { PublishDeckButton } from "@/components/admin/PublishDeckButton";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiClientError } from "@/lib/api";
import { countByStatus, isDraftDeck } from "@/lib/deck-status";
import { deckStore } from "@/lib/deck-store";
import type { Deck, Flashcard } from "@/types/api";

function applyCardUpdates(cards: Flashcard[], updated: Flashcard[]): Flashcard[] {
  const map = new Map(updated.map((c) => [c.id, c]));
  return cards.map((c) => map.get(c.id) ?? c);
}

export default function DeckDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const deckId = params.id;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [publishingDeck, setPublishingDeck] = useState(false);
  const [publishingCards, setPublishingCards] = useState(false);
  const [draftingCards, setDraftingCards] = useState(false);
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!token || !deckId) return;
    setLoading(true);
    try {
      let localDeck = deckStore.getDecks().find((d) => d.id === deckId) ?? null;

      if (!localDeck) {
        try {
          const remote = await api.listAdminDecks(token);
          deckStore.mergeDecks(remote);
          localDeck = deckStore.getDecks().find((d) => d.id === deckId) ?? null;
        } catch {
          const published = await api.listPublishedDecks();
          deckStore.mergeDecks(published.decks);
          localDeck = deckStore.getDecks().find((d) => d.id === deckId) ?? null;
        }
      }

      setDeck(localDeck);

      const remoteCards = await api.listAdminFlashcards(deckId, token);
      const merged = deckStore.mergeCards(deckId, remoteCards);
      setCards(merged);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al cargar el mazo.");
    } finally {
      setLoading(false);
    }
  }, [deckId, token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function syncCards(updated: Flashcard[]) {
    updated.forEach((c) => deckStore.upsertCard(c));
    setCards((prev) => applyCardUpdates(prev, updated));
    setSelectedIds(new Set());
  }

  async function handlePublishDeck() {
    if (!token || !deck) return;
    if (!confirm(`¿Publicar el mazo "${deck.title}" en la app móvil?`)) return;

    setPublishingDeck(true);
    setMessage("");
    try {
      const { deck: published } = await api.publishDeck(deck.id, token);
      deckStore.upsertDeck(published);
      setDeck(published);
      setMessage(
        "Mazo publicado. Publica las tarjetas seleccionadas para que aparezcan en la app.",
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al publicar el mazo.");
    } finally {
      setPublishingDeck(false);
    }
  }

  async function handlePublishCards(ids: string[]) {
    if (!token || !deck || ids.length === 0) return;

    setPublishingCards(true);
    setMessage("");
    try {
      const { flashcards } = await api.publishFlashcards(deck.id, ids, token);
      syncCards(flashcards);
      setMessage(
        `${flashcards.length} tarjeta${flashcards.length === 1 ? "" : "s"} publicada${flashcards.length === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al publicar tarjetas.");
    } finally {
      setPublishingCards(false);
      setBusyCardId(null);
    }
  }

  async function handleDraftCards(ids: string[]) {
    if (!token || !deck || ids.length === 0) return;

    setDraftingCards(true);
    setMessage("");
    try {
      const { flashcards } = await api.draftFlashcards(deck.id, ids, token);
      syncCards(flashcards);
      setMessage(
        `${flashcards.length} tarjeta${flashcards.length === 1 ? "" : "s"} movida${flashcards.length === 1 ? "" : "s"} a borrador.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al pasar tarjetas a borrador.");
    } finally {
      setDraftingCards(false);
      setBusyCardId(null);
    }
  }

  async function handlePublishCard(id: string) {
    setBusyCardId(id);
    await handlePublishCards([id]);
  }

  async function handleDraftCard(id: string) {
    setBusyCardId(id);
    await handleDraftCards([id]);
  }

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleToggleSelectAll() {
    if (cards.every((c) => selectedIds.has(c.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cards.map((c) => c.id)));
    }
  }

  async function handleDeleteDeck() {
    if (!token || !deck) return;
    if (!confirm("¿Eliminar este mazo y todas sus tarjetas?")) return;
    try {
      await api.deleteDeck(deck.id, token);
    } catch (err) {
      if (err instanceof ApiClientError && [404, 405].includes(err.status)) {
        deckStore.removeDeck(deck.id);
        router.push("/admin");
        return;
      }
      setMessage(err instanceof Error ? err.message : "Error al eliminar.");
      return;
    }
    deckStore.removeDeck(deck.id);
    router.push("/admin");
  }

  async function handleDeleteCard(cardId: string) {
    if (!token) return;
    if (!confirm("¿Eliminar esta tarjeta?")) return;
    try {
      await api.deleteFlashcard(cardId, token);
    } catch (err) {
      if (!(err instanceof ApiClientError && [404, 405].includes(err.status))) {
        setMessage(err instanceof Error ? err.message : "Error al eliminar tarjeta.");
        return;
      }
    }
    deckStore.removeCard(cardId);
    if (deck) deckStore.updateDeckCardCount(deck.id);
    setCards(deckStore.getCardsByDeck(deckId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(cardId);
      return next;
    });
  }

  if (loading) return <p className="text-muted">Cargando mazo...</p>;
  if (!deck) {
    return (
      <div>
        <p className="text-muted">Mazo no encontrado.</p>
        <Link href="/admin" className="mt-4 inline-block text-brand-teal">
          Volver a mazos
        </Link>
      </div>
    );
  }

  const isDraft = isDraftDeck(deck);
  const counts = countByStatus(cards);

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mazos
      </Link>

      {isDraft && (
        <PublishDeckButton
          publishing={publishingDeck}
          onPublish={handlePublishDeck}
          cardCount={cards.length}
        />
      )}

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold">{deck.title}</h1>
            <StatusBadge status={deck.status} />
          </div>
          <p className="text-muted">{deck.description}</p>
          <p className="mt-2 text-sm text-muted">
            {counts.published} publicada{counts.published === 1 ? "" : "s"} ·{" "}
            {counts.draft} borrador{counts.draft === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/decks/${deck.id}/edit`}>
            <Button variant="secondary">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
          {isDraft && (
            <PublishDeckButton
              publishing={publishingDeck}
              onPublish={handlePublishDeck}
              cardCount={cards.length}
              variant="inline"
            />
          )}
          <Button variant="danger" onClick={handleDeleteDeck}>
            <Trash2 className="h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card className="mb-6 border-border bg-white p-4 text-sm text-muted">
        {isDraft ? (
          <>
            El mazo está en <strong>borrador</strong>. Publica el mazo primero, luego selecciona
            tarjetas y usa <strong>Publicar seleccionadas</strong> para que aparezcan en la app.
          </>
        ) : (
          <>
            El mazo está <strong>publicado</strong>. Solo las tarjetas con estado{" "}
            <strong>Publicado</strong> son visibles en la app móvil. Puedes pasar tarjetas
            publicadas a borrador sin despublicar el mazo.
          </>
        )}
      </Card>

      {message && (
        <Card className="mb-6 border-brand-teal/20 bg-brand-teal/5 p-4 text-sm">
          {message}
        </Card>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href={`/admin/decks/${deck.id}/cards/new`}>
          <Button>
            <Plus className="h-4 w-4" />
            Nueva tarjeta
          </Button>
        </Link>
        <Link href={`/admin/decks/${deck.id}/ai`}>
          <Button variant="secondary">
            <Sparkles className="h-4 w-4" />
            Generar con IA
          </Button>
        </Link>
      </div>

      <FlashcardBulkActions
        selectedCount={selectedIds.size}
        publishing={publishingCards}
        drafting={draftingCards}
        onPublishSelected={() => handlePublishCards(Array.from(selectedIds))}
        onDraftSelected={() => handleDraftCards(Array.from(selectedIds))}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      <FlashcardList
        cards={cards}
        deckId={deck.id}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onPublishCard={handlePublishCard}
        onDraftCard={handleDraftCard}
        onDelete={handleDeleteCard}
        busyId={busyCardId}
      />
    </div>
  );
}
