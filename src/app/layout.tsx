import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { JsonLd } from "@/components/json-ld";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    locale: "en_US",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: ["/opengraph-image"],
    ...(siteConfig.twitterHandle ? { creator: siteConfig.twitterHandle } : {}),
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: siteConfig.name,
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: siteConfig.themeColor },
    { media: "(prefers-color-scheme: dark)", color: siteConfig.themeColorDark },
  ],
  colorScheme: "light dark",
};

// Inline theme script: applies the saved theme before paint to prevent flash.
const themeScript = `
(function(){try{
  var m = localStorage.getItem('tb-theme');
  if(m === 'light' || m === 'dark') document.documentElement.setAttribute('data-theme', m);
}catch(e){}})();`;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  description: siteConfig.description,
  publisher: {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
  },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <JsonLd data={websiteJsonLd} nonce={nonce} />
        <JsonLd data={orgJsonLd} nonce={nonce} />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur-md skeuo-header-band">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center group" aria-label={siteConfig.name}>
              <Logo />
            </Link>
            <nav
              className="flex items-center gap-2 sm:gap-3 text-sm"
              aria-label="Primary"
            >
              <Link
                href="/"
                className="hidden sm:inline-flex skeuo-btn skeuo-btn-ghost skeuo-btn-sm"
              >
                All tools
              </Link>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
            <div
              className="skeuo-panel px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs"
              style={{ color: "var(--muted)" }}
            >
              <div>
                <span className="skeuo-emboss font-medium" style={{ color: "var(--fg-soft)" }}>
                  {siteConfig.name}
                </span>{" "}
                · Everything runs in your browser. No tracking, no uploads.
              </div>
              <div>Built with Next.js</div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
