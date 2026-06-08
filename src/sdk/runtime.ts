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

import { createRequest } from '../core/request.ts'
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
  return async (query, config) => {
    return invokeStaticModule(identifier, moduleImplementation, query, {
      ...baseConfig,
      ...config,
    })
  }
}

async function invokeStaticModule<K extends ModuleIdentifier>(
  identifier: K,
  moduleImplementation: SdkModuleImplementation<K>,
  query: SdkQueryOf<K>,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>> {
  void identifier
  return moduleImplementation(
    mergeQueryAndConfig(query, config) as ModuleQueryOf<K>,
    createRequest as ModuleRequest,
  )
}
