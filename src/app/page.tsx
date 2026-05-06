import { headers } from "next/headers";
import { JsonLd } from "@/components/json-ld";
import { SearchBox } from "@/components/search-box";
import { ToolCard } from "@/components/tool-card";
import { siteConfig } from "@/lib/site-config";
import { categoryOrder, tools } from "@/lib/tools/registry";

export default async function Page() {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const grouped = new Map<string, typeof tools>();
  for (const c of categoryOrder) grouped.set(c, []);
  for (const t of tools) grouped.get(t.category)?.push(t);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${siteConfig.name} — All tools`,
    url: siteConfig.url,
    description: siteConfig.description,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.name,
        description: t.description,
        url: `${siteConfig.url}/tools/${t.slug}`,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} nonce={nonce} />
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-2xl">
          <h1
            className="serif text-4xl sm:text-5xl font-semibold tracking-tight skeuo-emboss"
            style={{ color: "var(--fg)" }}
          >
            A workshop of small, sharp tools.
          </h1>
          <p className="mt-3 text-base" style={{ color: "var(--muted)" }}>
            {siteConfig.toolCount} fast, privacy-friendly utilities you reach
            for every day. Everything runs in your browser — no uploads, no
            tracking.
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
    </>
  );
}
