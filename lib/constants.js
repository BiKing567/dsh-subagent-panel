/**
 * Shared constants for dsh-subagent-panel.
 *
 * The row id must equal the package name: the client module loader resolves
 * `<row-name>/package.json` to find the bundle, so the two names are one
 * identity rather than two that happen to match.
 */

/** Package name — equals the cordis row id and the package.json name. */
export const name = 'dsh-subagent-panel';

/** Host services this half reads. */
export const inject = ['commands', 'subagents'];

/** Default cap on rows rendered by the `/subagents` command. */
export const DEFAULT_MAX_MESSAGES = 500;
