import { validateModuleActions } from '../core/request-actions.ts';
import { isRecord } from '../core/utils.ts';
import type {
  AnySdkModuleInvoker,
  CreateHanaMusicApiConfig,
  ModuleIdentifier,
  SdkModuleRegistry,
} from '../types/index.ts';
import {
  createEffectModuleInvoker,
  createSdkClientContext,
  MODULE_DEFINITION_SYMBOL,
} from './invoker.ts';

const isModuleDefinition = (
  value: unknown,
): value is SdkModuleRegistry[ModuleIdentifier] =>
  isRecord(value) &&
  typeof value.identifier === 'string' &&
  typeof value.route === 'string' &&
  typeof value.execute === 'function' &&
  typeof value.decodeInput === 'function' &&
  isRecord(value.actions);

export const createClient = <
  Modules extends Record<string, AnySdkModuleInvoker>,
>(
  modules: Modules,
  config: CreateHanaMusicApiConfig = {},
): Modules => {
  const context = createSdkClientContext(config);
  if (!isRecord(modules)) {
    throw new TypeError(
      'createClient requires an object map of SDK module functions',
    );
  }
  const bound: Record<string, unknown> = {};
  for (const [key, candidate] of Object.entries(modules)) {
    if (typeof candidate !== 'function') {
      throw new TypeError(
        `createClient entry "${key}" is not a valid hana-music-api module function`,
      );
    }
    const definition: unknown = Reflect.get(
      candidate,
      MODULE_DEFINITION_SYMBOL,
    );
    if (!isModuleDefinition(definition)) {
      throw new TypeError(
        `createClient entry "${key}" is not a valid hana-music-api module function`,
      );
    }
    let validatedActions: ReturnType<typeof validateModuleActions>;
    try {
      validatedActions = validateModuleActions(definition.actions);
    } catch (error) {
      throw new TypeError(
        error instanceof Error
          ? error.message
          : `createClient entry "${key}" has invalid module actions`,
        { cause: error },
      );
    }
    Object.defineProperty(bound, key, {
      configurable: true,
      enumerable: true,
      value: createEffectModuleInvoker(
        definition.identifier,
        { ...definition, actions: validatedActions },
        config,
        context,
      ),
      writable: true,
    });
  }
  return bound as Modules;
};
