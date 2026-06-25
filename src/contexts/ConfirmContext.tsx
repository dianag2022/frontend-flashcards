"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/Button";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
      setOpen(true);
    });
  }, []);

  function close(result: boolean) {
    setOpen(false);
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  const isDanger = options?.tone === "danger";

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && options && (
        <div
          className="confirm-overlay fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="presentation"
          onClick={() => close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            aria-describedby="confirm-dialog-message"
            className="confirm-panel w-full max-w-sm rounded-2xl border border-border bg-card p-6 card-shadow"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="confirm-dialog-title"
              className="mb-2 text-base font-semibold text-foreground"
            >
              {options.title ?? "¿Confirmar acción?"}
            </h2>
            <p
              id="confirm-dialog-message"
              className="text-sm leading-relaxed text-muted"
            >
              {options.message}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" className="px-4 py-2" onClick={() => close(false)}>
                {options.cancelLabel ?? "Cancelar"}
              </Button>
              <Button
                variant={isDanger ? "danger" : "primary"}
                className="px-4 py-2"
                onClick={() => close(true)}
              >
                {options.confirmLabel ?? "Confirmar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within ConfirmProvider");
  }
  return context;
}
