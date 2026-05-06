/**
 * Regex tester worker.
 *
 * Runs the user's pattern in an isolated thread so the main UI stays
 * responsive even on a catastrophic-backtracking pattern. The host
 * terminates this worker if it takes longer than its timeout.
 */
const MAX_MATCHES = 10_000;

self.onmessage = (event) => {
  const { pattern, flags, text } = event.data ?? {};
  if (typeof pattern !== "string" || typeof flags !== "string" || typeof text !== "string") {
    self.postMessage({ ok: false, error: "Invalid input" });
    return;
  }
  try {
    const re = new RegExp(pattern, flags);
    const matches = [];
    let truncated = false;
    if (flags.includes("g")) {
      for (const m of text.matchAll(re)) {
        if (matches.length >= MAX_MATCHES) {
          truncated = true;
          break;
        }
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups: Array.from(m).slice(1),
        });
      }
    } else {
      const m = text.match(re);
      if (m) {
        matches.push({
          match: m[0],
          index: m.index ?? 0,
          groups: Array.from(m).slice(1),
        });
      }
    }
    self.postMessage({ ok: true, matches, truncated });
  } catch (err) {
    self.postMessage({
      ok: false,
      error: err && err.message ? err.message : "Invalid regex",
    });
  }
};
