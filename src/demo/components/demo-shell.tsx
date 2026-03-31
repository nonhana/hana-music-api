import type { FC, PropsWithChildren } from 'hono/jsx'

import type { DemoPageDefinition, DemoPageStatus } from '../registry.ts'

export const StatusBadge: FC<{ status: DemoPageStatus }> = ({ status }) => {
  return (
    <span class={`status-badge status-${status}`}>{status === 'ready' ? 'Ready' : 'Planned'}</span>
  )
}

export const PageHeader: FC<{
  description: string
  eyebrow?: string
  title: string
}> = ({ description, eyebrow, title }) => {
  return (
    <header class="page-header">
      {eyebrow ? <p class="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p class="page-description">{description}</p>
    </header>
  )
}

export const Surface: FC<
  PropsWithChildren<{
    className?: string
    description?: string
    title?: string
  }>
> = ({ children, className, description, title }) => {
  return (
    <section class={className ? `surface ${className}` : 'surface'}>
      {title ? <h2>{title}</h2> : null}
      {description ? <p class="surface-description">{description}</p> : null}
      {children}
    </section>
  )
}

export const DemoCard: FC<{ page: DemoPageDefinition }> = ({ page }) => {
  const linkClass = page.status === 'planned' ? 'demo-card is-planned' : 'demo-card'

  return (
    <article class={linkClass}>
      {page.status === 'planned' ? (
        <div class="demo-card-meta">
          <StatusBadge status={page.status} />
        </div>
      ) : null}
      <h3>{page.title}</h3>
      <p>{page.summary}</p>
      <p class="demo-card-description">{page.description}</p>
      {page.status === 'ready' ? (
        <a class="text-link" href={page.path}>
          打开页面
        </a>
      ) : (
        <span class="muted">后续回归</span>
      )}
    </article>
  )
}
