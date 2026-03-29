import type { CookieRecord } from '../types/index.ts'

/**
 * 旧项目会把请求头中的 Cookie 解析到普通对象里，
 * 这里继续保持这个行为，避免后续模块层额外依赖 Hono 的 Cookie API。
 */
export function parseRequestCookies(cookieHeader: string | undefined): CookieRecord {
  if (!cookieHeader) {
    return {}
  }

  const cookies: CookieRecord = {}

  for (const pair of cookieHeader.split(/;\s+|(?<!\s)\s+$/g)) {
    const separatorIndex = pair.indexOf('=')
    if (separatorIndex < 1 || separatorIndex >= pair.length - 1) {
      continue
    }

    const rawKey = pair.slice(0, separatorIndex)
    const rawValue = pair.slice(separatorIndex + 1)
    cookies[safeDecodeURIComponent(rawKey).trim()] = safeDecodeURIComponent(rawValue).trim()
  }

  return cookies
}

export function appendResponseCookies(
  target: Headers,
  cookies: string[],
  isHttpsRequest: boolean,
): void {
  for (const cookie of cookies) {
    target.append('Set-Cookie', isHttpsRequest ? `${cookie}; SameSite=None; Secure` : cookie)
  }
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
