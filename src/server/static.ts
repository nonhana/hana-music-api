import type { Context, Hono } from 'hono'

import { stat } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_PUBLIC_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../../public')

export function getDefaultPublicDirectory(): string {
  return DEFAULT_PUBLIC_DIRECTORY
}

/**
 * 注册静态资源路由。这里保留旧项目的 `public/` 目录能力，
 * 但不会覆盖已经存在的 API 路由。
 */
export function registerStaticRoutes(app: Hono, publicDirectory = DEFAULT_PUBLIC_DIRECTORY): void {
  app.get('*', async (context) => {
    const filePath = await resolveStaticFilePath(context, publicDirectory)
    if (!filePath) {
      return context.notFound()
    }

    return new Response(Bun.file(filePath))
  })
}

async function resolveStaticFilePath(
  context: Context,
  publicDirectory: string,
): Promise<string | null> {
  const url = new URL(context.req.url)
  const requestPath = safeDecodeURIComponent(url.pathname)
  const normalized = requestPath === '/' ? '/index.html' : requestPath
  const absolutePath = resolve(publicDirectory, `.${normalized}`)

  if (!isInsideDirectory(absolutePath, publicDirectory)) {
    return null
  }

  const filePath = await resolveExistingFile(absolutePath)
  if (filePath) {
    return filePath
  }

  const directoryIndexPath = normalized.endsWith('/')
    ? resolve(absolutePath, 'index.html')
    : resolve(publicDirectory, `.${normalized}`, 'index.html')

  return resolveExistingFile(directoryIndexPath)
}

async function resolveExistingFile(filePath: string): Promise<string | null> {
  try {
    const fileStat = await stat(filePath)
    if (fileStat.isFile()) {
      return filePath
    }
  } catch {
    return null
  }

  return null
}

function isInsideDirectory(targetPath: string, directory: string): boolean {
  const normalizedDirectory = resolve(directory)
  const normalizedTarget = resolve(targetPath)

  return (
    normalizedTarget === normalizedDirectory ||
    normalizedTarget.startsWith(`${normalizedDirectory}\\`) ||
    normalizedTarget.startsWith(`${normalizedDirectory}/`)
  )
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
