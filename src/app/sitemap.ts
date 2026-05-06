import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
import { tools } from "@/lib/tools/registry";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    {
      url: siteConfig.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...tools.map((t) => ({
      url: `${siteConfig.url}/tools/${t.slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
