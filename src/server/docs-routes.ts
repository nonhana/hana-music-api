import type { Hono } from 'hono'

import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_DOCS_DIST_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../docs/.vitepress/dist',
)

const TEXT_HTML = 'text/html; charset=utf-8'

export interface RegisterDocsRoutesOptions {
  readonly docsDistDirectory?: string
  readonly serviceName: string
}

export function registerDocsRoutes(app: Hono, options: RegisterDocsRoutesOptions): void {
  app.get('/docs', async () => {
    return createDocsResponse(options, '')
  })

  app.get('/docs/*', async (context) => {
    const requestedPath = context.req.path.replace(/^\/docs\/?/, '')

    return createDocsResponse(options, requestedPath)
  })
}

async function createDocsResponse(
  options: RegisterDocsRoutesOptions,
  requestedPath: string,
): Promise<Response> {
  const docsDistDirectory = resolve(options.docsDistDirectory ?? DEFAULT_DOCS_DIST_DIRECTORY)
  const indexFile = Bun.file(resolve(docsDistDirectory, 'index.html'))

  if (!(await indexFile.exists())) {
    return new Response(createDocsBuildRequiredPage(options.serviceName), {
      headers: {
        'Content-Type': TEXT_HTML,
      },
      status: 503,
    })
  }

  const relativePath = normalizeRequestedPath(requestedPath)
  const candidates = buildDocsCandidates(relativePath)

  for (const candidate of candidates) {
    const safePath = resolveDocsFilePath(docsDistDirectory, candidate)

    if (!safePath) {
      continue
    }

    const file = Bun.file(safePath)

    if (await file.exists()) {
      return new Response(file, {
        headers: createFileHeaders(file),
        status: 200,
      })
    }
  }

  const notFoundFile = Bun.file(resolve(docsDistDirectory, '404.html'))

  if (await notFoundFile.exists()) {
    return new Response(notFoundFile, {
      headers: createFileHeaders(notFoundFile, TEXT_HTML),
      status: 404,
    })
  }

  return new Response('Not Found', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
    status: 404,
  })
}

function normalizeRequestedPath(requestedPath: string): string {
  return requestedPath
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .join('/')
}

function buildDocsCandidates(relativePath: string): string[] {
  if (!relativePath) {
    return ['index.html']
  }

  if (hasExtension(relativePath)) {
    return [relativePath]
  }

  return [`${relativePath}.html`, `${relativePath}/index.html`]
}

function hasExtension(pathname: string): boolean {
  return extname(pathname) !== ''
}

function resolveDocsFilePath(docsDistDirectory: string, candidate: string): string | null {
  const resolvedPath = resolve(docsDistDirectory, candidate)
  const relativeCandidate = relative(docsDistDirectory, resolvedPath)

  if (relativeCandidate.startsWith('..') || relativeCandidate.includes('/../')) {
    return null
  }

  return resolvedPath
}

function createFileHeaders(
  file: Blob & { readonly type: string },
  fallbackType?: string,
): ResponseInit['headers'] {
  return {
    'Content-Type': file.type || fallbackType || 'application/octet-stream',
  }
}

function createDocsBuildRequiredPage(serviceName: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta content="width=device-width, initial-scale=1" name="viewport" />
    <title>${serviceName} 文档未构建</title>
    <style>
      :root {
        color-scheme: light;
        --page-background: #f6f8fb;
        --panel-background: rgba(255, 255, 255, 0.92);
        --panel-border: rgba(15, 23, 42, 0.08);
        --panel-shadow: 0 20px 50px rgba(15, 23, 42, 0.08);
        --text-strong: #0f172a;
        --text-body: #334155;
        --brand: #2563eb;
        --brand-soft: rgba(37, 99, 235, 0.12);
        font-family: "IBM Plex Sans", "Noto Sans SC", "Microsoft YaHei", sans-serif;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background:
          radial-gradient(circle at top left, rgba(37, 99, 235, 0.1), transparent 32%),
          linear-gradient(180deg, #ffffff 0%, var(--page-background) 55%);
        color: var(--text-body);
      }

      main {
        width: min(560px, calc(100vw - 48px));
        padding: 32px;
        border-radius: 24px;
        background: var(--panel-background);
        box-shadow: var(--panel-shadow);
        border: 1px solid var(--panel-border);
      }

      h1 {
        margin: 0 0 16px;
        font-size: 28px;
        color: var(--text-strong);
      }

      p {
        margin: 0 0 14px;
        line-height: 1.7;
        color: var(--text-body);
      }

      code {
        padding: 2px 8px;
        border-radius: 999px;
        background: var(--brand-soft);
        font-size: 14px;
      }

      a {
        color: var(--brand);
        font-weight: 600;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>文档静态资源尚未生成</h1>
      <p>文档页暂时不可用，请先生成静态文档。</p>
      <p>在项目根目录执行 <code>bun run docs:build</code> 后刷新即可。</p>
      <p>服务状态检查请访问 <a href="/health">/health</a>。</p>
    </main>
  </body>
</html>`
}
