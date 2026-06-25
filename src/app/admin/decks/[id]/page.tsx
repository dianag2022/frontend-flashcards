"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, EyeOff, Pencil, Plus, Sparkles, Trash2, Upload } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { IconButton, iconLinkClass } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { FlashcardBulkActions } from "@/components/admin/FlashcardBulkActions";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
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
  const { confirm } = useConfirm();
  const deckId = params.id;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [publishingDeck, setPublishingDeck] = useState(false);
  const [draftingDeck, setDraftingDeck] = useState(false);
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
    const ok = await confirm({
      title: "Publicar mazo",
      message: `¿Publicar el mazo "${deck.title}" en la app móvil?`,
      confirmLabel: "Publicar",
    });
    if (!ok) return;

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

  async function handleDraftDeck() {
    if (!token || !deck) return;
    const ok = await confirm({
      title: "Pasar a borrador",
      message: `¿Pasar el mazo "${deck.title}" a borrador? Se ocultará de la app móvil y todas sus tarjetas pasarán a borrador.`,
      confirmLabel: "Pasar a borrador",
    });
    if (!ok) return;

    setDraftingDeck(true);
    setMessage("");
    try {
      const { deck: drafted, flashcardsDrafted } = await api.draftDeck(deck.id, token);
      deckStore.upsertDeck(drafted);
      setDeck(drafted);

      const remoteCards = await api.listAdminFlashcards(deck.id, token);
      const merged = deckStore.mergeCards(deck.id, remoteCards);
      setCards(merged);
      setSelectedIds(new Set());

      setMessage(
        `Mazo movido a borrador. ${flashcardsDrafted} tarjeta${flashcardsDrafted === 1 ? "" : "s"} actualizada${flashcardsDrafted === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al pasar el mazo a borrador.");
    } finally {
      setDraftingDeck(false);
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
    const ok = await confirm({
      title: "Eliminar mazo",
      message: "¿Eliminar este mazo y todas sus tarjetas? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;
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
    const ok = await confirm({
      title: "Eliminar tarjeta",
      message: "¿Eliminar esta tarjeta?",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;
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

  if (loading) return <PageLoadingState label="Cargando mazo" />;
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

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">{deck.title}</h1>
            <StatusBadge status={deck.status} />
          </div>
          <p className="text-sm text-muted">{deck.description}</p>
          <p className="mt-1.5 text-xs text-muted">
            {counts.published} publicada{counts.published === 1 ? "" : "s"} ·{" "}
            {counts.draft} borrador{counts.draft === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/decks/${deck.id}/edit`}
            title="Editar mazo"
            aria-label="Editar mazo"
            className={iconLinkClass("secondary")}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          {isDraft ? (
            <IconButton
              label="Publicar mazo"
              variant="primary"
              loading={publishingDeck}
              onClick={handlePublishDeck}
            >
              <Upload className="h-4 w-4" />
            </IconButton>
          ) : (
            <IconButton
              label="Pasar mazo a borrador"
              variant="secondary"
              loading={draftingDeck}
              onClick={handleDraftDeck}
            >
              <EyeOff className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton label="Eliminar mazo" variant="danger" onClick={handleDeleteDeck}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <Link
            href={`/admin/decks/${deck.id}/cards/new`}
            title="Nueva tarjeta"
            aria-label="Nueva tarjeta"
            className={iconLinkClass("primary")}
          >
            <Plus className="h-4 w-4 text-white" />
          </Link>
          <Link
            href={`/admin/decks/${deck.id}/ai`}
            title="Generar con IA"
            aria-label="Generar con IA"
            className={iconLinkClass("secondary")}
          >
            <Sparkles className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {message && (
        <Card className="mb-4 border-brand-teal/20 bg-brand-teal/5 p-3 text-sm">
          {message}
        </Card>
      )}

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
