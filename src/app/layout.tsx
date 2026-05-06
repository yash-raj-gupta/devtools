import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Toolbench — fast, no-nonsense developer tools",
    template: "%s · Toolbench",
  },
  description:
    "A growing collection of fast, privacy-friendly tools for developers. Encode, decode, hash, generate, convert. All in your browser.",
  applicationName: "Toolbench",
  authors: [{ name: "Toolbench" }],
  metadataBase: new URL("https://toolbench.app"),
};

// Inline theme script: applies the saved theme before paint to prevent flash.
const themeScript = `
(function(){try{
  var m = localStorage.getItem('tb-theme');
  if(m === 'light' || m === 'dark') document.documentElement.setAttribute('data-theme', m);
}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur-md skeuo-header-band">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center group">
              <Logo />
            </Link>
            <nav className="flex items-center gap-2 sm:gap-3 text-sm">
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
                  Toolbench
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
