import {
  Binary,
  Boxes,
  Braces,
  CaseSensitive,
  Clock,
  Code2,
  FileJson,
  Fingerprint,
  Hash,
  KeyRound,
  Link2,
  Palette,
  Regex,
  ShieldCheck,
  Type,
} from "lucide-react";

import type { ToolCategory, ToolDefinition } from "./types";

// Each tool file is a client component (its module has "use client").
// Metadata lives here on the server so we can serialize it across the RSC
// boundary; only the component references travel as client refs.
import Base32 from "./base32";
import Base64 from "./base64";
import CaseTool from "./case";
import Color from "./color";
import HashTool from "./hash";
import Hex from "./hex";
import Html from "./html";
import Json from "./json";
import Jwt from "./jwt";
import Lorem from "./lorem";
import Password from "./password";
import RegexTool from "./regex";
import Timestamp from "./timestamp";
import UrlTool from "./url";
import Uuid from "./uuid";

// ── Add a new tool ────────────────────────────────────────────────────────
// 1. Create src/lib/tools/<slug>/index.tsx that exports a default React
//    component with "use client" at the top.
// 2. Import it above and add an entry to the array below.
// ──────────────────────────────────────────────────────────────────────────
export const tools: ToolDefinition[] = [
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
    slug: "hash",
    name: "Hash Generator",
    description: "Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests of any text. Powered by Web Crypto.",
    category: "Crypto & Hashing",
    keywords: ["hash", "sha", "sha1", "sha256", "sha512", "digest", "checksum"],
    icon: Fingerprint,
    Component: HashTool,
  },
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
    slug: "json",
    name: "JSON Format & Validate",
    description: "Pretty-print, minify, and validate JSON. Errors point to the broken character.",
    category: "Formatters",
    keywords: ["json", "format", "pretty", "minify", "validate", "lint"],
    icon: FileJson,
    Component: Json,
  },
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
    slug: "case",
    name: "Case Converter",
    description: "Convert text between camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE and more.",
    category: "Text",
    keywords: ["case", "camel", "snake", "kebab", "pascal", "constant", "title"],
    icon: CaseSensitive,
    Component: CaseTool,
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
