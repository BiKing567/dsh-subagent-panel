/**
 * Dictionaries for the `subagent-panel` namespace. Keys stay flat and stable.
 * Both shipped locales are required at registration (bilingual balance).
 *
 * Only the entry points need copy now — the child session's own view is
 * rendered by the shell, which owns its own dictionaries.
 */

/** Locale namespace id. */
export const NS = 'subagent-panel';

/** @typedef {(key: string) => string} Translate */

/** English dictionary. */
export const en = {
  'card.running': 'Running',
  'card.inactive': 'Idle',
  'card.diagnostic': 'Unavailable',
  'card.open': 'Open this subagent session',
  'card.noLabel': 'untitled subagent',
  'card.children': 'has nested subagents',
  'trigger.label': 'Subagents',
  'trigger.empty': 'No subagents in this session yet',
};

/** Chinese dictionary. */
export const zh = {
  'card.running': '运行中',
  'card.inactive': '空闲',
  'card.diagnostic': '不可用',
  'card.open': '打开这个子代理会话',
  'card.noLabel': '未命名子代理',
  'card.children': '含嵌套子代理',
  'trigger.label': '子代理',
  'trigger.empty': '当前会话还没有子代理',
};
