export const demoStyles = `
:root {
  color-scheme: light;
  --page-background: #f6f8fb;
  --panel-background: rgba(255, 255, 255, 0.9);
  --panel-border: rgba(15, 23, 42, 0.08);
  --panel-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
  --text-strong: #0f172a;
  --text-body: #334155;
  --text-muted: #64748b;
  --brand: #2563eb;
  --brand-soft: rgba(37, 99, 235, 0.12);
  --success-soft: rgba(22, 163, 74, 0.14);
  --warning-soft: rgba(217, 119, 6, 0.16);
  --radius-large: 28px;
  --radius-medium: 18px;
  --radius-small: 12px;
  --page-width: 1180px;
  --content-width: 960px;
  --code-panel-max-height: min(52vh, 460px);
  --code-panel-max-height-tall: min(68vh, 720px);
  --font-sans: "IBM Plex Sans", "Noto Sans SC", "Microsoft YaHei", sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Consolas, monospace;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 32%),
    linear-gradient(180deg, #ffffff 0%, var(--page-background) 55%);
  color: var(--text-body);
  font-family: var(--font-sans);
  line-height: 1.6;
}

a {
  color: inherit;
  text-decoration: none;
}

button,
input,
select,
textarea {
  font: inherit;
}

code,
pre {
  font-family: var(--font-mono);
}

.site-shell {
  min-height: 100vh;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  backdrop-filter: blur(18px);
  background: rgba(246, 248, 251, 0.82);
}

.site-header-inner,
.page-frame,
.site-footer {
  width: min(calc(100% - 32px), var(--page-width));
  margin: 0 auto;
}

.site-header-inner {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  padding: 18px 0;
}

.site-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.nav-link {
  padding: 10px 14px;
  border-radius: 999px;
  color: var(--text-muted);
  transition:
    background-color 120ms ease,
    color 120ms ease,
    transform 120ms ease;
}

.nav-link:hover,
.nav-link.is-active {
  background: var(--brand-soft);
  color: var(--text-strong);
  transform: translateY(-1px);
}

.page-shell {
  padding: 42px 0 64px;
}

.page-frame {
  display: grid;
  gap: 28px;
}

.page-header {
  display: grid;
  gap: 8px;
  max-width: 760px;
}

.eyebrow {
  margin: 0;
  color: var(--brand);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.page-header h1,
.group-heading h2,
.surface h2,
.demo-card h3 {
  margin: 0;
  color: var(--text-strong);
  line-height: 1.14;
}

.page-header h1 {
  font-size: clamp(2rem, 3vw, 3.4rem);
}

.page-description,
.group-heading p,
.surface-description,
.demo-card p,
.inline-note,
.muted,
.site-footer p {
  margin: 0;
  color: var(--text-muted);
}

.stats-grid,
.card-grid,
.compact-grid,
.two-column-grid {
  display: grid;
  gap: 20px;
}

.stats-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card-grid {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.compact-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.two-column-grid {
  width: min(100%, var(--content-width));
  margin: 0 auto;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
}

.group-section {
  display: grid;
  gap: 18px;
}

.group-heading {
  display: grid;
  gap: 6px;
}

.surface,
.demo-card {
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-large);
  background: var(--panel-background);
  box-shadow: var(--panel-shadow);
}

.surface {
  display: grid;
  gap: 18px;
  padding: 24px;
}

.subtle-panel {
  border-radius: var(--radius-medium);
  box-shadow: none;
  padding: 16px;
  background: rgba(248, 250, 252, 0.95);
}

.metric-card {
  gap: 8px;
}

.metric-card strong {
  color: var(--text-strong);
  font-size: 1.05rem;
}

.demo-card {
  display: grid;
  gap: 12px;
  padding: 22px;
}

.demo-card.is-planned {
  border-style: dashed;
}

.demo-card-description {
  font-size: 0.92rem;
}

.demo-card-meta {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.status-ready {
  background: var(--success-soft);
  color: #166534;
}

.status-planned {
  background: var(--warning-soft);
  color: #92400e;
}

.text-link,
.secondary-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  border-radius: 999px;
  padding: 0 18px;
  font-weight: 600;
  background: var(--brand-soft);
}

.text-link {
  width: fit-content;
  color: var(--brand);
}

.primary-button,
.secondary-button {
  border: 1px solid transparent;
  cursor: pointer;
}

.primary-button {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
}

.secondary-button {
  background: transparent;
  border-color: rgba(37, 99, 235, 0.16);
  color: var(--text-strong);
}

.stack-form,
.result-stack,
.preview-stack,
.status-stack {
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field span,
.panel-heading {
  color: var(--text-strong);
  font-size: 0.92rem;
  font-weight: 600;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.25);
  border-radius: var(--radius-medium);
  background: rgba(255, 255, 255, 0.92);
  color: var(--text-strong);
  padding: 12px 14px;
  transition:
    border-color 120ms ease,
    box-shadow 120ms ease;
}

.field textarea {
  min-height: 124px;
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: rgba(37, 99, 235, 0.4);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

.action-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.code-block {
  display: grid;
  gap: 10px;
}

.code-block-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.code-block-spacer {
  flex: 1;
}

.code-copy-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.96);
  color: var(--text-body);
  cursor: pointer;
  transition:
    border-color 120ms ease,
    background-color 120ms ease,
    color 120ms ease,
    transform 120ms ease;
}

.code-copy-button:hover {
  border-color: rgba(37, 99, 235, 0.28);
  background: rgba(239, 246, 255, 0.98);
  color: var(--text-strong);
  transform: translateY(-1px);
}

.code-copy-button[data-copy-state="success"] {
  border-color: rgba(22, 163, 74, 0.24);
  background: rgba(240, 253, 244, 0.98);
  color: #166534;
}

.code-copy-button[data-copy-state="error"] {
  border-color: rgba(239, 68, 68, 0.24);
  background: rgba(254, 242, 242, 0.98);
  color: #b91c1c;
}

.code-copy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.result-panel {
  min-height: 160px;
  max-height: var(--code-panel-max-height);
  margin: 0;
  overflow: auto;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(148, 163, 184, 0.12);
  background: #0f172a;
  color: #dbeafe;
  padding: 18px 20px;
  white-space: pre;
  word-break: normal;
  line-height: 1.55;
  font-size: 0.88rem;
  scrollbar-gutter: stable;
}

.code-block.is-tall .result-panel {
  min-height: 240px;
  max-height: var(--code-panel-max-height-tall);
}

.toggle {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  color: var(--text-body);
}

.qr-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
  align-items: center;
}

.qr-card,
.cover-preview-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  border: 1px dashed rgba(148, 163, 184, 0.4);
  border-radius: var(--radius-large);
  background: rgba(248, 250, 252, 0.9);
}

.qr-card img,
.cover-preview-shell img {
  max-width: 100%;
  max-height: 100%;
  border-radius: 20px;
}

.cover-preview-shell img {
  min-height: 220px;
  object-fit: cover;
}

.site-footer {
  padding-bottom: 32px;
}

#audio-match-waveform {
  width: 100%;
  height: 160px;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(148, 163, 184, 0.2);
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0.02)),
    #f8fafc;
}

.audio-match-meta {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.match-results {
  min-height: 96px;
  padding: 16px;
  border-radius: var(--radius-medium);
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(248, 250, 252, 0.92);
  color: var(--text-body);
}

.match-result-list {
  margin: 0;
  padding-left: 20px;
}

.match-result-list a {
  color: var(--brand);
}

@media (max-width: 980px) {
  .stats-grid,
  .two-column-grid {
    grid-template-columns: 1fr;
  }

  .compact-grid {
    grid-template-columns: 1fr;
  }

  .audio-match-meta {
    grid-template-columns: 1fr;
  }

  .qr-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .site-header-inner {
    align-items: flex-start;
    flex-direction: column;
  }

  .site-nav {
    justify-content: flex-start;
  }

  .page-shell {
    padding-top: 28px;
  }
}
`
