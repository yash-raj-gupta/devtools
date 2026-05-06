import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Build a CSP string for this request.
 *
 * `'strict-dynamic'` means: any script we explicitly nonce (Next's framework
 * bundle, our inline theme script, JSON-LD blocks) implicitly trusts whatever
 * scripts those scripts go on to load. That's how Next's hydration payload
 * stays allowed without a wildcard.
 *
 * In dev we relax the policy because Turbopack uses `eval()` for HMR and
 * inlines its own dev-only scripts.
 */
function buildCsp(nonce: string, isDev: boolean): string {
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' 'unsafe-inline'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`;

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'", // tailwind injects inline styles
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "manifest-src 'self'",
    isDev ? "" : "upgrade-insecure-requests",
  ]
    .filter(Boolean)
    .join("; ");
}

export function middleware(request: NextRequest) {
  // crypto.randomUUID is available in the Edge runtime.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce, process.env.NODE_ENV !== "production");

  // Forward the nonce to server components via a request header. They read it
  // with `headers().get("x-nonce")` and stamp it onto inline <script> tags.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Echoed in the response too — helps Next pick it up for its bundle script.
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Apply to every route EXCEPT the static assets we don't want a CSP on
     * (Next's static chunks, image optimisation, prefetch payloads). The
     * `missing` clause lets prefetches through unmodified — middleware on a
     * prefetch can break navigation.
     */
    {
      source:
        "/((?!_next/static|_next/image|_next/data|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|icon.svg|apple-icon|opengraph-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
        { type: "header", key: "next-action" },
      ],
    },
  ],
};
