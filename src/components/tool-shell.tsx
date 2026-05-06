import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";

export function ToolShell({
  tool,
  children,
}: {
  tool: ToolDefinition;
  children: React.ReactNode;
}) {
  const Icon = tool.icon;
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)] transition mb-5"
      >
        <ArrowLeft className="size-3.5" />
        All tools
      </Link>
      <div className="flex items-start gap-3 mb-6">
        <div className="size-10 shrink-0 rounded-lg border bg-[color:var(--color-surface)] grid place-items-center">
          <Icon className="size-5 text-[color:var(--color-accent)]" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {tool.name}
          </h1>
          <p className="text-sm text-[color:var(--color-muted)] mt-0.5">
            {tool.description}
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-[color:var(--color-surface)] p-4 sm:p-6 space-y-5">
        {children}
      </div>
      <p className="mt-4 text-xs text-[color:var(--color-muted)]">
        Runs entirely in your browser — nothing is sent to a server.
      </p>
    </div>
  );
}
