# Toolbench — security notes

Toolbench has an unusually small attack surface: no backend, no database, no
auth, no API endpoints, no user-controlled data leaving the browser. This
file documents the controls we *do* have and the threats we explicitly
accept.

## Controls in place

### Output sanitisation
- The Markdown tool's rendered HTML is filtered through **DOMPurify**
  (`src/lib/tools/markdown/index.tsx`) before being injected with
  `dangerouslySetInnerHTML`. Marked v8+ ships no built-in sanitiser.
- The Regex tester pre-escapes all text via `escapeHtml()` before injecting
  highlight markup — the only HTML in the output is our own `<mark>` tags.
- JSON-LD payloads pass through `safeStringify()`
  (`src/components/json-ld.tsx`) which escapes `<`, `>`, `&`, U+2028 and
  U+2029, preventing `</script>` break-out and JSON-parse failures.

### Sandboxing
- The Regex tester runs the user's pattern in a Web Worker
  (`public/regex-worker.js`) with a **350 ms timeout**. Catastrophic
  backtracking is killed by terminating the worker — the main thread never
  blocks. Output is also capped at 10,000 matches.

### HTTP headers (`next.config.ts`)
Set on every response:
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (clickjacking)
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — opts out of camera, microphone, geolocation,
  accelerometer, gyroscope, magnetometer, payment, USB, FLoC.
- `X-DNS-Prefetch-Control: off`
- `X-XSS-Protection: 0` (the modern recommendation — the legacy filter
  itself has caused vulns; CSP replaces it).

### Content-Security-Policy (`middleware.ts`)
A fresh nonce is generated per request and used to allow-list:
- our inline theme script in `<head>`,
- JSON-LD blocks emitted by `<JsonLd>`,
- Next.js's framework bundle (which carries `'strict-dynamic'` reach to its
  hydration payload).

In production the policy is:
```
default-src 'self';
script-src 'self' 'nonce-…' 'strict-dynamic';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
worker-src 'self' blob:;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
manifest-src 'self';
upgrade-insecure-requests;
```

In development the script-src adds `'unsafe-eval' 'unsafe-inline'` so
Turbopack HMR works.

### Privacy
- No analytics, no third-party scripts, no fonts from a CDN.
- No data leaves the browser. Crypto tools (AES, RSA, Ed25519, Hash, HMAC,
  Password) all use Web Crypto on the client.
- localStorage holds only the theme preference (`tb-theme`).

## Known accepted issues

### `postcss` moderate advisory (GHSA-qx2v-qp2m-jg93)
- Source: `next → postcss < 8.5.10`
- Triggered only when postcss stringifies attacker-controlled CSS at build
  time. Toolbench's only build-time CSS is `globals.css`, which we author.
  Not exploitable in this codebase.
- Will auto-resolve once Next bumps its bundled postcss. Not worth pinning
  Next backwards.

## Reporting

If you find an actual vulnerability, please email <security@toolbench.app>
(once the domain is live) with details and a proof-of-concept. Don't open a
public issue.
