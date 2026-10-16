"use client";

import { DECK_EMOJIS } from "@/lib/deck-emojis";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-foreground">Emoji del área</legend>
      <p className="text-xs text-muted">
        Este emoji se guarda con el deck y se muestra en la app móvil.
      </p>
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-8">
        {DECK_EMOJIS.map((item) => {
          const selected = value === item.emoji;
          return (
            <button
              key={item.emoji}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={selected}
              onClick={() => onChange(item.emoji)}
              className={`flex h-11 items-center justify-center rounded-xl border text-xl transition ${
                selected
                  ? "border-brand-teal bg-brand-teal/10 ring-2 ring-brand-teal/30"
                  : "border-border bg-white hover:border-brand-teal/40 hover:bg-background"
              }`}
            >
              {item.emoji}
            </button>
          );
        })}
      </div>
      <p className="text-sm text-muted">
        Seleccionado: <span className="text-base">{value}</span>{" "}
        {DECK_EMOJIS.find((item) => item.emoji === value)?.label ?? ""}
      </p>
    </fieldset>
  );
}
