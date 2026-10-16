"use client";

import { CATEGORY_COLORS, categoryColorLabel } from "@/lib/category-colors";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  compact?: boolean;
}

export function ColorPicker({ value, onChange, compact = false }: ColorPickerProps) {
  return (
    <fieldset className="space-y-2">
      {!compact && (
        <>
          <legend className="text-sm font-medium text-foreground">
            Color del subtema
          </legend>
          <p className="text-xs text-muted">
            Este color identifica la categoría en el panel y en la app móvil.
          </p>
        </>
      )}
      <div className="flex flex-wrap gap-2">
        {CATEGORY_COLORS.map((item) => {
          const selected = value.toLowerCase() === item.hex.toLowerCase();
          return (
            <button
              key={item.hex}
              type="button"
              title={item.label}
              aria-label={item.label}
              aria-pressed={selected}
              onClick={() => onChange(item.hex)}
              className={`h-8 w-8 rounded-full border-2 transition ${
                selected
                  ? "border-foreground ring-2 ring-brand-teal/30"
                  : "border-white hover:scale-105"
              }`}
              style={{ backgroundColor: item.hex }}
            />
          );
        })}
      </div>
      {!compact && (
        <p className="text-sm text-muted">
          Seleccionado:{" "}
          <span className="inline-flex items-center gap-2 font-medium text-foreground">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: value }}
            />
            {categoryColorLabel(value)}
          </span>
        </p>
      )}
    </fieldset>
  );
}
