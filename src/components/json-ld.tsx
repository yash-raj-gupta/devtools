/**
 * Server-rendered JSON-LD <script> tag.
 *
 * `JSON.stringify` does not escape `<`, `>`, or `&`, so a string ending in
 * `</script>` would break out of the surrounding tag. We also escape the
 * line/paragraph separators that JSON leaves raw — they're invalid inside
 * JS string literals and would crash any client that JSON.parse'd the
 * textContent.
 *
 * Accepts a CSP nonce so the script tag survives the strict
 * `script-src 'self' 'nonce-…'` policy set by the middleware.
 */
const LINE_SEP_RE = new RegExp("[\\u2028\\u2029]", "g");

function safeStringify(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(LINE_SEP_RE, (c) =>
      c.charCodeAt(0) === 0x2028 ? "\\u2028" : "\\u2029",
    );
}

export function JsonLd({ data, nonce }: { data: unknown; nonce?: string }) {
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: safeStringify(data) }}
    />
  );
}
