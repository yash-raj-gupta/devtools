# Toolbench

A growing collection of fast, privacy-friendly developer utilities. Everything
runs in the browser — no uploads, no tracking, no database.

## Tools (v1)

**Encode / Decode**
- Base64 (with URL-safe variant)
- Base32 (RFC 4648)
- URL / percent encoding
- HTML entities
- JWT decoder

**Crypto & Hashing**
- Hash generator (SHA-1, SHA-256, SHA-384, SHA-512)

**Generators**
- UUID v4 (single + bulk)
- Password generator (with entropy estimate)
- Lorem ipsum (paragraphs / sentences / words)

**Formatters / Converters / Text**
- JSON formatter & validator
- Hex ↔ text
- Unix timestamp ↔ date
- Color converter (HEX / RGB / HSL)
- Case converter (camel / Pascal / snake / kebab / CONSTANT / Title …)
- Regex tester with live highlighting

## Run locally

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm start
```

Requires Node 20+.

## Deploy

This is a stateless Next.js app — no env vars, no database. Easiest path:

- **Vercel** — `vercel` from the project root, or import the repo on
  [vercel.com/new](https://vercel.com/new). Zero config.
- **Cloudflare Pages / Netlify / Railway** — also work; pick the Next.js preset.
- **Self-host** — `npm run build && npm start` behind any reverse proxy.

If you ever need persistence (saved snippets, sharing, accounts), this is when a
DB makes sense — the current scope deliberately stays DB-free.

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
   (`Button`, `Textarea`, `Input`, `FieldRow`, `CopyButton`, `ErrorNote`).

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

That's it — the home page picks it up, search indexes it, and
`/tools/mytool` starts working.

### Why split metadata from the component?

Tool components are client modules (`"use client"`), so importing them
server-side gives back proxy references — fields like `slug` would be
`undefined`. By keeping all metadata in `registry.ts` (a plain server module)
and only the component being a client reference, the dynamic route can resolve
the correct tool on the server without breaking the RSC boundary.

## Stack

- Next.js 16 (App Router) on React 19
- Tailwind CSS 4 (CSS-first config)
- Lucide icons
- Zero runtime dependencies on a database, auth, or external APIs

## Roadmap ideas

Easy adds when you want them — each is one new file plus one registry line:

- HMAC generator (SHA-* keyed)
- AES-GCM encrypt/decrypt with a passphrase (Web Crypto)
- RSA / Ed25519 keypair generator
- QR code generator (image)
- Markdown → HTML preview
- YAML ↔ JSON converter
- CSV ↔ JSON converter
- Cron expression explainer
- Diff viewer
- Image to base64 / data URL
