import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/json-ld";
import { ToolShell } from "@/components/tool-shell";
import { siteConfig } from "@/lib/site-config";
import { getTool, tools } from "@/lib/tools/registry";

export function generateStaticParams() {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) return {};
  const url = `/tools/${tool.slug}`;
  return {
    title: tool.name,
    description: tool.description,
    keywords: [...tool.keywords, tool.category, ...siteConfig.keywords].slice(
      0,
      30,
    ),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: siteConfig.name,
      title: `${tool.name} · ${siteConfig.name}`,
      description: tool.description,
      url,
      images: [
        {
          url: "/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${tool.name} — ${siteConfig.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${tool.name} · ${siteConfig.name}`,
      description: tool.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getTool(slug);
  if (!tool) notFound();
  const { Component } = tool;
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  const toolUrl = `${siteConfig.url}/tools/${tool.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description,
    url: toolUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires a modern browser (Chrome, Safari, Firefox, Edge)",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    keywords: tool.keywords.join(", "),
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteConfig.name,
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tool.category,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tool.name,
        item: toolUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={jsonLd} nonce={nonce} />
      <JsonLd data={breadcrumbs} nonce={nonce} />
      <ToolShell tool={tool}>
        <Component />
      </ToolShell>
    </>
  );
}
