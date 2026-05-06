import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
      <h1
        className="serif text-3xl font-semibold tracking-tight skeuo-emboss"
        style={{ color: "var(--fg)" }}
      >
        Tool not found
      </h1>
      <p className="mt-2" style={{ color: "var(--muted)" }}>
        The thing you’re looking for doesn’t exist (yet).
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex skeuo-btn skeuo-btn-accent"
      >
        Back to all tools
      </Link>
    </div>
  );
}
