import type { NextConfig } from "next";
import path from "node:path";

/**
 * Security-relevant response headers applied to every route.
 *
 * The Content-Security-Policy header is intentionally NOT set here — it is
 * set per-request by `middleware.ts` so each response carries a fresh nonce
 * and Next's own injected scripts can be allow-listed via that nonce.
 */
const securityHeaders = [
  // 2 years, include subdomains, eligible for the HSTS preload list.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Browsers won't sniff a non-matching MIME type.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Hard backstop in case CSP is ever stripped — block all framing.
  { key: "X-Frame-Options", value: "DENY" },
  // Send origin only on cross-origin nav, full URL on same-origin.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Toolbench doesn't use any of these — explicitly opt out so a future
  // bug or supply-chain issue can't quietly start using them.
  {
    key: "Permissions-Policy",
    value: [
      "accelerometer=()",
      "camera=()",
      "geolocation=()",
      "gyroscope=()",
      "magnetometer=()",
      "microphone=()",
      "payment=()",
      "usb=()",
      "interest-cohort=()",
    ].join(", "),
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-XSS-Protection", value: "0" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
