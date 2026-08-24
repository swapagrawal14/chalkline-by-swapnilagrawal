import { cn } from "@/lib/utils";
import type { ComponentProps, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return (
    <label
      className={cn("text-[11px] font-medium uppercase tracking-[0.14em] text-muted", className)}
      {...props}
    />
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-9 w-full rounded-sm border border-line bg-elevated px-3 text-sm text-ink outline-none transition-shadow placeholder:text-faint focus:ring-2 focus:ring-marker/30",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md border border-line bg-elevated px-3 py-2 text-sm text-ink outline-none focus:ring-2 focus:ring-marker/30",
        className,
      )}
      {...props}
    />
  );
}

export function NativeSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 w-full rounded-sm border border-line bg-elevated px-2 text-sm text-ink outline-none focus:ring-2 focus:ring-marker/30",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Slider({
  className,
  ...props
}: ComponentProps<"input">) {
  return (
    <input
      type="range"
      className={cn("h-8 w-full accent-marker", className)}
      {...props}
    />
  );
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-2"
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-marker" : "bg-line-strong"}`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-elevated transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`}
        />
      </span>
      {label ? <span className="text-sm text-ink-soft">{label}</span> : null}
    </button>
  );
}
