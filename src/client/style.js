/**
 * Panel styles, injected as one `<style>` element for the fiber's lifetime.
 *
 * Colors ride the shell's theme custom properties where they exist and fall
 * back to neutral values, so the panel stays legible under any theme instead of
 * hard-coding a palette.
 */

/** @type {string} the stylesheet text. */
export const STYLE = `
.sap-badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;line-height:1;
  padding:3px 6px;border-radius:999px;border:1px solid var(--dsh-border,rgba(128,128,128,.35));
  color:var(--dsh-fg-muted,#8b8b8b);white-space:nowrap}
.sap-dot{width:6px;height:6px;border-radius:50%;background:currentColor;flex:none}
.sap-badge-running .sap-dot{background:#22a06b;animation:sap-pulse 1.2s ease-in-out infinite}
.sap-badge-diagnostic{color:#c0533f}
@keyframes sap-pulse{0%,100%{opacity:1}50%{opacity:.35}}

.sap-card{display:flex;flex-direction:column;gap:6px;width:100%;text-align:left;
  padding:10px 12px;border-radius:10px;cursor:pointer;
  border:1px solid var(--dsh-border,rgba(128,128,128,.28));
  background:var(--dsh-bg-subtle,rgba(128,128,128,.06));
  color:inherit;font:inherit;transition:background .15s ease,border-color .15s ease}
.sap-card:hover:not(:disabled){background:var(--dsh-bg-hover,rgba(128,128,128,.13));
  border-color:var(--dsh-border-strong,rgba(128,128,128,.5))}
.sap-card:disabled{cursor:default;opacity:.75}
.sap-card:focus-visible{outline:2px solid var(--dsh-accent,#4c8bf5);outline-offset:2px}
.sap-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
.sap-card-title{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap}
.sap-card-meta{display:flex;align-items:center;gap:10px;font-size:11px;
  color:var(--dsh-fg-muted,#8b8b8b)}
.sap-card-id{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}

.sap-trigger{position:fixed;right:18px;bottom:18px;z-index:55;display:inline-flex;
  align-items:center;gap:8px;padding:8px 12px;border-radius:999px;cursor:pointer;
  font:inherit;font-size:12px;
  border:1px solid var(--dsh-border,rgba(128,128,128,.3));
  background:var(--dsh-bg,#fff);color:inherit;
  box-shadow:0 4px 14px rgba(0,0,0,.14)}
.sap-trigger:hover{background:var(--dsh-bg-hover,rgba(128,128,128,.1))}
.sap-trigger-open{border-color:var(--dsh-accent,#4c8bf5)}
.sap-count{font-variant-numeric:tabular-nums;color:var(--dsh-fg-muted,#8b8b8b)}
.sap-dot-inline{background:#22a06b}
.sap-list{position:fixed;right:18px;bottom:62px;z-index:56;display:flex;
  flex-direction:column;gap:8px;width:320px;max-height:52vh;overflow-y:auto;
  padding:10px;border-radius:12px;
  border:1px solid var(--dsh-border,rgba(128,128,128,.28));
  background:var(--dsh-bg,#fff);color:inherit;
  box-shadow:0 10px 30px rgba(0,0,0,.18)}
.sap-hint{margin:0;font-size:12px;color:var(--dsh-fg-muted,#8b8b8b);padding:4px 2px}
`;
