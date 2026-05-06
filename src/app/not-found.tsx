import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Tool not found</h1>
      <p className="mt-2 text-[color:var(--color-muted)]">
        The thing you’re looking for doesn’t exist (yet).
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm text-[color:var(--color-accent)] hover:underline"
      >
        Back to all tools
      </Link>
    </div>
  );
}
