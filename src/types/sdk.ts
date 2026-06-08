import type { ModuleIdentifier, ModuleQueryOf, ModuleResponseOf } from './module-contracts.ts'
import type { CreateRequestOptions } from './request.ts'

export interface ModuleCallConfig extends CreateRequestOptions {}

export interface CreateHanaMusicApiConfig extends ModuleCallConfig {}

export type SdkModuleInvoker<K extends ModuleIdentifier> = (
  query: ModuleQueryOf<K>,
  config?: ModuleCallConfig,
) => Promise<ModuleResponseOf<K>>
