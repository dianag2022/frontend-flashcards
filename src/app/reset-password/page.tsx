"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const oobCodeFromUrl =
    searchParams.get("oobCode") ?? searchParams.get("oob_code") ?? "";
  const from = searchParams.get("from");
  const loginHref = from === "admin" ? "/admin/login" : "/login";

  const [oobCode, setOobCode] = useState(oobCodeFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (!oobCode.trim()) {
      setError("Falta el código de restablecimiento. Usa el enlace del correo.");
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({ oobCode: oobCode.trim(), newPassword: password });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo restablecer la contraseña.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthHeader subtitle="Establece una nueva contraseña" />

        <Card className="p-8">
          {success ? (
            <div className="space-y-4 text-sm">
              <p className="text-brand-teal">
                Contraseña actualizada correctamente. Ya puedes iniciar sesión con
                tu nueva contraseña.
              </p>
              <Link
                href={`${loginHref}?reset=success`}
                className="inline-block font-semibold text-[#297197] hover:opacity-80"
              >
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-lg font-semibold">Nueva contraseña</h2>
              <p className="mb-6 text-sm text-muted">
                Introduce el código del correo y tu nueva contraseña.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                {!oobCodeFromUrl && (
                  <Input
                    label="Código de restablecimiento"
                    value={oobCode}
                    onChange={(e) => setOobCode(e.target.value)}
                    placeholder="Código del enlace del correo"
                    icon={<KeyRound className="h-4 w-4" />}
                    required
                  />
                )}

                <div>
                  <Input
                    label="Nueva contraseña"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    icon={<Lock className="h-4 w-4" />}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 text-brand-teal" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 text-brand-teal" />
                    )}
                    {showPassword ? "Ocultar" : "Mostrar"} contraseña
                  </button>
                </div>

                <Input
                  label="Confirmar contraseña"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  icon={<Lock className="h-4 w-4" />}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button type="submit" loading={loading} className="w-full">
                  Guardar contraseña
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted">
                <Link
                  href={`/forgot-password${from ? `?from=${from}` : ""}`}
                  className="font-semibold text-[#297197] hover:opacity-80"
                >
                  Solicitar un nuevo enlace
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Cargando...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
