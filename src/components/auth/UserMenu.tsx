"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User } from "lucide-react";

interface UserMenuProps {
  email: string;
  profileHref: string;
}

export function UserMenu({ email, profileHref }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-brand-teal transition hover:bg-background hover:text-brand-teal"
      >
        <User className="h-5 w-5" />
        <span className="sr-only">Menú de usuario</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 min-w-72 max-w-sm rounded-xl border border-border bg-white py-1 card-shadow"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-medium text-muted">Cuenta</p>
            <p className="mt-0.5 break-all text-sm leading-snug text-foreground">{email}</p>
          </div>
          <Link
            href={profileHref}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-foreground transition hover:bg-background"
          >
            <User className="h-4 w-4 text-brand-teal" />
            Mi perfil
          </Link>
        </div>
      )}
    </div>
  );
}
