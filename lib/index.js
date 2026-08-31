/**
 * Host half of dsh-subagent-panel (Node side, dual-face installable package).
 *
 * Registers the `/subagents` command, which lists the calling session's direct
 * children from the durable catalog. The browser half reads subagent data from
 * the catalog `ctx.sessions` already projects, so this half deliberately owns
 * no custom RPC and parses no session logs — keeping one authority for
 * parent/child association (the `subagents` service).
 *
 * The plugin loads straight from source: no build step, no dependencies.
 */
import {inject, name, DEFAULT_MAX_MESSAGES} from './constants.js';
import {formatCatalog, parseLimit} from './format.js';

/** @type {string[]} Services this half requires before it activates. */
const injected = inject;

/**
 * Register the `/subagents` command on the composing context.
 * @param {object} ctx - Host cordis context carrying `commands` and `subagents`.
 * @param {object} config - plugin row configuration.
 */
function apply(ctx, config) {
  const commands = ctx.get('commands');
  if (commands === undefined) return;
  const maxMessages = parseLimit(
    config === null || config === undefined ? undefined : config.maxMessages,
    DEFAULT_MAX_MESSAGES,
  );

  ctx.effect(() => commands.register({
    name: 'subagents',
    description: 'List this session\'s subagents with their status and labels',
    handler: async (invocation) => {
      const subagents = ctx.get('subagents');
      if (subagents === undefined) {
        return {kind: 'error', text: 'the subagents service is unavailable'};
      }
      const parentSessionId = invocation.agent.session.sessionId;
      let entries;
      try {
        entries = await subagents.listChildren(parentSessionId, invocation.signal);
      } catch (error) {
        return {kind: 'error', text: `could not list subagents: ${messageOf(error)}`};
      }
      return {kind: 'success', text: formatCatalog(entries, maxMessages)};
    },
  }), 'dsh-subagent-panel command');
}

/**
 * Read a human message off an unknown thrown value.
 * @param {unknown} error - caught value.
 * @returns {string} its message, or a generic fallback.
 */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

export {apply, injected as inject, name, parseLimit};
