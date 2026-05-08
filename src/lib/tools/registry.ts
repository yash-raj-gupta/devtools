import {
  AlignLeft,
  ArrowLeftRight,
  Binary,
  Boxes,
  Braces,
  CalendarClock,
  CaseSensitive,
  Clock,
  Code2,
  FileImage,
  FileJson,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  GitCompare,
  Hash,
  Key,
  KeyRound,
  Link2,
  Lock,
  Palette,
  Quote,
  QrCode,
  Regex,
  ShieldCheck,
  ShieldEllipsis,
  Terminal,
  TextSelect,
  Type,
} from "lucide-react";

import type { ToolCategory, ToolDefinition } from "./types";

import Aes from "./aes";
import Base32 from "./base32";
import Base64 from "./base64";
import CaseTool from "./case";
import CmdTeller from "./cmd-teller";
import Color from "./color";
import Cron from "./cron";
import Csv from "./csv";
import Diff from "./diff";
import Ed25519 from "./ed25519-keys";
import HashTool from "./hash";
import Hex from "./hex";
import Hmac from "./hmac";
import Html from "./html";
import ImageDataUrl from "./image-data-url";
import Json from "./json";
import Jwt from "./jwt";
import Lorem from "./lorem";
import Markdown from "./markdown";
import NumberBase from "./number-base";
import Password from "./password";
import QrCodeTool from "./qrcode";
import RegexTool from "./regex";
import Rsa from "./rsa-keys";
import Slugify from "./slugify";
import Stringify from "./stringify";
import TextStats from "./text-stats";
import Timestamp from "./timestamp";
import UrlTool from "./url";
import Uuid from "./uuid";
import Yaml from "./yaml";

