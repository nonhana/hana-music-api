import type { FC } from 'hono/jsx'

import type { DemoPageDefinition } from '../registry.ts'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const DemoPlaceholderPage: FC<{ page: DemoPageDefinition }> = ({ page }) => {
  return (
    <>
      <PageHeader description={page.description} eyebrow="即将开放" title={page.title} />
      <Surface description="该页面暂未开放。" title="稍后可用">
        <p>当前入口已预留，后续会补充完整功能。</p>
      </Surface>
    </>
  )
}
