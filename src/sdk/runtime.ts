import { buildCallServices, runCall } from '../core/call.ts';
import type {
  CreateHanaMusicApiConfig,
  ModuleCallConfig,
  ModuleIdentifier,
  ModuleResponseOf,
  SdkModuleInvoker,
  SdkModuleRegistry,
  SdkQueryOf,
} from '../types/index.ts';
import { sdkModuleRegistry } from './generated/registry.generated.ts';

export type SdkClientContext = ReturnType<typeof buildCallServices>;

let invocationServices: SdkClientContext | undefined;

export const createSdkClientContext = (config: CreateHanaMusicApiConfig) =>
  buildCallServices(config);

export const invokeModule = async <K extends ModuleIdentifier>(
  identifier: K,
  query: SdkQueryOf<K>,
  config: ModuleCallConfig = {},
): Promise<ModuleResponseOf<K>> => {
  const { signal, ...callConfig } = config;
  return runCall(
    { identifier, input: query, config: callConfig, signal },
    (invocationServices ??= createSdkClientContext({})),
    sdkModuleRegistry[identifier] as SdkModuleRegistry[K],
  ) as Promise<ModuleResponseOf<K>>;
};

export const createEffectModuleInvoker = <K extends ModuleIdentifier>(
  identifier: K,
  definition: SdkModuleRegistry[K],
  baseConfig: CreateHanaMusicApiConfig = {},
  context: SdkClientContext = createSdkClientContext(baseConfig),
): SdkModuleInvoker<K> => {
  const { cache: _cache, identityPool: _pool, ...requestConfig } = baseConfig;
  return async (query?: SdkQueryOf<K>, config?: ModuleCallConfig) => {
    const { signal, ...callConfig } = { ...requestConfig, ...config };
    return runCall(
      {
        identifier,
        input: query === undefined ? {} : query,
        config: callConfig,
        signal,
      },
      context,
      definition,
    ) as Promise<ModuleResponseOf<K>>;
  };
};
