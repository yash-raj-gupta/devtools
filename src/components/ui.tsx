"use client";

import { Check, Copy } from "lucide-react";
import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";

export function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "accent";
  size?: "sm" | "md";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-md font-medium transition disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3.5 text-sm",
        variant === "default" &&
          "bg-[color:var(--color-fg)] text-[color:var(--color-bg)] hover:opacity-90",
        variant === "accent" &&
          "bg-[color:var(--color-accent)] text-[color:var(--color-accent-fg)] hover:opacity-90",
        variant === "outline" &&
          "border bg-[color:var(--color-surface)] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
        variant === "ghost" &&
          "hover:bg-black/[0.04] dark:hover:bg-white/[0.05] text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)]",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  mono = true,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { mono?: boolean }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border bg-[color:var(--color-surface)] px-3 py-2.5 text-sm placeholder:text-[color:var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40 resize-y min-h-[140px]",
        mono && "mono",
        className,
      )}
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
      className={cn(
        "h-9 w-full rounded-md border bg-[color:var(--color-surface)] px-3 text-sm placeholder:text-[color:var(--color-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40",
        mono && "mono",
        className,
      )}
      spellCheck={false}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-9 rounded-md border bg-[color:var(--color-surface)] px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/40",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-medium uppercase tracking-wide text-[color:var(--color-muted)]",
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
  size?: "sm" | "md";
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
      variant="outline"
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
  label: string;
  hint?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <div className="flex items-center gap-1.5">{actions}</div>
      </div>
      {children}
      {hint ? (
        <p className="text-xs text-[color:var(--color-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/5 px-3 py-2 text-xs text-red-600 dark:text-red-400">
      {children}
    </div>
  );
}
