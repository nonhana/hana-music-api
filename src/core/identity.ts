import type { FetchLike, IdentityPoolConfig, ModuleCallConfig } from '../types/index.ts'

import { registerAnonymousToken } from './anonymous.ts'

export interface IdentityPool {
  next: () => Promise<Partial<ModuleCallConfig>>
}

// 惰性注册 size 个匿名身份,按调用轮询。每个身份携带自己的 cnIp / deviceId / MUSIC_A。
export function createIdentityPool(
  config: IdentityPoolConfig,
  fetcher: FetchLike | undefined,
): IdentityPool {
  const size = Math.max(1, Math.floor(config.size))
  const identities: Array<Partial<ModuleCallConfig>> = []
  let ready: Promise<void> | null = null
  let cursor = 0

  const register = async (): Promise<void> => {
    identities.length = 0
    for (let index = 0; index < size; index += 1) {
      const registration = await registerAnonymousToken({
        fetcher,
      })
      identities.push({
        cookie: {
          MUSIC_A: registration.anonymousToken,
        },
        ip: registration.cnIp,
        state: {
          anonymousToken: registration.anonymousToken,
          cnIp: registration.cnIp,
          deviceId: registration.deviceId,
        },
      })
    }
  }

  return {
    async next() {
      if (!ready) {
        // 初始化失败(瞬态网络错误)时清空 ready,允许后续调用重试,避免池永久不可用。
        ready = register().catch((error: unknown) => {
          ready = null
          throw error
        })
      }
      await ready

      const identity = identities[cursor % identities.length]
      cursor += 1

      return identity ?? {}
    },
  }
}
