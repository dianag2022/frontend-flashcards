"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { IconButton } from "@/components/ui/IconButton";
import { PageLoadingState } from "@/components/ui/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { api } from "@/lib/api";
import type { GlossaryTerm } from "@/types/api";

export default function GlossaryPage() {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");

  const loadTerms = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.listAdminGlossary(token);
      setTerms(data.terms ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el glosario. El backend debe exponer /api/admin/glossary.",
      );
      setTerms([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  function resetForm() {
    setEditingId(null);
    setTerm("");
    setDefinition("");
  }

  function startEdit(item: GlossaryTerm) {
    setEditingId(item.id);
    setTerm(item.term);
    setDefinition(item.definition);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!term.trim() || !definition.trim()) {
      setError("Completa el término y la definición.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const body = { term: term.trim(), definition: definition.trim() };
      if (editingId) {
        const { term: updated } = await api.updateGlossaryTerm(editingId, body, token);
        setTerms((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setMessage("Término actualizado.");
      } else {
        const { term: created } = await api.createGlossaryTerm(body, token);
        setTerms((prev) => [created, ...prev]);
        setMessage("Término añadido al glosario.");
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar el término.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: GlossaryTerm) {
    if (!token) return;
    const ok = await confirm({
      title: "Eliminar término",
      message: `¿Eliminar "${item.term}" del glosario?`,
      confirmLabel: "Eliminar",
      tone: "danger",
    });
    if (!ok) return;
    try {
      await api.deleteGlossaryTerm(item.id, token);
      setTerms((prev) => prev.filter((t) => t.id !== item.id));
      if (editingId === item.id) resetForm();
      setMessage("Término eliminado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar el término.");
    }
  }

  if (loading) return <PageLoadingState label="Cargando glosario" />;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold">Glosario</h1>
      <p className="mb-6 text-sm text-muted">
        Añade siglas o términos. La app móvil pedirá este listado y podrá mostrar un
        popup cuando una flashcard contenga una de estas palabras.
      </p>

      {message && (
        <Card className="mb-4 border-brand-teal/20 bg-brand-teal/5 p-3 text-sm">
          {message}
        </Card>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Card className="mb-8 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Término o sigla"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Ej. TDAH, memoria de trabajo"
            required
          />
          <Textarea
            label="Definición"
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            placeholder="Explicación breve que verá el usuario en el popup."
            required
          />
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              <Plus className="h-4 w-4" />
              {editingId ? "Guardar cambios" : "Añadir término"}
            </Button>
            {editingId && (
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {terms.length === 0 && (
          <Card className="p-8 text-center text-muted">
            Aún no hay términos. Crea el primero.
          </Card>
        )}
        {terms.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{item.term}</p>
                <p className="mt-1 text-sm text-muted">{item.definition}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <IconButton label="Editar" onClick={() => startEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton
                  label="Eliminar"
                  variant="danger"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
