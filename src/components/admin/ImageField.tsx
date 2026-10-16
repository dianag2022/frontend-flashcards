"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface ImageFieldProps {
  label: string;
  value?: string | null;
  onChange: (url: string) => void;
}

const MAX_BYTES = 4 * 1024 * 1024;

export function ImageField({ label, value, onChange }: ImageFieldProps) {
  const { token } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlDraft, setUrlDraft] = useState("");

  async function handleFile(file?: File) {
    if (!file || !token) return;
    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen (JPG, PNG o WebP).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("La imagen no puede superar 4 MB.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadImage(file, token);
      onChange(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo subir la imagen. Revisa el endpoint de uploads.",
      );
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {value ? (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="h-20 w-20 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted">{value}</p>
            <IconButton
              label="Quitar imagen"
              variant="danger"
              className="mt-2"
              onClick={() => onChange("")}
            >
              <Trash2 className="h-4 w-4" />
            </IconButton>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            disabled={uploading || !token}
            onClick={() => inputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-white px-4 py-6 text-sm text-muted transition hover:border-brand-teal/40 hover:text-foreground disabled:opacity-60"
          >
            <ImagePlus className="h-4 w-4" />
            {uploading ? "Subiendo..." : "Subir imagen"}
          </button>
          <Input
            label="O pega una URL"
            value={urlDraft}
            placeholder="https://..."
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={() => {
              const next = urlDraft.trim();
              if (next) {
                onChange(next);
                setUrlDraft("");
              }
            }}
          />
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