// Add a tool: write src/lib/tools/<slug>/index.tsx (a "use client" module that
// default-exports a React component) and add an entry to the array below.
export const tools: ToolDefinition[] = [
  // ── Encode / Decode ──────────────────────────────────────────────────
  {
    slug: "base64",
    name: "Base64 Encode / Decode",
    description: "Encode text to Base64 or decode Base64 back to text. Supports URL-safe variant.",
    category: "Encode / Decode",
    keywords: ["base64", "encode", "decode", "btoa", "atob", "base64url"],
    icon: Braces,
    Component: Base64,
  },
  {
    slug: "base32",
    name: "Base32 Encode / Decode",
    description: "Encode and decode Base32 strings (RFC 4648, A–Z + 2–7).",
    category: "Encode / Decode",
    keywords: ["base32", "encode", "decode", "rfc4648"],
    icon: Boxes,
    Component: Base32,
  },
  {
    slug: "url",
    name: "URL Encode / Decode",
    description: "Percent-encode or decode URLs and query parameters.",
    category: "Encode / Decode",
    keywords: ["url", "uri", "percent", "encode", "decode", "query"],
    icon: Link2,
    Component: UrlTool,
  },
  {
    slug: "html-entities",
    name: "HTML Entities Encode / Decode",
    description: "Escape or unescape HTML entities like &amp;, &lt;, and &#39;.",
    category: "Encode / Decode",
    keywords: ["html", "entities", "escape", "unescape", "amp", "lt", "gt"],
    icon: Code2,
    Component: Html,
  },
  {
    slug: "hex",
    name: "Hex ↔ Text",
    description: "Convert any UTF-8 text to hex bytes and back. Whitespace is ignored when decoding.",
    category: "Converters",
    keywords: ["hex", "hexadecimal", "bytes", "text", "convert"],
    icon: Binary,
    Component: Hex,
  },
  {
    slug: "jwt",
    name: "JWT Decoder",
    description: "Decode the header and payload of a JSON Web Token. Signature is not verified.",
    category: "Encode / Decode",
    keywords: ["jwt", "json web token", "decode", "auth"],
    icon: KeyRound,
    Component: Jwt,
  },
  {
    slug: "image-data-url",
    name: "Image ↔ Data URL",
    description: "Drop an image to get a base64 data URL, or paste a data URL to preview it.",
    category: "Encode / Decode",
    keywords: ["image", "data url", "base64", "embed", "png", "jpg", "svg"],
    icon: FileImage,
    Component: ImageDataUrl,
  },

  // ── Crypto & Hashing ────────────────────────────────────────────────
  {
    slug: "hash",
    name: "Hash Generator",
    description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text. Powered by Web Crypto.",
    category: "Crypto & Hashing",
    keywords: ["hash", "sha", "sha1", "sha256", "sha512", "digest", "checksum"],
    icon: Fingerprint,
    Component: HashTool,
  },
  {
    slug: "hmac",
    name: "HMAC Generator",
    description: "Sign messages with HMAC-SHA-256/384/512/SHA-1 using a shared secret. Hex + base64 output.",
    category: "Crypto & Hashing",
    keywords: ["hmac", "sign", "mac", "sha", "secret", "auth"],
    icon: ShieldEllipsis,
    Component: Hmac,
  },
  {
    slug: "aes",
    name: "AES-256-GCM Encrypt / Decrypt",
    description: "Encrypt or decrypt text with a passphrase. PBKDF2-derived key, fresh salt + IV per message.",
    category: "Crypto & Hashing",
    keywords: ["aes", "gcm", "encrypt", "decrypt", "passphrase", "pbkdf2"],
    icon: Lock,
    Component: Aes,
  },
  {
    slug: "rsa-keys",
    name: "RSA Keypair Generator",
    description: "Generate 2048 / 3072 / 4096-bit RSA keypairs and export them as PEM (PKCS#8 + SPKI).",
    category: "Crypto & Hashing",
    keywords: ["rsa", "keypair", "pem", "pkcs8", "spki", "public", "private"],
    icon: Key,
    Component: Rsa,
  },
  {
    slug: "ed25519-keys",
    name: "Ed25519 Keypair Generator",
    description: "Generate modern, fast Ed25519 keypairs and export them as PEM (PKCS#8 + SPKI).",
    category: "Crypto & Hashing",
    keywords: ["ed25519", "ssh", "keypair", "elliptic", "curve", "pem"],
    icon: Key,
    Component: Ed25519,
  },

  // ── Generators ──────────────────────────────────────────────────────
  {
    slug: "uuid",
    name: "UUID Generator",
    description: "Generate one or many cryptographically-random UUIDv4 identifiers.",
    category: "Generators",
    keywords: ["uuid", "guid", "v4", "id", "random"],
    icon: Hash,
    Component: Uuid,
  },
  {
    slug: "password",
    name: "Password Generator",
    description: "Generate cryptographically random passwords with configurable length and character sets.",
    category: "Generators",
    keywords: ["password", "random", "generator", "secure", "entropy"],
    icon: ShieldCheck,
    Component: Password,
  },
  {
    slug: "qrcode",
    name: "QR Code Generator",
    description: "Generate QR codes from any text or URL, with custom size, error correction, and colors.",
    category: "Generators",
    keywords: ["qr", "qrcode", "barcode", "png"],
    icon: QrCode,
    Component: QrCodeTool,
  },
  {
    slug: "lorem",
    name: "Lorem Ipsum Generator",
    description: "Generate placeholder text in paragraphs, sentences, or words.",
    category: "Generators",
    keywords: ["lorem", "ipsum", "placeholder", "filler", "dummy"],
    icon: Type,
    Component: Lorem,
  },

  // ── Formatters ──────────────────────────────────────────────────────
  {
    slug: "json",
    name: "JSON Format & Validate",
    description: "Pretty-print, minify, and validate JSON. Errors point to the broken character.",
    category: "Formatters",
    keywords: ["json", "format", "pretty", "minify", "validate", "lint"],
    icon: FileJson,
    Component: Json,
  },
  {
    slug: "markdown",
    name: "Markdown Preview",
    description: "Render GitHub-flavored markdown live, side-by-side with the source. Toggle to view HTML.",
    category: "Formatters",
    keywords: ["markdown", "md", "preview", "html", "render", "gfm"],
    icon: AlignLeft,
    Component: Markdown,
  },

  // ── Converters ──────────────────────────────────────────────────────
  {
    slug: "yaml",
    name: "YAML ↔ JSON",
    description: "Convert between YAML and JSON in either direction.",
    category: "Converters",
    keywords: ["yaml", "json", "convert", "parse", "stringify"],
    icon: ArrowLeftRight,
    Component: Yaml,
  },
  {
    slug: "csv",
    name: "CSV ↔ JSON",
    description: "Convert between CSV and a JSON array of objects, with proper handling of quoted fields.",
    category: "Converters",
    keywords: ["csv", "json", "spreadsheet", "table", "convert"],
    icon: FileSpreadsheet,
    Component: Csv,
  },
  {
    slug: "timestamp",
    name: "Unix Timestamp Converter",
    description: "Convert between Unix timestamps and human-readable dates, in your local zone and UTC.",
    category: "Converters",
    keywords: ["timestamp", "unix", "epoch", "date", "iso", "time"],
    icon: Clock,
    Component: Timestamp,
  },
  {
    slug: "color",
    name: "Color Converter",
    description: "Convert colors between HEX, RGB(A) and HSL(A) with a live preview.",
    category: "Converters",
    keywords: ["color", "hex", "rgb", "hsl", "rgba", "hsla", "convert"],
    icon: Palette,
    Component: Color,
  },
  {
    slug: "number-base",
    name: "Number Base Converter",
    description: "Convert numbers between binary, octal, decimal, and hexadecimal — instantly, all four at once.",
    category: "Converters",
    keywords: ["number", "base", "binary", "octal", "decimal", "hex", "radix"],
    icon: Binary,
    Component: NumberBase,
  },
  {
    slug: "cron",
    name: "Cron Explainer",
    description: "Translate cron expressions into plain English, with handy presets you can click.",
    category: "Converters",
    keywords: ["cron", "schedule", "crontab", "expression"],
    icon: CalendarClock,
    Component: Cron,
  },

  // ── Text ────────────────────────────────────────────────────────────
  {
    slug: "regex",
    name: "Regex Tester",
    description: "Test JavaScript-flavored regular expressions with live highlighting and match details.",
    category: "Text",
    keywords: ["regex", "regexp", "pattern", "match", "test"],
    icon: Regex,
    Component: RegexTool,
  },
  {
    slug: "case",
    name: "Case Converter",
    description: "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and more.",
    category: "Text",
    keywords: ["case", "camel", "snake", "kebab", "pascal", "constant", "title"],
    icon: CaseSensitive,
    Component: CaseTool,
  },
  {
    slug: "slugify",
    name: "Slugify",
    description: "Convert any title or sentence into a clean URL-safe slug. Handles accents and punctuation.",
    category: "Text",
    keywords: ["slug", "slugify", "url", "permalink", "kebab"],
    icon: TextSelect,
    Component: Slugify,
  },
  {
    slug: "diff",
    name: "Diff Viewer",
    description: "Compare two blocks of text line-by-line. Added lines are green; removed lines are red.",
    category: "Text",
    keywords: ["diff", "compare", "text", "merge"],
    icon: GitCompare,
    Component: Diff,
  },
  {
    slug: "text-stats",
    name: "Text Statistics",
    description: "Count words, characters, lines, sentences, and estimate reading time as you type.",
    category: "Text",
    keywords: ["count", "words", "chars", "stats", "reading time", "wc"],
    icon: FileText,
    Component: TextStats,
  },
  {
    slug: "stringify",
    name: "Stringify / Parse",
    description:
      "Escape any text — even huge multi-line input — into a JSON or JS string literal, or parse one back to raw text.",
    category: "Text",
    keywords: [
      "stringify",
      "escape",
      "unescape",
      "json",
      "string",
      "literal",
      "quote",
      "newline",
      "parse",
    ],
    icon: Quote,
    Component: Stringify,
  },
  {
    slug: "cmd-teller",
    name: "Command Teller",
    description:
      "Describe what you want to do in plain English and get the matching shell or git command, with variants.",
    category: "Text",
    keywords: [
      "command",
      "cmd",
      "terminal",
      "shell",
      "bash",
      "git",
      "cheatsheet",
      "lookup",
      "reference",
      "natural language",
    ],
    icon: Terminal,
    Component: CmdTeller,
  },
];

export const categoryOrder: ToolCategory[] = [
  "Encode / Decode",
  "Crypto & Hashing",
  "Generators",
  "Formatters",
  "Converters",
  "Text",
];

export function getTool(slug: string): ToolDefinition | undefined {
  return tools.find((t) => t.slug === slug);
}
