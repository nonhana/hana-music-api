import type {
  CreateHanaMusicApiConfig,
  ModuleCallConfig,
  ModuleIdentifier,
  ModuleQuery,
  ModuleQueryOf,
  ModuleResponseOf,
  SdkModuleInvoker,
} from '../types/index.ts'

import { invokeModule as invokeLegacyModule } from '../app/module-api.ts'

function mergeQueryAndConfig(query: ModuleQuery, config: ModuleCallConfig = {}): ModuleQuery {
  return {
    ...config,
    ...query,
  }
}

export async function invokeModule<K extends ModuleIdentifier>(
  identifier: K,
  query: ModuleQueryOf<K>,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>> {
  return invokeLegacyModule(identifier, mergeQueryAndConfig(query, config) as ModuleQueryOf<K>)
}

export function createModuleInvoker<K extends ModuleIdentifier>(
  identifier: K,
  baseConfig: CreateHanaMusicApiConfig = {},
): SdkModuleInvoker<K> {
  return async (query, config) => {
    return invokeModule(identifier, query, {
      ...baseConfig,
      ...config,
    })
  }
}
