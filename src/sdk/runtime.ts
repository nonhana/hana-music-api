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

export const createSdkClientContext = (config: CreateHanaMusicApiConfig) => {
  try {
    return buildCallServices(config);
  } catch (error) {
    throw new TypeError(
      error instanceof Error ? error.message : 'Invalid module client config',
      { cause: error },
    );
  }
};

export const invokeModule = async <K extends ModuleIdentifier>(
  identifier: K,
  query: SdkQueryOf<K>,
  config: ModuleCallConfig = {},
): Promise<ModuleResponseOf<K>> =>
  runCall(
    { identifier, input: query, config },
    (invocationServices ??= createSdkClientContext({})),
    sdkModuleRegistry[identifier],
  ) as Promise<ModuleResponseOf<K>>;

export const createEffectModuleInvoker = <K extends ModuleIdentifier>(
  identifier: K,
  definition: SdkModuleRegistry[K],
  baseConfig: CreateHanaMusicApiConfig = {},
  context: SdkClientContext = createSdkClientContext(baseConfig),
): SdkModuleInvoker<K> => {
  const { cache: _cache, identityPool: _pool, ...defaults } = baseConfig;
  return async (query?: SdkQueryOf<K>, config: ModuleCallConfig = {}) =>
    runCall(
      {
        identifier,
        input: query === undefined ? {} : query,
        config,
        defaults,
      },
      context,
      definition,
    ) as Promise<ModuleResponseOf<K>>;
};
