"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, FolderPlus, Pencil, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton, iconLinkClass } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CategorySection } from "@/components/admin/CategorySection";
import { FlashcardBulkActions } from "@/components/admin/FlashcardBulkActions";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { api } from "@/lib/api";
import { countByStatus, isDraftDeck } from "@/lib/deck-status";
import type { Category, Deck, Flashcard } from "@/types/api";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [publishingDeck, setPublishingDeck] = useState(false);
  const [draftingDeck, setDraftingDeck] = useState(false);
  const [deletingDeck, setDeletingDeck] = useState(false);
  const [publishingCards, setPublishingCards] = useState(false);
  const [draftingCards, setDraftingCards] = useState(false);
  const [busyCardId, setBusyCardId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    if (!token || !deckId) return;
    setLoading(true);
    setMessage("");
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
      setMessage(err instanceof Error ? err.message : "Error al cargar el deck.");
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

  async function handlePublishDeck() {
    if (!token || !deck) return;
    const ok = await confirm({
      title: "Publicar deck",
      message: `¿Publicar el deck "${deck.title}" en la app móvil?`,
      confirmLabel: "Publicar",
    });
    if (!ok) return;

    setPublishingDeck(true);
    setMessage("");
    try {
      const { deck: published } = await api.publishDeck(deck.id, token);
      setDeck(published);
      setMessage(
        "Deck publicado. Publica las tarjetas seleccionadas para que aparezcan en la app.",
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al publicar el deck.");
    } finally {
      setPublishingDeck(false);
    }
  }

  async function handleDraftDeck() {
    if (!token || !deck) return;
    const ok = await confirm({
      title: "Pasar a borrador",
      message: `¿Pasar el deck "${deck.title}" a borrador? Se ocultará de la app móvil y todas sus categorías y tarjetas pasarán a borrador.`,
      confirmLabel: "Pasar a borrador",
    });
    if (!ok) return;

    setDraftingDeck(true);
    setMessage("");
    try {
      const { deck: drafted, categoriesDrafted, flashcardsDrafted } =
        await api.draftDeck(deck.id, token);
      setDeck(drafted);

      const [categoriesRes, remoteCards] = await Promise.all([
        api.listAdminCategories(deck.id, token),
        api.listAdminFlashcards(deck.id, token),
      ]);
      setCategories(categoriesRes.categories);
      setCards(remoteCards);
      setSelectedIds(new Set());

      setMessage(
        `Deck movido a borrador. ${categoriesDrafted} categoría${categoriesDrafted === 1 ? "" : "s"} y ${flashcardsDrafted} tarjeta${flashcardsDrafted === 1 ? "" : "s"} actualizada${flashcardsDrafted === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al pasar el deck a borrador.");
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
      setCards((prev) => applyCardUpdates(prev, flashcards));
      setSelectedIds(new Set());
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
      setCards((prev) => applyCardUpdates(prev, flashcards));
      setSelectedIds(new Set());
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

  function handleToggleSelectAllInCategory(categoryCards: Flashcard[]) {
    if (categoryCards.every((c) => selectedIds.has(c.id))) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        categoryCards.forEach((c) => next.delete(c.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        categoryCards.forEach((c) => next.add(c.id));
        return next;
      });
    }
  }

  async function handleDeleteDeck() {
    if (!token || !deck) return;
    const ok = await confirm({
      title: "Eliminar deck",
      message: "¿Eliminar este deck, sus categorías y tarjetas? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;

    setDeletingDeck(true);
    setMessage("");
    try {
      const { message } = await api.deleteDeck(deck.id, token);
      router.push(`/admin?msg=${encodeURIComponent(message)}`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al eliminar el deck.");
    } finally {
      setDeletingDeck(false);
    }
  }

  async function handleDeleteCard(cardId: string) {
    if (!token || !deck) return;
    const ok = await confirm({
      title: "Eliminar tarjeta",
      message: "¿Eliminar esta tarjeta?",
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;

    setBusyCardId(cardId);
    setMessage("");
    try {
      const { message } = await api.deleteFlashcard(cardId, token);
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
      const categoriesRes = await api.listAdminCategories(deckId, token);
      setCategories(categoriesRes.categories);
      const deckData = await api.getAdminDeck(deck.id, token);
      setDeck(deckData);
      setMessage(message);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al eliminar tarjeta.");
    } finally {
      setBusyCardId(null);
    }
  }

  if (loading) return <PageLoadingState label="Cargando deck" />;
  if (!deck) {
    return (
      <div>
        <p className="text-muted">{message || "Deck no encontrado."}</p>
        <Link href="/admin" className="mt-4 inline-block text-brand-teal">
          Volver a decks
        </Link>
      </div>
    );
  }

  const isDraft = isDraftDeck(deck);
  const counts = countByStatus(cards);
  const uncategorizedCards = cards.filter(
    (c) => !categories.some((cat) => cat.id === c.categoryId),
  );

  return (
    <div>
      <Link
        href="/admin"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a decks
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold sm:text-3xl">{deck.title}</h1>
            <StatusBadge status={deck.status} />
          </div>
          <p className="text-sm text-muted">{deck.description}</p>
          <p className="mt-1.5 text-xs text-muted">
            {categories.length} categoría{categories.length === 1 ? "" : "s"} ·{" "}
            {counts.published} tarjeta{counts.published === 1 ? "" : "s"} publicada
            {counts.published === 1 ? "" : "s"} · {counts.draft} borrador
            {counts.draft === 1 ? "" : "es"}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link href={`/admin/decks/${deck.id}/categories/new`}>
            <Button className="px-3 py-2">
              <FolderPlus className="h-4 w-4" />
              Categoría
            </Button>
          </Link>
          <Link
            href={`/admin/decks/${deck.id}/edit`}
            title="Editar deck"
            aria-label="Editar deck"
            className={iconLinkClass("secondary")}
          >
            <Pencil className="h-4 w-4" />
          </Link>
          {isDraft ? (
            <IconButton
              label="Publicar deck"
              variant="primary"
              loading={publishingDeck}
              onClick={handlePublishDeck}
            >
              <Upload className="h-4 w-4" />
            </IconButton>
          ) : (
            <IconButton
              label="Pasar deck a borrador"
              variant="secondary"
              loading={draftingDeck}
              onClick={handleDraftDeck}
            >
              <EyeOff className="h-4 w-4" />
            </IconButton>
          )}
          <IconButton
            label="Eliminar deck"
            variant="danger"
            loading={deletingDeck}
            onClick={handleDeleteDeck}
          >
            <Trash2 className="h-4 w-4" />
          </IconButton>
          <span className="mx-1 h-6 w-px bg-border" aria-hidden />
          <Link
            href={`/admin/decks/${deck.id}/preview`}
            title="Vista previa"
            aria-label="Vista previa"
            className={iconLinkClass("secondary")}
          >
            <Eye className="h-4 w-4" />
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

      {categories.length === 0 && (
        <Card className="mb-6 p-8 text-center">
          <p className="text-muted">
            Crea una categoría antes de añadir tarjetas. Las categorías organizan el
            contenido dentro del deck.
          </p>
          <Link href={`/admin/decks/${deck.id}/categories/new`} className="mt-4 inline-block">
            <Button>
              <FolderPlus className="h-4 w-4" />
              Crear primera categoría
            </Button>
          </Link>
        </Card>
      )}

      <div className="space-y-8">
        {categories.map((category) => {
          const categoryCards = cards.filter((c) => c.categoryId === category.id);
          return (
            <CategorySection
              key={category.id}
              category={category}
              deckId={deck.id}
              cards={categoryCards}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={() => handleToggleSelectAllInCategory(categoryCards)}
              onPublishCard={handlePublishCard}
              onDraftCard={handleDraftCard}
              onDelete={handleDeleteCard}
              busyId={busyCardId}
            />
          );
        })}

        {uncategorizedCards.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-muted">Sin categoría</h2>
            <FlashcardList
              cards={uncategorizedCards}
              deckId={deck.id}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={() => handleToggleSelectAllInCategory(uncategorizedCards)}
              onPublishCard={handlePublishCard}
              onDraftCard={handleDraftCard}
              onDelete={handleDeleteCard}
              busyId={busyCardId}
            />
          </section>
        )}
      </div>
    </div>
  );
}
