"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthHeader } from "@/components/AuthHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLoginPage() {
  const { signIn } = useAuth();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <AuthHeader
          subtitle="Un espacio de calma para dominar la psicología"
          panelNote="Panel de administración privado"
        />

        <Card className="p-8">
          <h2 className="mb-6 text-lg font-semibold">Iniciar sesión</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
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
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="mt-2 flex items-center gap-1 text-xs text-muted hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {showPassword ? "Ocultar" : "Mostrar"} contraseña
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            {searchParams.get("registered") && (
              <p className="text-sm text-brand-teal">
                Cuenta creada correctamente. Inicia sesión para continuar.
              </p>
            )}
            {searchParams.get("from") && (
              <p className="text-sm text-muted">Inicia sesión para continuar.</p>
            )}
            <Button type="submit" loading={loading} className="w-full">
              Iniciar sesión
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="font-semibold text-brand-teal hover:text-brand-blue">
              Regístrate
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
