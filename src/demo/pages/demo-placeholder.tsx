/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import type { DemoPageDefinition } from '../registry.ts'

import { PageHeader, Surface } from '../components/demo-shell.tsx'

export const DemoPlaceholderPage: FC<{ page: DemoPageDefinition }> = ({ page }) => {
  return (
    <>
      <PageHeader description={page.description} eyebrow="Planned" title={page.title} />
      <Surface
        description="该页面属于第二阶段之后的实验性回归项，本轮先提供状态说明，避免旧 `public/` 资产继续留在主线。"
        title="Not Restored Yet"
      >
        <p>
          当前仅保留新的 `/demo/experiments/*`
          入口占位，不再继续暴露旧静态目录。等后续处理浏览器音频能力时，再补客户端指纹与录音链路。
        </p>
      </Surface>
    </>
  )
}
