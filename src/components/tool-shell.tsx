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
        className="inline-flex items-center gap-1.5 text-xs hover:text-[color:var(--fg)] transition mb-5"
        style={{ color: "var(--muted)" }}
      >
        <ArrowLeft className="size-3.5" />
        All tools
      </Link>
      <div className="flex items-start gap-3 mb-6">
        <div className="size-12 shrink-0 skeuo-icon-tile grid place-items-center">
          <Icon
            className="size-6"
            strokeWidth={1.75}
            style={{ color: "var(--accent-deep)" }}
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-[1.7rem] font-semibold tracking-tight skeuo-emboss serif">
            {tool.name}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            {tool.description}
          </p>
        </div>
      </div>
      <div className="skeuo-card p-4 sm:p-6 space-y-5">{children}</div>
      <p className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
        Runs entirely in your browser — nothing is sent to a server.
      </p>
    </div>
  );
}
