"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const loginHref = from === "admin" ? "/admin/login" : "/login";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo procesar la solicitud.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthHeader subtitle="Recupera el acceso a tu cuenta" />

        <Card className="p-8">
          <Link
            href={loginHref}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio de sesión
          </Link>

          <h2 className="mb-2 text-lg font-semibold">¿Olvidaste tu contraseña?</h2>
          <p className="mb-6 text-sm text-muted">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu
            contraseña.
          </p>

          {sent ? (
            <div className="space-y-4 text-sm">
              <p className="text-brand-teal">
                Si existe una cuenta con ese correo, recibirás un enlace para
                restablecer tu contraseña. Revisa tu bandeja de entrada y spam.
              </p>
              <Link
                href={loginHref}
                className="inline-block font-semibold text-[#297197] hover:opacity-80"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@ejemplo.com"
                icon={<Mail className="h-4 w-4" />}
                required
                autoComplete="email"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" loading={loading} className="w-full">
                Enviar enlace
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Cargando...</p>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}
