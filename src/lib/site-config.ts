import { tools } from "./tools/registry";

const fallbackUrl = "https://toolbench.app";

// NEXT_PUBLIC_SITE_URL lets you point Toolbench at the real domain at build
// time without touching code. Falls back to the placeholder above.
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || fallbackUrl;
const url = rawUrl.replace(/\/$/, "");

export const siteConfig = {
  name: "Toolbench",
  shortName: "Toolbench",
  url,
  /** Hostname only, e.g. "toolbench.app" — useful for OG and canonicals. */
  host: url.replace(/^https?:\/\//, ""),
  tagline: "Fast, no-nonsense developer tools",
  description:
    "A workshop of small, sharp tools for developers. Encode, decode, hash, generate, convert. Everything runs in your browser — no tracking, no uploads, no signup.",
  /** Used in OG / social copy. Counted from the registry, not hardcoded. */
  toolCount: tools.length,
  themeColor: "#b87333",
  themeColorDark: "#1d160d",
  /** Filled in once you have one — leave empty to omit twitter:site. */
  twitterHandle: "",
  /** Top-level keywords for the home page. Per-tool tools add their own. */
  keywords: [
    "developer tools",
    "online tools",
    "free tools",
    "browser tools",
    "encode",
    "decode",
    "base64",
    "base32",
    "url encoder",
    "html entities",
    "jwt decoder",
    "hash generator",
    "sha256",
    "hmac",
    "aes encryption",
    "rsa keypair",
    "ed25519",
    "uuid generator",
    "password generator",
    "qr code generator",
    "lorem ipsum",
    "json formatter",
    "markdown preview",
    "yaml to json",
    "csv to json",
    "regex tester",
    "diff viewer",
    "case converter",
    "slugify",
  ],
} as const;

export type SiteConfig = typeof siteConfig;
