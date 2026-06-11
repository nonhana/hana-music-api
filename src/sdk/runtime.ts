import type {
  CreateHanaMusicApiConfig,
  LegacyCompatibleSdkModuleInvoker,
  ModuleCallConfig,
  ModuleIdentifier,
  ModuleQuery,
  ModuleQueryOf,
  ModuleRequest,
  ModuleResponseOf,
  SdkModuleImplementation,
  SdkModuleInvoker,
  SdkQueryOf,
} from '../types/index.ts'

import { ensureRuntimeAnonymousToken } from '../core/anonymous.ts'
import { createRequest } from '../core/request.ts'
import { cookieToJson, isRecord } from '../core/utils.ts'
import { sdkModuleRegistry } from './generated/registry.generated.ts'

function mergeQueryAndConfig(query: ModuleQuery, config: ModuleCallConfig = {}): ModuleQuery {
  return {
    ...config,
    ...query,
  }
}

export async function invokeModule<K extends ModuleIdentifier>(
  identifier: K,
  query: SdkQueryOf<K>,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>> {
  const moduleImplementation = sdkModuleRegistry[identifier] as SdkModuleImplementation<K>
  return invokeStaticModule(identifier, moduleImplementation, query, config)
}

export function createLegacyCompatibleModuleInvoker<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
): LegacyCompatibleSdkModuleInvoker<K> {
  return async (query = {} as ModuleQueryOf<K>) => {
    return moduleImplementation(query, createRequest as ModuleRequest)
  }
}

export function createModuleInvoker<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  baseConfig: CreateHanaMusicApiConfig = {},
): SdkModuleInvoker<K> {
  return (async (query?: SdkQueryOf<K>, config?: ModuleCallConfig) => {
    const resolvedQuery = (query ?? {}) as SdkQueryOf<K>

    return invokeStaticModule(identifier, moduleImplementation, resolvedQuery, {
      ...baseConfig,
      ...config,
    })
  }) as SdkModuleInvoker<K>
}

// 调用方已带身份(MUSIC_U/MUSIC_A 或 state.anonymousToken)时,不应再触发懒刷新。
function hasConfiguredIdentity(config: ModuleCallConfig | undefined): boolean {
  if (!config) {
    return false
  }

  if (config.state?.anonymousToken) {
    return true
  }

  const cookie = config.cookie
  if (typeof cookie === 'string') {
    const parsed = cookieToJson(cookie)
    return Boolean(parsed.MUSIC_U || parsed.MUSIC_A)
  }

  if (isRecord(cookie)) {
    return Boolean(cookie.MUSIC_U || cookie.MUSIC_A)
  }

  return false
}

async function invokeStaticModule<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  query: SdkQueryOf<K>,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>> {
  void identifier
  // 未携带任何身份时,惰性确保进程持有一个匿名 token(单飞,仅首次付费)。
  if (!hasConfiguredIdentity(config)) {
    await ensureRuntimeAnonymousToken({
      fetcher: config?.fetcher,
    })
  }

  return moduleImplementation(
    mergeQueryAndConfig(query, config) as ModuleQueryOf<K>,
    createRequest as ModuleRequest,
  )
}
