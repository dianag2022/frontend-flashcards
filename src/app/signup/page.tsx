"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthHeader } from "@/components/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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

    setLoading(true);
    try {
      await signUp(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthHeader subtitle="Un espacio de calma para dominar la psicología" />

        <Card className="p-8">
          <h2 className="mb-2 text-lg font-semibold">Crear cuenta de administrador</h2>
          <p className="mb-6 text-sm text-muted">
            Se creará una cuenta con permisos para gestionar mazos y flashcards.
          </p>
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
            <div>
              <Input
                label="Contraseña"
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
              Registrarse
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link href="/admin/login" className="font-semibold text-brand-teal hover:text-brand-blue">
              Inicia sesión
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
