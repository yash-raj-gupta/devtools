import type { Metadata } from "next";
import Link from "next/link";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 backdrop-blur bg-[color:var(--color-bg)]/80 border-b">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="inline-block size-6 rounded-md bg-[color:var(--color-accent)] grid place-items-center text-[color:var(--color-accent-fg)] font-bold text-xs">
                T
              </span>
              <span className="font-semibold tracking-tight">Toolbench</span>
              <span className="text-[color:var(--color-muted)] text-xs hidden sm:inline">
                · dev utilities
              </span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/"
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)] transition"
              >
                All tools
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="text-[color:var(--color-muted)] hover:text-[color:var(--color-fg)] transition"
              >
                GitHub
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t mt-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-2 sm:items-center justify-between text-xs text-[color:var(--color-muted)]">
            <div>
              Toolbench · Everything runs in your browser. No tracking, no
              uploads.
            </div>
            <div>Built with Next.js</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
