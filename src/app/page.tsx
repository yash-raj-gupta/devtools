import { SearchBox } from "@/components/search-box";
import { ToolCard } from "@/components/tool-card";
import { categoryOrder, tools } from "@/lib/tools/registry";

export default function Page() {
  const grouped = new Map<string, typeof tools>();
  for (const c of categoryOrder) grouped.set(c, []);
  for (const t of tools) grouped.get(t.category)?.push(t);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
      <div className="max-w-2xl">
        <h1
          className="serif text-4xl sm:text-5xl font-semibold tracking-tight skeuo-emboss"
          style={{ color: "var(--fg)" }}
        >
          A workshop of small, sharp tools.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--muted)" }}>
          A growing collection of utilities you reach for every day. Everything
          runs in your browser — no uploads, no tracking.
        </p>
      </div>

      <div className="mt-8">
        <SearchBox />
      </div>

      <div className="mt-10 space-y-10">
        {categoryOrder.map((cat) => {
          const list = grouped.get(cat) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={cat} data-tool-section>
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.18em] mb-3 skeuo-emboss"
                style={{ color: "var(--accent-deep)" }}
              >
                {cat}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {list.map((t) => (
                  <ToolCard key={t.slug} tool={t} />
                ))}
              </div>
            </section>
          );
        })}
        <div
          data-empty-state
          style={{ display: "none", color: "var(--muted)" }}
          className="text-sm"
        >
          No tools match your search. Try a different keyword.
        </div>
      </div>
    </div>
  );
}
