"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Deck } from "@/types/api";

function AppContent() {
  const { user, signOut } = useAuth();
  const searchParams = useSearchParams();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDecks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.listPublishedDecks();
      setDecks(data.decks);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            {user && (
              <span className="hidden text-sm text-muted sm:inline">{user.email}</span>
            )}
            <Button variant="ghost" onClick={() => signOut("/login")} className="px-3 py-2">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <h1 className="text-2xl font-bold">Bienvenido</h1>
        <p className="mt-2 text-muted">
          Explora los temas publicados. Para estudiar con flashcards, usa la app móvil.
        </p>

        {searchParams.get("admin_only") && (
          <Card className="mt-6 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            El panel de administración es solo para cuentas con rol admin. Si necesitas
            acceso, contacta al equipo técnico.
          </Card>
        )}

        <section className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Temas disponibles</h2>
          {loading && <p className="text-muted">Cargando temas...</p>}
          {!loading && decks.length === 0 && (
            <Card className="p-8 text-center text-muted">
              Aún no hay temas publicados.
            </Card>
          )}
          <div className="space-y-4">
            {decks.map((deck) => (
              <Card key={deck.id} className="p-5">
                <h3 className="font-semibold">{deck.title}</h3>
                <p className="mt-1 text-sm text-muted">{deck.description}</p>
                <p className="mt-2 text-xs text-muted">
                  {deck.cardCount} tarjeta{deck.cardCount === 1 ? "" : "s"}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {user?.role === "admin" && (
          <p className="mt-8 text-sm text-muted">
            Tienes rol de administrador.{" "}
            <Link href="/admin" className="font-semibold text-brand-teal">
              Ir al panel de admin
            </Link>
          </p>
        )}
      </main>
    </div>
  );
}

export default function AppPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Cargando...</p>}>
      <AppContent />
    </Suspense>
  );
}
