/** @jsxImportSource hono/jsx */

import type { FC, PropsWithChildren } from 'hono/jsx'

import type { DemoPageDefinition } from '../registry.ts'

import { getReadyDemoPages } from '../registry.ts'

interface DemoLayoutProps extends PropsWithChildren {
  readonly currentPath: string
  readonly page?: DemoPageDefinition
}

export const DemoLayout: FC<DemoLayoutProps> = ({ children, currentPath, page }) => {
  const navigationPages = getReadyDemoPages()
  const title = page ? `${page.title} | hana-music-api Demo` : 'hana-music-api Demo'

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta
          content="本地专用的 hana-music-api Demo UI，基于 Hono + Bun + TypeScript。"
          name="description"
        />
        <title>{title}</title>
        <link href="/demo/styles.css" rel="stylesheet" />
      </head>
      <body>
        <div class="site-shell">
          <header class="site-header">
            <div class="site-header-inner">
              <a class="brand" href="/demo">
                <span class="brand-mark">hana</span>
                <span class="brand-copy">
                  <strong>Demo UI</strong>
                  <small>Local development only</small>
                </span>
              </a>
              <nav aria-label="Demo navigation" class="site-nav">
                <a class={currentPath === '/demo' ? 'nav-link is-active' : 'nav-link'} href="/demo">
                  首页
                </a>
                {navigationPages.map((item) => (
                  <a
                    class={currentPath === item.path ? 'nav-link is-active' : 'nav-link'}
                    href={item.path}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </header>

          <main class="page-shell">
            <div class="page-frame">{children}</div>
          </main>

          <footer class="site-footer">
            <p>
              `bun dev` 会同时暴露 API 路由与 `/demo/*` 调试页。旧 `public/` 静态页面已退出主线。
            </p>
          </footer>
        </div>
      </body>
    </html>
  )
}
