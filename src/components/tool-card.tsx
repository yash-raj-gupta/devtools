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
      className="group block skeuo-card p-4 transition hover:-translate-y-0.5 hover:[box-shadow:0_2px_0_var(--highlight)_inset,0_-1px_0_var(--inset)_inset,0_2px_4px_var(--shadow-soft),0_14px_28px_-10px_var(--shadow-deep)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="size-10 skeuo-icon-tile grid place-items-center">
          <Icon
            className="size-5"
            strokeWidth={1.75}
            style={{ color: "var(--accent-deep)" }}
          />
        </div>
        <ArrowUpRight
          className="size-4 opacity-0 group-hover:opacity-100 transition"
          style={{ color: "var(--muted)" }}
        />
      </div>
      <div className="mt-3">
        <div className="font-semibold tracking-tight skeuo-emboss">
          {tool.name}
        </div>
        <div
          className="text-sm mt-0.5 line-clamp-2"
          style={{ color: "var(--muted)" }}
        >
          {tool.description}
        </div>
      </div>
    </Link>
  );
}
