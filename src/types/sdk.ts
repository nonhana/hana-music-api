import type {
  ModuleIdentifier,
  ModuleQueryOf,
  ModuleResponseOf,
  ProgrammaticModuleInvoker,
} from './module-contracts.ts'
import type { CreateRequestOptions } from './request.ts'
import type { ModuleRequest } from './runtime.ts'

export interface ModuleCallConfig extends CreateRequestOptions {}

export interface CreateHanaMusicApiConfig extends ModuleCallConfig {}

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K
    ? never
    : number extends K
      ? never
      : symbol extends K
        ? never
        : K]: T[K]
}

type DisallowExecutionKeys = {
  [K in keyof ModuleCallConfig]?: never
}

type StripExecutionKeys<T> = Omit<RemoveIndexSignature<T>, keyof ModuleCallConfig> &
  DisallowExecutionKeys

type HasExplicitKeys<T> = keyof RemoveIndexSignature<T> extends never ? false : true
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

type SdkFallbackQuery = Record<string, unknown> & DisallowExecutionKeys

export type SdkQueryOf<K extends ModuleIdentifier> =
  HasExplicitKeys<ModuleQueryOf<K>> extends true
    ? StripExecutionKeys<ModuleQueryOf<K>>
    : SdkFallbackQuery

export type SdkModuleInvoker<K extends ModuleIdentifier> =
  RequiredKeys<SdkQueryOf<K>> extends never
    ? (query?: SdkQueryOf<K>, config?: ModuleCallConfig) => Promise<ModuleResponseOf<K>>
    : (query: SdkQueryOf<K>, config?: ModuleCallConfig) => Promise<ModuleResponseOf<K>>

export type SdkModuleImplementation<K extends ModuleIdentifier = ModuleIdentifier> = (
  query: ModuleQueryOf<K>,
  request: ModuleRequest,
) => Promise<ModuleResponseOf<K>> | ModuleResponseOf<K>

export type SdkModuleRegistry = {
  [K in ModuleIdentifier]: SdkModuleImplementation<K>
}

export type LegacyCompatibleSdkModuleInvoker<K extends ModuleIdentifier> =
  ProgrammaticModuleInvoker<ModuleQueryOf<K>, ModuleResponseOf<K>>
