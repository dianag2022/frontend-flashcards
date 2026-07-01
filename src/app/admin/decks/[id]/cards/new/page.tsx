"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FlashcardForm } from "@/components/admin/FlashcardForm";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Category } from "@/types/api";

export default function NewCardPage() {
  return (
    <Suspense fallback={<PageLoadingState label="Cargando" />}>
      <NewCardContent />
    </Suspense>
  );
}

function NewCardContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const deckId = params.id;
  const categoryIdParam = searchParams.get("categoryId");

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState(categoryIdParam ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const { categories: remote } = await api.listAdminCategories(deckId, token);
      setCategories(remote);
      if (categoryIdParam && remote.some((c) => c.id === categoryIdParam)) {
        setCategoryId(categoryIdParam);
      } else if (remote.length === 1) {
        setCategoryId(remote[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar categorías.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [deckId, token, categoryIdParam]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  async function handleCreate(data: { front: string; back: string }) {
    if (!token) throw new Error("Sesión no válida.");
    if (!categoryId) throw new Error("Selecciona una categoría.");

    await api.createFlashcard({ deckId, categoryId, ...data }, token);
    router.push(`/admin/decks/${deckId}`);
  }

  if (loading) return <PageLoadingState label="Cargando categorías" />;

  if (error) {
    return (
      <div className="max-w-xl">
        <p className="text-sm text-red-600">{error}</p>
        <Link href={`/admin/decks/${deckId}`} className="mt-4 inline-block text-brand-teal">
          Volver al deck
        </Link>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="max-w-xl">
        <Link
          href={`/admin/decks/${deckId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al deck
        </Link>
        <Card className="p-6 text-center text-muted">
          <p>Crea una categoría antes de añadir tarjetas.</p>
          <Link
            href={`/admin/decks/${deckId}/categories/new`}
            className="mt-4 inline-block text-brand-teal"
          >
            Crear categoría
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Link
        href={`/admin/decks/${deckId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al deck
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Nueva tarjeta</h1>
      <p className="mb-6 text-sm text-muted">
        Las tarjetas se guardan como borrador hasta que las publiques.
      </p>
      <Card className="p-6">
        <div className="mb-5">
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium">
            Categoría
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20"
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </select>
        </div>
        <FlashcardForm
          submitLabel="Crear tarjeta"
          onSubmit={handleCreate}
          onCancel={() => router.push(`/admin/decks/${deckId}`)}
        />
      </Card>
    </div>
  );
}
