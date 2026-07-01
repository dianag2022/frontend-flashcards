"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { AIGenerator } from "@/components/admin/AIGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Category } from "@/types/api";

export default function AIPage() {
  return (
    <Suspense fallback={<PageLoadingState label="Cargando" />}>
      <AIContent />
    </Suspense>
  );
}

function AIContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const deckId = params.id;
  const categoryId = searchParams.get("categoryId");

  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(!!categoryId);

  const loadCategory = useCallback(async () => {
    if (!token || !categoryId) return;
    setLoading(true);
    try {
      const { categories } = await api.listAdminCategories(deckId, token);
      setCategory(categories.find((c) => c.id === categoryId) ?? null);
    } finally {
      setLoading(false);
    }
  }, [deckId, token, categoryId]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  async function handleApprove(cards: { front: string; back: string }[]) {
    if (!token) throw new Error("Sesión no válida.");
    if (!categoryId) throw new Error("Categoría no especificada.");

    for (const card of cards) {
      await api.createFlashcard({ deckId, categoryId, ...card }, token);
    }
    router.push(`/admin/decks/${deckId}`);
  }

  if (!categoryId) {
    return (
      <div>
        <Link
          href={`/admin/decks/${deckId}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al deck
        </Link>
        <Card className="p-6 text-center text-muted">
          <p>Selecciona una categoría desde el deck para generar tarjetas con IA.</p>
        </Card>
      </div>
    );
  }

  if (loading) return <PageLoadingState label="Cargando categoría" />;

  return (
    <div>
      <Link
        href={`/admin/decks/${deckId}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al deck
      </Link>
      <h1 className="mb-2 text-2xl font-bold">Generar tarjetas con IA</h1>
      <p className="mb-6 text-muted">
        {category
          ? `Categoría: ${category.title}. Revisa y aprueba cada borrador antes de guardarlo.`
          : "Revisa y aprueba cada borrador antes de guardarlo."}
      </p>
      <AIGenerator onApprove={handleApprove} />
    </div>
  );
}
