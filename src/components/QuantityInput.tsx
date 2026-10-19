import { Minus, Plus } from "lucide-react";

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  label = "Quantity",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number | undefined;
  max?: number | undefined;
  disabled?: boolean | undefined;
  label?: string;
}) {
  const clamp = (n: number) => Math.max(min, max != null ? Math.min(max, n) : n);
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex h-10 items-center rounded-md border border-input bg-card"
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        className="flex h-full w-10 items-center justify-center disabled:opacity-40"
        disabled={disabled || value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        aria-label={label}
        inputMode="numeric"
        className="h-full w-10 bg-transparent text-center text-sm tabular-nums"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const text = e.target.value.trim();
          const n = Number(text);
          if (text && Number.isSafeInteger(n)) onChange(clamp(n));
        }}
      />
      <button
        type="button"
        aria-label="Increase quantity"
        className="flex h-full w-10 items-center justify-center disabled:opacity-40"
        disabled={disabled || (max != null && value >= max)}
        onClick={() => onChange(clamp(value + 1))}
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
