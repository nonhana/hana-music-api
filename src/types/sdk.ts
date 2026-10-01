import type {
  ModuleIdentifier,
  ModuleInputOf,
  ModuleResponseOf,
} from './module-contracts.ts';
import type { CreateRequestOptions } from './request.ts';
import type { ModuleDefinition, ModuleEffect } from './runtime.ts';

export interface ModuleCallConfig extends CreateRequestOptions {}

export interface SdkCacheConfig {
  readonly enabled?: boolean;
  readonly ttlMs?: number;
}

export interface IdentityPoolConfig {
  readonly size: number;
}

export interface CreateHanaMusicApiConfig extends ModuleCallConfig {
  readonly cache?: SdkCacheConfig;
  readonly identityPool?: IdentityPoolConfig;
}

type DisallowExecutionKeys = {
  [K in keyof ModuleCallConfig]?: never;
};

type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type SdkQueryOf<K extends ModuleIdentifier> = ModuleInputOf<K> &
  DisallowExecutionKeys;

export type SdkModuleInvoker<K extends ModuleIdentifier> =
  RequiredKeys<SdkQueryOf<K>> extends never
    ? (
        query?: SdkQueryOf<K>,
        config?: ModuleCallConfig,
      ) => Promise<ModuleResponseOf<K>>
    : (
        query: SdkQueryOf<K>,
        config?: ModuleCallConfig,
      ) => Promise<ModuleResponseOf<K>>;

export type SdkModuleImplementation<
  K extends ModuleIdentifier = ModuleIdentifier,
> = ModuleEffect<ModuleInputOf<K>, ModuleResponseOf<K>['body']>;

export type SdkModuleRegistry = {
  [K in ModuleIdentifier]: ModuleDefinition<
    K,
    ModuleInputOf<K>,
    ModuleResponseOf<K>['body']
  >;
};
