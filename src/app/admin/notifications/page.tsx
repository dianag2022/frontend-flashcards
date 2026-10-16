"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useConfirm } from "@/contexts/ConfirmContext";
import { api } from "@/lib/api";

export default function NotificationsPage() {
  const { token } = useAuth();
  const { confirm } = useConfirm();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!title.trim() || !body.trim()) {
      setError("Completa el título y el mensaje.");
      return;
    }

    const ok = await confirm({
      title: "Enviar aviso",
      message: "Se enviará una notificación push a todos los usuarios de la app móvil.",
      confirmLabel: "Enviar",
    });
    if (!ok) return;

    setSending(true);
    setError("");
    setMessage("");
    try {
      const result = await api.sendNotification(
        { title: title.trim(), body: body.trim(), audience: "all" },
        token,
      );
      const count =
        result.sentCount != null ? ` (${result.sentCount} dispositivos)` : "";
      setMessage(result.message || `Aviso enviado${count}.`);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar. El backend debe exponer POST /api/admin/notifications.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-2 text-2xl font-bold">Avisos push</h1>
      <p className="mb-6 text-sm text-muted">
        Envía una notificación a los usuarios de la app móvil. El backend debe
        reenviarla con Firebase Cloud Messaging.
      </p>

      {message && (
        <Card className="mb-4 border-brand-teal/20 bg-brand-teal/5 p-3 text-sm">
          {message}
        </Card>
      )}
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nuevo contenido publicado"
            required
          />
          <Textarea
            label="Mensaje"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Hay un deck nuevo de memoria listo para estudiar."
            required
          />
          <Button type="submit" loading={sending}>
            <Bell className="h-4 w-4" />
            Enviar a todos
          </Button>
        </form>
      </Card>
    </div>
  );
}
