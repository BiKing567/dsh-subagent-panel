/**
 * Browser half of dsh-subagent-panel.
 *
 * Two surfaces, both driven by the catalog `ctx.sessions` already projects:
 *  - an inline card in place of the generic `subagent` / `subagent_fork` tool
 *    row (`tool.call.toolview`, keyed by wire tool name — unclaimed, so
 *    registering owns the card);
 *  - a sidebar trigger listing every subagent of the current session.
 *
 * Activating either one calls `sessions.openSubagent(address)` — the exact
 * navigation the session header's subagent catalog uses — so the child opens as
 * an ordinary session rendered by the shell's own conversation view. This
 * plugin renders no transcript of its own: the shell already renders a session
 * better than a plugin can, and duplicating it is what made the first version
 * show "too much else".
 */
import React from 'react';
import {SubagentCard, SubagentList, SubagentTrigger} from './components.js';
import {addressOf, cardsOf, childIdOfResult, descriptionOfArgs} from './pure.js';
import {NS, en, zh} from './locales.js';
import {STYLE} from './style.js';

/** Package name — must equal the cordis row id and the package.json name. */
export const name = 'dsh-subagent-panel';

/** Client services this half injects. */
export const inject = ['slots', 'sessions', 'locale'];

/** Keyed inline card slot, dispatched by wire tool name. */
const TOOLVIEW_SLOT = 'tool.call.toolview';
/** Additive frame-wide floating layer: the trigger lives here. */
const OVERLAY_SLOT = 'shell.overlay';

/** Wire tool names whose generic row this plugin replaces with a card. */
const TOOL_KEYS = ['subagent', 'subagent_fork'];

/**
 * Plugin body: register the locale, styles, the inline card, and the trigger.
 * @param {object} ctx - client cordis context.
 */
export function apply(ctx) {
  ctx.effect(function* () {
    yield ctx.locale.register(NS, {zh, en});
    const t = ctx.locale.bind(NS);

    const style = document.createElement('style');
    style.dataset.plugin = name;
    style.textContent = STYLE;
    document.head.appendChild(style);

    const slots = ctx.slots;
    /**
     * Navigate the stage to one child session.
     * @param {string} parentSessionId - the delegating session.
     * @param {object} card - the card to open.
     */
    const openChild = (parentSessionId, card) => {
      ctx.sessions.openSubagent(addressOf(parentSessionId, card));
    };

    yield slots.inject(TOOLVIEW_SLOT, () => {
      const disposers = TOOL_KEYS.map((key) => slots.register(
        {name: TOOLVIEW_SLOT, key, registrant: name},
        createCardView({ctx, t, openChild}),
      ));
      return disposers;
    });

    yield slots.inject(OVERLAY_SLOT, () => slots.register(
      {name: OVERLAY_SLOT, id: name, order: 1000},
      createTrigger({ctx, t, openChild}),
    ));

    yield () => {
      style.remove();
    };
  }, 'dsh-subagent-panel client lifecycle');
}

/**
 * Build the sidebar trigger component: a live count plus the floating list.
 * @param {object} options - context, translator, and the open action.
 * @returns {Function} the slot component.
 */
function createTrigger(options) {
  const {ctx, t, openChild} = options;
  return function SubagentTriggerHost() {
    const [listOpen, setListOpen] = React.useState(false);
    const sessionId = ctx.sessions.list.getSnapshot().current;
    if (sessionId === undefined) return null;
    const cards = cardsOf(ctx.sessions.list.getSnapshot().subagentsByParent[sessionId]);
    const hasRunning = cards.some((card) => card.status === 'running');
    return React.createElement(React.Fragment, null,
      React.createElement(SubagentTrigger, {
        count: cards.length,
        hasRunning,
        open: listOpen,
        t,
        onToggle: () => setListOpen((previous) => !previous),
      }),
      listOpen
        ? React.createElement(SubagentList, {
          cards,
          t,
          onOpen: (card) => {
            setListOpen(false);
            openChild(sessionId, card);
          },
        })
        : null,
    );
  };
}

/**
 * Elapsed span for a still-running call, whose only timestamp is the call's own
 * epoch-ms `time`. Returns -1 rather than a nonsense value when that timestamp
 * is missing or not a plausible past epoch (some fixtures carry a
 * `performance.now()`-style value), so the card simply omits the duration
 * instead of showing a five-digit minute count.
 * @param {unknown} time - the call's logged time.
 * @returns {number} elapsed ms, or -1 when unknown.
 */
function elapsedFromCall(time) {
  if (typeof time !== 'number' || !Number.isFinite(time) || time <= 0) return -1;
  const elapsed = Date.now() - time;
  return elapsed >= 0 && elapsed < 86400000 ? elapsed : -1;
}

/**
 * Build the keyed card component for one wire tool name.
 *
 * The card's identity is resolved in two steps: once the call settles its
 * rendered text carries the child id (`started subagent <id>`); while it is
 * still in flight the card shows the task description from the call arguments
 * and stays inert, because there is no catalog entry to navigate to yet.
 * @param {object} options - context, translator, and the open action.
 * @returns {Function} the slot component.
 */
function createCardView(options) {
  const {ctx, t, openChild} = options;
  return function SubagentCardView(props) {
    const {block, sessionId} = props;
    const running = block.kind !== 'tool-result';
    // The two block shapes carry the arguments in different places: a settled
    // `ToolResultNode` nests them under `call`, a `RunningToolCall` exposes them
    // at the top level.
    const call = block.call ?? null;
    const argsRaw = call !== null
      ? (call.argsRaw ?? '')
      : (typeof block.argsRaw === 'string' ? block.argsRaw : '');
    const fallbackLabel = descriptionOfArgs(argsRaw);
    const explicitId = running ? '' : childIdOfResult(block);
    const cards = cardsOf(ctx.sessions.list.getSnapshot().subagentsByParent[sessionId]);
    const card = explicitId.length > 0
      ? (cards.find((entry) => entry.id === explicitId) ?? null)
      : null;

    // Still in flight (or the child has not registered yet): show the task and
    // stay inert rather than guessing which catalog entry this call started.
    if (card === null) {
      return React.createElement(SubagentCard, {
        card: {id: '', label: '', status: 'idle', mode: 'unknown', hasChildren: false, diagnostic: ''},
        fallbackLabel,
        running,
        elapsedMs: elapsedFromCall(block.time),
        disabled: true,
        t,
        onOpen: () => {},
      });
    }

    const elapsedMs = block.callTime === null || block.callTime === undefined || block.callTime < 0
      ? -1
      : (block.time - block.callTime);
    return React.createElement(SubagentCard, {
      card,
      fallbackLabel,
      running: running || card.status === 'running',
      elapsedMs,
      disabled: card.status === 'diagnostic',
      t,
      onOpen: () => openChild(sessionId, card),
    });
  };
}
