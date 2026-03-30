import type { Context } from 'hono'

import type { ModuleQuery } from '../types/index.ts'
import type { LegacyUploadedFile } from '../types/modules.ts'

import { isRecord } from '../core/utils.ts'

const BODYLESS_METHODS = new Set(['GET', 'HEAD'])

/**
 * 把 Hono 的请求体解析结果收敛成普通 JS 对象，
 * 这样模块层只面对旧项目兼容的 query 结构，不直接依赖框架细节。
 */
export async function parseRequestBody(context: Context): Promise<ModuleQuery> {
  if (BODYLESS_METHODS.has(context.req.method.toUpperCase())) {
    return {}
  }

  const contentType = context.req.header('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      const payload = await context.req.json()
      return isRecord(payload) ? payload : {}
    }

    if (
      contentType.includes('application/x-www-form-urlencoded') ||
      contentType.includes('multipart/form-data')
    ) {
      const parsed = await context.req.parseBody({
        all: true,
      })

      return await normalizeParsedBody(parsed)
    }
  } catch {
    return {} // 静默失败，避免中断模块调用
  }

  return {}
}

async function normalizeParsedBody(
  body: Record<string, string | File | (string | File)[]>,
): Promise<ModuleQuery> {
  const normalized: ModuleQuery = {}

  for (const [key, value] of Object.entries(body)) {
    normalized[key] = await normalizeBodyValue(value)
  }

  return normalized
}

async function normalizeBodyValue(value: string | File | (string | File)[]): Promise<unknown> {
  if (Array.isArray(value)) {
    return Promise.all(value.map((entry) => normalizeBodyValue(entry)))
  }

  if (value instanceof File) {
    return toLegacyUploadedFile(value)
  }

  return value
}

async function toLegacyUploadedFile(file: File): Promise<LegacyUploadedFile> {
  const data = Buffer.from(await file.arrayBuffer())

  return {
    data,
    mimetype: file.type || 'application/octet-stream',
    name: file.name,
    size: file.size,
  }
}
