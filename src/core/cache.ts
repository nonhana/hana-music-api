import type { NcmApiResponse } from '../types/index.ts'

interface CacheEntry {
  readonly expiresAt: number
  readonly response: NcmApiResponse
}

/**
 * Phase 2 先用轻量内存缓存复刻旧服务的基础行为，
 * 等后续需要更复杂的命中策略时，再独立扩展缓存后端。
 */
export class MemoryResponseCache {
  readonly #entries = new Map<string, CacheEntry>()

  constructor(private readonly ttlMs: number) {}

  get(key: string): NcmApiResponse | null {
    const entry = this.#entries.get(key)
    if (!entry) {
      return null
    }

    if (entry.expiresAt <= Date.now()) {
      this.#entries.delete(key)
      return null
    }

    return cloneResponse(entry.response)
  }

  set(key: string, response: NcmApiResponse): void {
    this.#entries.set(key, {
      expiresAt: Date.now() + this.ttlMs,
      response: cloneResponse(response),
    })
  }
}

function cloneResponse(response: NcmApiResponse): NcmApiResponse {
  return {
    body: structuredClone(response.body),
    cookie: [...response.cookie],
    status: response.status,
  }
}
