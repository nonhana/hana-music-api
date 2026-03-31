/** @jsxImportSource hono/jsx */

import type { FC } from 'hono/jsx'

import type { DemoGroupDefinition, DemoPageDefinition } from '../registry.ts'

import { DemoCard, PageHeader, Surface } from '../components/demo-shell.tsx'

interface DemoIndexPageProps {
  readonly groups: Array<{
    readonly group: DemoGroupDefinition
    readonly pages: DemoPageDefinition[]
  }>
}

export const DemoIndexPage: FC<DemoIndexPageProps> = ({ groups }) => {
  return (
    <>
      <PageHeader
        description="新的本地 Demo UI 直接跑在 Hono 服务里，用统一布局承接接口调试、登录调试、上传调试和实验页占位。"
        eyebrow="Phase 7"
        title="本地 Demo UI"
      />

      <div class="stats-grid">
        <Surface className="metric-card">
          <strong>Single process</strong>
          <span>继续保持 `bun dev` 单命令启动。</span>
        </Surface>
        <Surface className="metric-card">
          <strong>Unified routes</strong>
          <span>所有本地调试页收敛到 `/demo/*`。</span>
        </Surface>
        <Surface className="metric-card">
          <strong>Local cookie cache</strong>
          <span>登录 Cookie 仅存在浏览器 `localStorage`，不写入仓库。</span>
        </Surface>
      </div>

      {groups.map(({ group, pages }) => (
        <section class="group-section">
          <div class="group-heading">
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div class="card-grid">
            {pages.map((page) => (
              <DemoCard page={page} />
            ))}
          </div>
        </section>
      ))}
    </>
  )
}
