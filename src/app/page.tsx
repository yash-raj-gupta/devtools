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
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
          Fast, no-nonsense developer tools.
        </h1>
        <p className="mt-3 text-[color:var(--color-muted)]">
          A growing collection of utilities you reach for every day. Everything
          runs in your browser — no uploads, no tracking.
        </p>
      </div>

      <div className="mt-7">
        <SearchBox />
      </div>

      <div className="mt-10 space-y-10">
        {categoryOrder.map((cat) => {
          const list = grouped.get(cat) ?? [];
          if (list.length === 0) return null;
          return (
            <section key={cat} data-tool-section>
              <h2 className="text-xs font-medium uppercase tracking-wider text-[color:var(--color-muted)] mb-3">
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
          style={{ display: "none" }}
          className="text-sm text-[color:var(--color-muted)]"
        >
          No tools match your search. Try a different keyword.
        </div>
      </div>
    </div>
  );
}
