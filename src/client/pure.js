/**
 * Pure logic for the subagent panel: catalog rows in, owned view models out.
 * Touches no React and no Cordis object, so the components never read live
 * runtime data directly and this file stays unit-testable in Node.
 */

/** @typedef {'running'|'idle'|'diagnostic'} CardStatus */

/**
 * Derive a card's status from one (structural) catalog entry.
 * @param {object} entry - `SubagentListEntry`-shaped row.
 * @returns {CardStatus} the status a card renders.
 */
export function statusOf(entry) {
  return entry.kind === 'diagnostic' ? 'diagnostic'
    : entry.activity === 'running' ? 'running'
      : 'idle';
}

/**
 * Turn one catalog entry into the card view model the UI renders.
 * @param {object} entry - `SubagentListEntry`-shaped row.
 * @returns {{id: string, label: string, status: CardStatus, mode: string, hasChildren: boolean, diagnostic: string}} the card.
 */
export function cardOf(entry) {
  const status = statusOf(entry);
  return {
    id: entry.id,
    label: typeof entry.label === 'string' && entry.label.trim().length > 0 ? entry.label : '',
    status,
    mode: typeof entry.mode === 'string' ? entry.mode : 'unknown',
    hasChildren: entry.hasChildren === true,
    diagnostic: status === 'diagnostic' ? String(entry.reason ?? 'unavailable') : '',
  };
}

/**
 * Cards for one parent's catalog, preserving host order (createdAt, then id).
 * @param {object|undefined} catalog - `SubagentCatalogSnapshot`-shaped value.
 * @returns {Array<object>} the cards, empty when the catalog is absent.
 */
export function cardsOf(catalog) {
  if (catalog === undefined || catalog === null) return [];
  const entries = catalog.entries;
  if (!Array.isArray(entries)) return [];
  return entries.map(cardOf);
}

/**
 * Build the durable address `sessions.openSubagent` needs from a card.
 *
 * The runtime validates this against the live catalog itself (the child must be
 * a healthy entry whose `mode` matches), so the mode carried here is the one
 * read off the catalog — never guessed.
 * @param {string} parentSessionId - the delegating session.
 * @param {object} card - the card view model.
 * @returns {{parentSessionId: string, childSessionId: string, mode: string}} the address.
 */
export function addressOf(parentSessionId, card) {
  return {
    parentSessionId,
    childSessionId: card.id,
    mode: card.mode === 'continuable' ? 'continuable' : 'one-shot',
  };
}

/**
 * Short id for a card subtitle.
 * @param {string} id - full session id.
 * @returns {string} its first 8 characters.
 */
export function shortId(id) {
  return id.length > 8 ? id.slice(0, 8) : id;
}

/**
 * Extract the child session id the inline card should target from the settled
 * tool result's rendered text (`started subagent <id>`), falling back to empty
 * while the call is still in flight.
 * @param {object|null} result - the settled `ToolResultNode`, if any.
 * @returns {string} the child session id, or '' when not yet known.
 */
export function childIdOfResult(result) {
  if (result === null || result === undefined) return '';
  const content = result.content;
  if (!Array.isArray(content)) return '';
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue;
    if (typeof block.text !== 'string') continue;
    const match = block.text.match(/started subagent (\S+)/);
    if (match !== null) return match[1];
  }
  return '';
}

/**
 * Read the delegated task description out of the frozen tool-call arguments.
 * @param {string} argsRaw - the tool call's raw JSON arguments.
 * @returns {string} the description, or '' when absent or unparsable.
 */
export function descriptionOfArgs(argsRaw) {
  if (typeof argsRaw !== 'string' || argsRaw.length === 0) return '';
  try {
    const parsed = JSON.parse(argsRaw);
    if (parsed === null || typeof parsed !== 'object') return '';
    return typeof parsed.description === 'string' ? parsed.description : '';
  } catch {
    return '';
  }
}

/**
 * Human duration from a millisecond span.
 * @param {number} ms - the span.
 * @returns {string} a compact duration, or '' when the span is unknown.
 */
export function durationOf(ms) {
  if (!Number.isFinite(ms) || ms < 0) return '';
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  if (total > 0) return `${total}s`;
  return `${Math.floor(ms)}ms`;
}
