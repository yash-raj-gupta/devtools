"use client";

import DOMPurify from "dompurify";
import { marked } from "marked";
import { useEffect, useState } from "react";
import { CopyButton, FieldRow, SegmentedControl, Textarea } from "@/components/ui";

// Marked v8+ removed its sanitizer — every render goes through DOMPurify so
// pasted markdown like `<img src=x onerror=alert(1)>` can't execute in our
// origin (where it could read localStorage, hit fetch, etc).
function sanitize(html: string): string {
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style"],
    FORBID_ATTR: ["onerror", "onload", "onclick"],
  });
}

const SAMPLE = `# Hello, world

Markdown rendered **live** in your browser.

- Lists work
- *Italic* and **bold**
- \`inline code\`

\`\`\`ts
function add(a: number, b: number) {
  return a + b;
}
\`\`\`

> Block quotes too.

[Link](https://toolbench.app)
`;

export default function Component() {
  const [src, setSrc] = useState(SAMPLE);
  const [view, setView] = useState<"preview" | "html">("preview");
  const [html, setHtml] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.resolve(marked.parse(src, { gfm: true, breaks: true })).then((h) => {
      if (cancelled) return;
      const raw = typeof h === "string" ? h : "";
      setHtml(sanitize(raw));
    });
    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldRow label="Markdown">
          <Textarea
            mono
            value={src}
            onChange={(e) => setSrc(e.target.value)}
            className="min-h-[260px]"
          />
        </FieldRow>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <SegmentedControl
              value={view}
              onChange={setView}
              options={[
                { value: "preview", label: "Preview" },
                { value: "html", label: "HTML" },
              ]}
            />
            <CopyButton value={view === "html" ? html : src} />
          </div>
          {view === "preview" ? (
            <div
              className="skeuo-inset px-4 py-3 min-h-[260px] prose-md"
              style={{ overflow: "auto" }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <Textarea readOnly mono value={html} className="min-h-[260px]" />
          )}
        </div>
      </div>

      <style>{`
        .prose-md h1, .prose-md h2, .prose-md h3 { font-family: var(--font-serif); font-weight: 600; margin: 1rem 0 .5rem; }
        .prose-md h1 { font-size: 1.5rem; }
        .prose-md h2 { font-size: 1.2rem; }
        .prose-md h3 { font-size: 1.05rem; }
        .prose-md p { margin: .5rem 0; line-height: 1.55; }
        .prose-md ul, .prose-md ol { padding-left: 1.4rem; margin: .5rem 0; }
        .prose-md li { margin: .15rem 0; }
        .prose-md code { font-family: var(--font-mono); background: var(--surface-lo); padding: 0 .25em; border-radius: 4px; border: 1px solid var(--border); }
        .prose-md pre { font-family: var(--font-mono); background: var(--surface-lo); border: 1px solid var(--border); border-radius: 8px; padding: .75rem 1rem; overflow: auto; box-shadow: 0 1px 2px var(--inset) inset; }
        .prose-md pre code { background: transparent; border: 0; padding: 0; }
        .prose-md blockquote { border-left: 3px solid var(--accent); margin: .5rem 0; padding: .25rem .75rem; color: var(--muted); }
        .prose-md a { color: var(--accent-deep); text-decoration: underline; }
        .prose-md hr { border: 0; height: 1px; background: var(--border); margin: 1rem 0; }
        .prose-md table { border-collapse: collapse; }
        .prose-md th, .prose-md td { border: 1px solid var(--border); padding: .25rem .5rem; }
      `}</style>
    </>
  );
}
