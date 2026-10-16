"use client";

import { useEffect, useRef } from "react";
import { Bold, List } from "lucide-react";
import { sanitizeRichText } from "@/lib/rich-text";

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.activeElement === el) return;
    const next = value || "";
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value]);

  function emit() {
    const html = sanitizeRichText(ref.current?.innerHTML ?? "");
    onChange(html);
  }

  function run(command: string) {
    ref.current?.focus();
    document.execCommand(command, false);
    emit();
  }

  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="overflow-hidden rounded-xl border border-border bg-white focus-within:border-brand-teal focus-within:ring-2 focus-within:ring-brand-teal/20">
        <div className="flex gap-1 border-b border-border bg-background/60 px-2 py-1.5">
          <button
            type="button"
            title="Negrita"
            aria-label="Negrita"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("bold")}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Lista con viñetas"
            aria-label="Lista con viñetas"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => run("insertUnorderedList")}
          >
            <List className="h-4 w-4" />
          </button>
          <span className="ml-2 self-center text-[11px] text-muted">
            Enter para salto de línea
          </span>
        </div>
        <div
          ref={ref}
          role="textbox"
          aria-label={label}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className="rich-text min-h-32 px-4 py-3 text-sm outline-none empty:before:text-muted empty:before:content-[attr(data-placeholder)]"
          onInput={emit}
          onBlur={emit}
        />
      </div>
    </label>
  );
}
