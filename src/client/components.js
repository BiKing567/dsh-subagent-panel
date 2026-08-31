/**
 * React components for the subagent panel.
 *
 * Plain JavaScript (no JSX — no build step in this environment), so every
 * element is a `React.createElement` call. These render ONLY the entry points;
 * the subagent's own session is rendered by the shell's conversation view after
 * `sessions.openSubagent(address)` navigates to it. Deliberately no transcript
 * renderer of our own — duplicating the shell's session view is what made the
 * first version show "too much else".
 */
import React from 'react';
import {durationOf, shortId} from './pure.js';

/** @typedef {import('./locales.js').Translate} Translate */

/**
 * A small status pill; the dot pulses only while the child is running.
 * @param {{status: string, t: Translate}} props - status and translator.
 * @returns {object} the element.
 */
function StatusBadge(props) {
  const {status, t} = props;
  const label = status === 'running' ? t('card.running')
    : status === 'diagnostic' ? t('card.diagnostic')
      : t('card.inactive');
  return React.createElement('span', {className: `sap-badge sap-badge-${status}`},
    React.createElement('span', {className: 'sap-dot'}),
    label,
  );
}

/**
 * The inline subagent card: the entry point that replaces the generic
 * `subagent` / `subagent_fork` tool row.
 *
 * Shows the delegated task, the live status, the short child id, elapsed time,
 * and whether the child spawned nested subagents. Activating it navigates the
 * stage to the child session through the same path the session header's
 * subagent catalog uses, so the child opens as an ordinary session.
 * @param {object} props - card props.
 * @param {object} props.card - the card view model from `cardsOf`.
 * @param {string} props.fallbackLabel - description read from the call arguments.
 * @param {boolean} props.running - whether the child is still running.
 * @param {number} props.elapsedMs - span since the call started; -1 when unknown.
 * @param {boolean} props.disabled - whether this row can open the session yet.
 * @param {Translate} props.t - translator.
 * @param {() => void} props.onOpen - navigate to the child session.
 * @returns {object} the element.
 */
export function SubagentCard(props) {
  const {card, fallbackLabel, running, elapsedMs, disabled, t, onOpen} = props;
  const label = card.label.length > 0 ? card.label : fallbackLabel;
  const elapsed = durationOf(elapsedMs);
  return React.createElement('button', {
    type: 'button',
    className: 'sap-card',
    onClick: onOpen,
    disabled: disabled === true,
    title: t('card.open'),
  },
  React.createElement('div', {className: 'sap-card-head'},
    React.createElement('span', {className: 'sap-card-title'},
      label.length > 0 ? label : t('card.noLabel'),
    ),
    React.createElement(StatusBadge, {status: running ? 'running' : card.status, t}),
  ),
  React.createElement('div', {className: 'sap-card-meta'},
    card.id.length > 0
      ? React.createElement('span', {className: 'sap-card-id'}, shortId(card.id))
      : null,
    elapsed.length > 0 ? React.createElement('span', {className: 'sap-card-time'}, elapsed) : null,
    card.hasChildren ? React.createElement('span', {className: 'sap-card-nested'}, t('card.children')) : null,
  ),
  );
}

/**
 * The sidebar trigger: a compact count of this session's subagents that toggles
 * the floating list.
 * @param {object} props - trigger props.
 * @param {number} props.count - how many subagents this session has.
 * @param {boolean} props.hasRunning - whether any of them is still running.
 * @param {boolean} props.open - whether the list is showing.
 * @param {Translate} props.t - translator.
 * @param {() => void} props.onToggle - toggle the floating list.
 * @returns {object} the element.
 */
export function SubagentTrigger(props) {
  const {count, hasRunning, open, t, onToggle} = props;
  return React.createElement('button', {
    type: 'button',
    className: `sap-trigger${open ? ' sap-trigger-open' : ''}`,
    onClick: onToggle,
    'aria-expanded': open ? 'true' : 'false',
    title: t('trigger.label'),
  },
  React.createElement('span', null, t('trigger.label')),
  React.createElement('span', {className: 'sap-count'}, String(count)),
  hasRunning ? React.createElement('span', {className: 'sap-dot sap-dot-inline'}) : null,
  );
}

/**
 * The floating list opened by the sidebar trigger: every subagent of the
 * current session as a clickable card.
 * @param {object} props - list props.
 * @param {Array<object>} props.cards - this session's cards.
 * @param {Translate} props.t - translator.
 * @param {(card: object) => void} props.onOpen - navigate to one child session.
 * @returns {object} the element.
 */
export function SubagentList(props) {
  const {cards, t, onOpen} = props;
  if (cards.length === 0) {
    return React.createElement('div', {className: 'sap-list'},
      React.createElement('p', {className: 'sap-hint'}, t('trigger.empty')),
    );
  }
  return React.createElement('div', {className: 'sap-list'},
    cards.map((card) => React.createElement(SubagentCard, {
      key: card.id,
      card,
      fallbackLabel: '',
      running: card.status === 'running',
      elapsedMs: -1,
      disabled: card.status === 'diagnostic',
      t,
      onOpen: () => onOpen(card),
    })),
  );
}

export {durationOf, shortId};
