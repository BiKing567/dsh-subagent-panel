/**
 * Presentation helpers for the host half.
 *
 * Plain data in, plain string out: no Cordis objects, no services, so these are
 * unit-testable in Node and safe to call from a command handler.
 */

/**
 * Clamp a user-supplied row cap to a sane range.
 *
 * Accepts numbers and numeric strings (a cordis row can carry either); anything
 * else — including a negative or non-finite value — falls back to the default
 * rather than throwing, because a bad config value should not stop the plugin
 * from loading.
 * @param {unknown} raw - the configured value.
 * @param {number} fallback - the default cap.
 * @returns {number} a cap between 1 and 10000.
 */
export function parseLimit(raw, fallback) {
  const value = typeof raw === 'string' ? Number(raw) : raw;
  if (!Number.isFinite(value)) return fallback;
  const rounded = Math.floor(value);
  if (rounded < 1) return fallback;
  return Math.min(rounded, 10000);
}

/**
 * Format a direct-children catalog as the `/subagents` command's reply.
 *
 * Diagnostics are surfaced rather than dropped: a child that the host could not
 * read is still a child, and silently hiding it would make a real failure look
 * like "no subagents".
 * @param {Array<object>} entries - `SubagentListEntry` rows.
 * @param {number} maxRows - cap on rendered rows (newest last order preserved).
 * @returns {string} the reply text.
 */
export function formatCatalog(entries, maxRows) {
  if (entries.length === 0) return 'no subagents in this session';
  const rows = entries.slice(0, maxRows);
  const lines = rows.map((entry) => (entry.kind === 'diagnostic'
    ? `- unavailable (${String(entry.reason ?? 'unknown')})`
    : `- ${entry.label ?? 'untitled'} — ${entry.activity} [${entry.mode}]${entry.hasChildren ? ' (has nested)' : ''}`));
  if (entries.length > rows.length) {
    lines.push(`… ${entries.length - rows.length} more (raise maxMessages to see them)`);
  }
  return lines.join('\n');
}
