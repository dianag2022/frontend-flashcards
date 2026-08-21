"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, FolderPlus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IconButton, iconLinkClass } from "@/components/ui/IconButton";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CategorySection } from "@/components/admin/CategorySection";
import { FlashcardBulkActions } from "@/components/admin/FlashcardBulkActions";
import { FlashcardList } from "@/components/admin/FlashcardList";
import { PublishDeckButton } from "@/components/admin/PublishDeckButton";
import { DraftDeckButton } from "@/components/admin/DraftDeckButton";
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
  const [busyCategoryId, setBusyCategoryId] = useState<string | null>(null);
  const [categoryBusyKind, setCategoryBusyKind] = useState<
    "delete" | "publish" | "draft" | null
  >(null);
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

  async function handleDeleteCategory(categoryId: string) {
    if (!token || !deck) return;
    const category = categories.find((c) => c.id === categoryId);
    const cardCount = cards.filter((c) => c.categoryId === categoryId).length;
    const title = category?.title ?? "esta categoría";
    const cardClause =
      cardCount === 0
        ? ""
        : ` y ${cardCount} ${cardCount === 1 ? "tarjeta" : "tarjetas"}`;
    const ok = await confirm({
      title: "Eliminar categoría",
      message: `¿Eliminar la categoría "${title}"${cardClause}? Esta acción no se puede deshacer.`,
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;

    setBusyCategoryId(categoryId);
    setCategoryBusyKind("delete");
    setMessage("");
    try {
      const { flashcardsDeleted } = await api.deleteCategory(
        deck.id,
        categoryId,
        token,
      );
      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setCards((prev) => prev.filter((c) => c.categoryId !== categoryId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        cards.forEach((c) => {
          if (c.categoryId === categoryId) next.delete(c.id);
        });
        return next;
      });
      setDeck((prev) =>
        prev
          ? { ...prev, cardCount: Math.max(0, prev.cardCount - flashcardsDeleted) }
          : prev,
      );
      setMessage(
        `Categoría eliminada. ${flashcardsDeleted} tarjeta${flashcardsDeleted === 1 ? "" : "s"} eliminada${flashcardsDeleted === 1 ? "" : "s"}.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al eliminar la categoría.");
    } finally {
      setBusyCategoryId(null);
      setCategoryBusyKind(null);
    }
  }

  async function handlePublishCategory(categoryId: string) {
    if (!token || !deck) return;
    const category = categories.find((c) => c.id === categoryId);
    const title = category?.title ?? "esta categoría";
    const deckNote = isDraftDeck(deck)
      ? " El deck sigue en borrador, así que no se verá en la app hasta que lo publiques."
      : "";
    const ok = await confirm({
      title: "Publicar categoría",
      message: `¿Publicar la categoría "${title}"?${deckNote}`,
      confirmLabel: "Publicar",
    });
    if (!ok) return;

    setBusyCategoryId(categoryId);
    setCategoryBusyKind("publish");
    setMessage("");
    try {
      const result = await api.publishCategory(deck.id, categoryId, token);
      if (result.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === result.category.id ? result.category : c)),
        );
      } else {
        const categoriesRes = await api.listAdminCategories(deck.id, token);
        setCategories(categoriesRes.categories);
      }
      if (result.flashcards?.length) {
        setCards((prev) => applyCardUpdates(prev, result.flashcards ?? []));
      } else {
        const remoteCards = await api.listAdminFlashcards(deck.id, token);
        setCards(remoteCards);
      }
      const publishedTitle = result.category?.title ?? title;
      const count = result.flashcardsPublished ?? result.flashcards?.length;
      setMessage(
        count != null
          ? `Categoría "${publishedTitle}" publicada. ${count} tarjeta${count === 1 ? "" : "s"} actualizada${count === 1 ? "" : "s"}.`
          : `Categoría "${publishedTitle}" publicada.`,
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Error al publicar la categoría.");
    } finally {
      setBusyCategoryId(null);
      setCategoryBusyKind(null);
    }
  }

  async function handleDraftCategory(categoryId: string) {
    if (!token || !deck) return;
    const category = categories.find((c) => c.id === categoryId);
    const title = category?.title ?? "esta categoría";
    const ok = await confirm({
      title: "Pasar categoría a borrador",
      message: `¿Pasar la categoría "${title}" a borrador? Se ocultará de la app móvil.`,
      confirmLabel: "Pasar a borrador",
    });
    if (!ok) return;

    setBusyCategoryId(categoryId);
    setCategoryBusyKind("draft");
    setMessage("");
    try {
      const result = await api.draftCategory(deck.id, categoryId, token);
      if (result.category) {
        setCategories((prev) =>
          prev.map((c) => (c.id === result.category.id ? result.category : c)),
        );
      } else {
        const categoriesRes = await api.listAdminCategories(deck.id, token);
        setCategories(categoriesRes.categories);
      }
      if (result.flashcards?.length) {
        setCards((prev) => applyCardUpdates(prev, result.flashcards ?? []));
      } else {
        const remoteCards = await api.listAdminFlashcards(deck.id, token);
        setCards(remoteCards);
      }
      const draftedTitle = result.category?.title ?? title;
      const count = result.flashcardsDrafted ?? result.flashcards?.length;
      setMessage(
        count != null
          ? `Categoría "${draftedTitle}" movida a borrador. ${count} tarjeta${count === 1 ? "" : "s"} actualizada${count === 1 ? "" : "s"}.`
          : `Categoría "${draftedTitle}" movida a borrador.`,
      );
    } catch (err) {
      setMessage(
        err instanceof Error ? err.message : "Error al pasar la categoría a borrador.",
      );
    } finally {
      setBusyCategoryId(null);
      setCategoryBusyKind(null);
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
        <div className="flex flex-wrap items-center gap-1">
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
            <PublishDeckButton
              variant="inline"
              publishing={publishingDeck}
              onPublish={handlePublishDeck}
              cardCount={cards.length}
            />
          ) : (
            <DraftDeckButton
              variant="inline"
              drafting={draftingDeck}
              onDraft={handleDraftDeck}
            />
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

      {isDraft && (
        <PublishDeckButton
          publishing={publishingDeck}
          onPublish={handlePublishDeck}
          cardCount={cards.length}
        />
      )}

      {message && (
        <Card className="mb-4 border-brand-teal/20 bg-brand-teal/5 p-3 text-sm">
          {message}
        </Card>
      )}

      {categories.length > 1 && (
        <nav className="mb-4 flex flex-wrap gap-2" aria-label="Categorías del deck">
          {categories.map((category) => {
            const count = cards.filter((c) => c.categoryId === category.id).length;
            return (
              <a
                key={category.id}
                href={`#category-${category.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted transition hover:border-brand-teal/40 hover:text-foreground"
              >
                {category.title}
                <span className="rounded-full bg-background px-1.5 py-0.5 text-[10px] text-muted">
                  {count}
                </span>
              </a>
            );
          })}
        </nav>
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

      <div className="space-y-5">
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
              onDeleteCategory={handleDeleteCategory}
              onPublishCategory={handlePublishCategory}
              onDraftCategory={handleDraftCategory}
              busyId={busyCardId}
              deleting={busyCategoryId === category.id && categoryBusyKind === "delete"}
              publishing={busyCategoryId === category.id && categoryBusyKind === "publish"}
              drafting={busyCategoryId === category.id && categoryBusyKind === "draft"}
            />
          );
        })}

        {uncategorizedCards.length > 0 && (
          <section
            id="category-uncategorized"
            className="overflow-hidden rounded-2xl border border-dashed border-border bg-card card-shadow"
          >
            <div className="p-4 sm:p-5">
              <h2 className="text-lg font-semibold text-muted">Sin categoría</h2>
              <p className="mt-1 text-sm text-muted">
                Estas tarjetas no pertenecen a ninguna categoría del deck.
              </p>
            </div>
            <div className="border-t border-border bg-background/70 p-3 sm:p-4">
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
                nested
                categoryLabel="Sin categoría"
                categoryChipClass="bg-amber-50 text-amber-700"
              />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
