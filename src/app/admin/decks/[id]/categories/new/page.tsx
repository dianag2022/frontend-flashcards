"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

export default function NewCategoryPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const deckId = params.id;

  async function handleCreate(data: { title: string; description: string }) {
    if (!token) throw new Error("Sesión no válida.");
    await api.createCategory(deckId, data, token);
    router.push(`/admin/decks/${deckId}`);
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
      <h1 className="mb-2 text-2xl font-bold">Nueva categoría</h1>
      <p className="mb-6 text-sm text-muted">
        Agrupa las tarjetas por tema dentro del deck. Cada tarjeta debe pertenecer a
        una categoría.
      </p>
      <Card className="p-6">
        <CategoryForm
          submitLabel="Crear categoría"
          onSubmit={handleCreate}
          onCancel={() => router.push(`/admin/decks/${deckId}`)}
        />
      </Card>
    </div>
  );
}
