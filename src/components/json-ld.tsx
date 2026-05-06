/**
 * Server-rendered JSON-LD <script> tag. Pass any JSON-serialisable object
 * and it will be emitted with the correct content type.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Stringified once at render — Next streams this as plain text.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
