"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

type BtnVariant = "default" | "accent" | "ghost";
type BtnSize = "sm" | "md";

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
}) {
  return (
    <button
      className={cn(
        "skeuo-btn",
        variant === "accent" && "skeuo-btn-accent",
        variant === "ghost" && "skeuo-btn-ghost",
        size === "sm" && "skeuo-btn-sm",
        "focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

export function SegmentedControl<T extends string | number>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: ReadonlyArray<{ value: T; label: React.ReactNode }>;
  className?: string;
}) {
  return (
    <div className={cn("skeuo-segment", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className="skeuo-btn"
          data-on={value === opt.value}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function Textarea({
  className,
  mono = true,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean }) {
  return (
    <textarea
      className={cn("skeuo-textarea text-sm", mono && "mono", className)}
      spellCheck={false}
      {...props}
    />
  );
}

export function Input({
  className,
  mono = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { mono?: boolean }) {
  return (
    <input
      className={cn("skeuo-input text-sm", mono && "mono", className)}
      spellCheck={false}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("skeuo-input text-sm", className)} {...props} />;
}

export function Checkbox(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input type="checkbox" {...props} className={cn("skeuo-check", props.className)} />;
}

export function Range(props: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  return <input type="range" {...props} className={cn("skeuo-range", props.className)} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.12em] text-[color:var(--muted)] skeuo-emboss",
        className,
      )}
      {...props}
    />
  );
}

export function CopyButton({
  value,
  className,
  size = "sm",
}: {
  value: string;
  className?: string;
  size?: BtnSize;
}) {
  const [copied, setCopied] = useState(false);
  const onClick = useCallback(async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }, [value]);
  return (
    <Button
      type="button"
      size={size}
      onClick={onClick}
      disabled={!value}
      className={className}
    >
      {copied ? (
        <>
          <Check className="size-3.5" /> Copied
        </>
      ) : (
        <>
          <Copy className="size-3.5" /> Copy
        </>
      )}
    </Button>
  );
}

export function FieldRow({
  label,
  hint,
  children,
  actions,
}: {
  label?: string;
  hint?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {(label || actions) && (
        <div className="flex items-center justify-between gap-2">
          {label ? <Label>{label}</Label> : <span />}
          <div className="flex items-center gap-1.5">{actions}</div>
        </div>
      )}
      {children}
      {hint ? (
        <p className="text-xs text-[color:var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div
      className="rounded-md px-3 py-2 text-xs"
      style={{
        background: "color-mix(in srgb, #c0392b 18%, var(--surface))",
        color: "color-mix(in srgb, #c0392b 70%, var(--fg))",
        border: "1px solid color-mix(in srgb, #c0392b 35%, var(--border))",
        boxShadow:
          "0 1px 0 var(--highlight-soft) inset, 0 1px 2px var(--shadow-soft)",
      }}
    >
      {children}
    </div>
  );
}

export function Panel({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("skeuo-panel p-3", className)}>{children}</div>;
}
