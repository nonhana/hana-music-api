import type { FC, PropsWithChildren } from 'hono/jsx'

const CopyIcon: FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="lucide lucide-clipboard-icon lucide-clipboard"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    </svg>
  )
}

export const CodeBlock: FC<
  PropsWithChildren<{
    className?: string
    heading?: string
    id: string
    tall?: boolean
  }>
> = ({ children, className, heading, id, tall }) => {
  const blockClassName = ['code-block', tall ? 'is-tall' : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <section class={blockClassName}>
      <div class="code-block-toolbar">
        {heading ? (
          <h3 class="panel-heading">{heading}</h3>
        ) : (
          <span class="code-block-spacer"></span>
        )}
        <button
          class="code-copy-button"
          data-copy-button
          data-copy-default-label="复制"
          data-copy-target={id}
          type="button"
        >
          <span class="code-copy-icon">
            <CopyIcon />
          </span>
          <span data-copy-label>复制</span>
        </button>
      </div>
      <pre class="result-panel" id={id}>
        {children}
      </pre>
    </section>
  )
}
