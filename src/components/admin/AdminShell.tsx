"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/signup";

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/admin">
            <Logo size="sm" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground"
            >
              <Layers className="h-4 w-4" />
              Mazos
            </Link>
            {user && <UserMenu email={user.email} profileHref="/admin/profile" />}
            <Button variant="ghost" onClick={() => signOut("/admin/login")} className="px-3 py-2">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
