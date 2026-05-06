import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ToolDefinition } from "@/lib/tools/types";

export function ToolCard({ tool }: { tool: ToolDefinition }) {
  const Icon = tool.icon;
  const haystack = (
    tool.name +
    " " +
    tool.description +
    " " +
    tool.keywords.join(" ") +
    " " +
    tool.category
  ).toLowerCase();
  return (
    <Link
      href={`/tools/${tool.slug}`}
      data-tool-card
      data-haystack={haystack}
      className="group block rounded-xl border bg-[color:var(--color-surface)] p-4 hover:border-[color:var(--color-accent)]/50 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-9 rounded-lg border bg-[color:var(--color-bg)] grid place-items-center group-hover:border-[color:var(--color-accent)]/40 transition">
          <Icon className="size-4.5 text-[color:var(--color-accent)]" strokeWidth={1.75} />
        </div>
        <ArrowUpRight className="size-4 text-[color:var(--color-muted)] opacity-0 group-hover:opacity-100 transition" />
      </div>
      <div className="mt-3">
        <div className="font-medium tracking-tight">{tool.name}</div>
        <div className="text-sm text-[color:var(--color-muted)] mt-0.5 line-clamp-2">
          {tool.description}
        </div>
      </div>
    </Link>
  );
}
