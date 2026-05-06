# Toolbench

A growing collection of fast, privacy-friendly developer utilities. Everything
runs in the browser — no uploads, no tracking, no database. The UI is
skeuomorphic (brass + paper in light mode, walnut leather + brass in dark) with
a built-in theme toggle.

## Tools (v2 — 29 total)

**Encode / Decode**
- Base64 (with URL-safe variant)
- Base32 (RFC 4648)
- URL / percent encoding
- HTML entities
- Hex ↔ text
- JWT decoder
- Image ↔ data URL

**Crypto & Hashing**
- Hash generator (SHA-1, SHA-256, SHA-384, SHA-512)
- HMAC generator (SHA-256/384/512/SHA-1)
- AES-256-GCM encrypt / decrypt with passphrase (PBKDF2-derived key)
- RSA keypair generator (2048 / 3072 / 4096)
- Ed25519 keypair generator

**Generators**
- UUID v4 (single + bulk)
- Password generator (with entropy estimate)
- QR code generator (size, error-correction, custom colors, PNG download)
- Lorem ipsum (paragraphs / sentences / words)

**Formatters**
- JSON formatter & validator
- Markdown preview (GFM, side-by-side)

**Converters**
- YAML ↔ JSON
- CSV ↔ JSON
- Unix timestamp ↔ date
- Color (HEX / RGB / HSL with live preview)
- Number base (bin / oct / dec / hex)
- Cron explainer (with handy presets)

**Text**
- Regex tester with live highlighting
- Case converter (camel / Pascal / snake / kebab / CONSTANT / Title …)
- Slugify (URL-safe slugs with diacritic stripping)
- Diff viewer (line-by-line, additions / deletions)
- Text statistics (chars, words, lines, sentences, reading time)

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Requires Node 20+.

## Deploy

Stateless Next.js app — no env vars, no database. Easiest path:

- **Vercel** — `vercel` from the project root, or import the repo on
  [vercel.com/new](https://vercel.com/new). Zero config.
- **Cloudflare Pages / Netlify / Railway** — also work; pick the Next.js preset.
- **Self-host** — `npm run build && npm start` behind any reverse proxy.

## Adding a new tool

The architecture is a flat registry. Adding a tool is two steps:

1. Create `src/lib/tools/<slug>/index.tsx`. It must start with `"use client"`
   and `export default` a React component:

   ```tsx
   "use client";
   export default function Component() {
     // your tool UI
     return <>…</>;
   }
   ```

   Use the shared primitives from `src/components/ui.tsx`
   (`Button`, `Textarea`, `Input`, `Checkbox`, `Range`, `SegmentedControl`,
   `FieldRow`, `CopyButton`, `ErrorNote`, `Panel`).

2. Register it in `src/lib/tools/registry.ts`:

   ```ts
   import MyTool from "./mytool";
   import { Wrench } from "lucide-react";

   export const tools: ToolDefinition[] = [
     // …existing tools…
     {
       slug: "mytool",
       name: "My Tool",
       description: "What it does, in one line.",
       category: "Generators",       // see ToolCategory in types.ts
       keywords: ["my", "tool"],
       icon: Wrench,
       Component: MyTool,
     },
   ];
   ```

That's it — the home page picks it up, the search indexes it, and
`/tools/mytool` starts working.

### Why split metadata from the component?

Tool components are client modules (`"use client"`), so importing them
server-side gives back proxy references — fields like `slug` would be
`undefined` if metadata were defined alongside. By keeping all metadata in
`registry.ts` (a plain server module) and importing only the component as a
client reference, the dynamic route resolves the correct tool on the server
without breaking the RSC boundary.

## Theming

The theme is skeuomorphic by design — soft drop-shadows, top-edge highlights,
inset paper for inputs, raised brass for primary actions. Colors live in
CSS custom properties in `src/app/globals.css`:

- `--bg`, `--bg-deep`, `--surface`, `--surface-hi`, `--surface-lo`
- `--fg`, `--fg-soft`, `--muted`
- `--accent`, `--accent-hi`, `--accent-deep`, `--accent-fg`
- `--border`, `--border-strong`, `--highlight`, `--shadow-soft`, `--shadow-deep`

Light is the default; dark loads under `[data-theme="dark"]` or via system
preference (with no explicit override). The `ThemeToggle` cycles
**System → Light → Dark** and persists the choice in `localStorage` under
`tb-theme`. An inline script in `<head>` applies the saved theme before paint
so there's no flash.

## Stack

- Next.js 16 (App Router) on React 19
- Tailwind CSS 4 (CSS-first config)
- Lucide icons
- Tool-specific libs: `qrcode`, `marked`, `yaml`, `cronstrue`, `diff`
- Zero database, auth, or external API calls

## Roadmap ideas

Easy adds when you want them — each is one file plus one registry line:

- ASCII / Unicode codepoint inspector
- Mock JSON / fake-data generator
- IP address tools (CIDR calculator, IPv6 expand)
- Diff for JSON (semantic)
- TOTP code generator
- BIP39 mnemonic generator (be careful with bundle size)
- SQL formatter
- TS interface ↔ JSON
