import { runCall } from '../core/call.ts';
import type {
  ModuleCallConfig,
  ModuleIdentifier,
  ModuleResponseOf,
  SdkQueryOf,
} from '../types/index.ts';
import { sdkModuleRegistry } from './generated/registry.generated.ts';
import { getDefaultSdkClientContext } from './invoker.ts';

export {
  createEffectModuleInvoker,
  createSdkClientContext,
  type SdkClientContext,
} from './invoker.ts';

export const invokeModule = async <K extends ModuleIdentifier>(
  identifier: K,
  query: SdkQueryOf<K>,
  config: ModuleCallConfig = {},
): Promise<ModuleResponseOf<K>> =>
  runCall(
    { identifier, input: query, config },
    getDefaultSdkClientContext(),
    sdkModuleRegistry[identifier],
  ) as Promise<ModuleResponseOf<K>>;
