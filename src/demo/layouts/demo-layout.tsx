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
  const title = page ? `${page.title} | HANA Demo` : 'HANA Demo'

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta
          content="hana-music-api 功能演示页面，包含接口请求、搜索、扫码登录、封面上传与听歌识曲。"
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
                <h3>hana-music-api 调试</h3>
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
        </div>
      </body>
    </html>
  )
}
