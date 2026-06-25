"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

interface ProfileContentProps {
  backHref: string;
  backLabel: string;
}

function roleLabel(role: string | null | undefined) {
  if (role === "admin") return "Administrador";
  if (role === "end-user") return "Usuario";
  return "Sin rol asignado";
}

export function ProfileContent({ backHref, backLabel }: ProfileContentProps) {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSendResetEmail() {
    if (!user?.email) return;

    setSending(true);
    setMessage("");
    setError("");
    try {
      const response = await api.forgotPassword({ email: user.email });
      setMessage(
        response.message ||
          "Si existe una cuenta con este correo, recibirás un enlace para restablecer tu contraseña.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo enviar el correo de restablecimiento.",
      );
    } finally {
      setSending(false);
    }
  }

  if (!user) {
    return <p className="text-muted">Cargando perfil...</p>;
  }

  return (
    <div className="max-w-xl">
      <Link
        href={backHref}
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <h1 className="mb-2 text-2xl font-bold">Mi perfil</h1>
      <p className="mb-8 text-sm text-muted">
        Administra la información de tu cuenta y tu contraseña.
      </p>

      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold">Cuenta</h2>
        <dl className="space-y-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
            <div>
              <dt className="font-medium text-muted">Correo electrónico</dt>
              <dd className="mt-1 text-foreground">{user.email}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
            <div>
              <dt className="font-medium text-muted">Rol</dt>
              <dd className="mt-1 text-foreground">{roleLabel(user.role)}</dd>
            </div>
          </div>
        </dl>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-brand-teal" />
          <h2 className="text-lg font-semibold">Cambiar contraseña</h2>
        </div>
        <p className="mb-5 text-sm text-muted">
          Te enviaremos un correo con un enlace seguro. Ábrelo y completa el
          restablecimiento en la página de nueva contraseña.
        </p>
        {message && <p className="mb-4 text-sm text-brand-teal">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <Button onClick={handleSendResetEmail} loading={sending}>
          Enviar enlace a mi correo
        </Button>
      </Card>
    </div>
  );
}
