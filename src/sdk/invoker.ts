import { buildCallServices, runCall } from '../core/call.ts';
import { validateModuleActions } from '../core/request-actions.ts';
import type {
  CreateHanaMusicApiConfig,
  ModuleCallConfig,
  ModuleDefinition,
  ModuleIdentifier,
  ModuleQuery,
  ModuleResponse,
  ModuleResponseOf,
  SdkModuleInvoker,
  SdkModuleInvokerFor,
  SdkModuleRegistry,
  SdkQueryOf,
  UnknownJson,
} from '../types/index.ts';

export type SdkClientContext = ReturnType<typeof buildCallServices>;

// 仅在内部连接生成的具名函数与 createClient，不暴露为可枚举属性。
export const MODULE_DEFINITION_SYMBOL = Symbol.for(
  'hana-music-api.module-definition',
);

let defaultContext: SdkClientContext | undefined;

export const getDefaultSdkClientContext = (): SdkClientContext => {
  defaultContext ??= createSdkClientContext({});
  return defaultContext;
};

export const createSdkClientContext = (
  config: CreateHanaMusicApiConfig,
): SdkClientContext => {
  try {
    return buildCallServices(config);
  } catch (error) {
    throw new TypeError(
      error instanceof Error ? error.message : 'Invalid module client config',
      { cause: error },
    );
  }
};

export const createEffectModuleInvoker = <K extends ModuleIdentifier>(
  identifier: K,
  definition: SdkModuleRegistry[K],
  baseConfig: CreateHanaMusicApiConfig = {},
  context?: SdkClientContext,
): SdkModuleInvoker<K> => {
  const boundContext =
    context ??
    (Reflect.ownKeys(baseConfig).length > 0
      ? createSdkClientContext(baseConfig)
      : undefined);
  const { cache: _cache, identityPool: _pool, ...defaults } = baseConfig;
  const invoker = (async (
    query?: SdkQueryOf<K>,
    config: ModuleCallConfig = {},
  ) =>
    runCall(
      {
        identifier,
        input: query === undefined ? {} : query,
        config,
        defaults,
      },
      boundContext ?? getDefaultSdkClientContext(),
      definition,
    ) as Promise<ModuleResponseOf<K>>) as SdkModuleInvoker<K>;
  Object.defineProperty(invoker, MODULE_DEFINITION_SYMBOL, {
    value: definition,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return invoker;
};

export const createStandaloneModuleInvoker = <
  PublicInput extends ModuleQuery,
  Body = UnknownJson,
>(
  definition: ModuleDefinition<string, PublicInput, Body>,
): SdkModuleInvokerFor<PublicInput, ModuleResponse<Body>> => {
  let validated: ModuleDefinition<string, PublicInput, Body> | undefined;
  const invoker = (async (
    query?: PublicInput,
    config: ModuleCallConfig = {},
  ): Promise<ModuleResponse<Body>> => {
    validated ??= {
      ...definition,
      actions: validateModuleActions(definition.actions),
    };
    return runCall(
      {
        identifier: definition.identifier,
        input: query === undefined ? {} : query,
        config,
      },
      getDefaultSdkClientContext(),
      validated as ModuleDefinition<string, PublicInput>,
    ) as Promise<ModuleResponse<Body>>;
  }) as SdkModuleInvokerFor<PublicInput, ModuleResponse<Body>>;
  Object.defineProperty(invoker, MODULE_DEFINITION_SYMBOL, {
    value: definition,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return invoker;
};
