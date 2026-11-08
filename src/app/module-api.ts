import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Effect } from 'effect';

import { buildCallServices, runCall } from '../core/call.ts';
import { validateModuleConfig } from '../core/options.ts';
import { validateModuleActions } from '../core/request-actions.ts';
import { requestEffect } from '../core/request.ts';
import { runPublicEffect } from '../core/runtime.ts';
import { loadModuleDefinitions } from '../server/module-loader.ts';
import type { LoadedModuleDefinition } from '../server/module-loader.ts';
import type {
  DynamicProgrammaticApi,
  ModuleCallConfig,
  ModuleIdentifier,
  ModuleQuery,
  ModuleResponseOf,
  NcmApiResponse,
  ProgrammaticApi,
  ProgrammaticModuleInvoker,
  RequestCapability,
  SdkQueryOf,
} from '../types/index.ts';
import type { DisallowExecutionKeys } from '../types/sdk.ts';
import type { CreateModuleApiOptions } from '../types/server.ts';

const DEFAULT_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../modules',
);
type ModuleServices = ReturnType<typeof buildCallServices>;
const invocationRuntimes = new WeakMap<object, ModuleServices>();

type ModuleRegistry = ReadonlyMap<string, LoadedModuleDefinition>;
type DynamicCreateModuleApiOptions = CreateModuleApiOptions &
  (
    | {
        moduleDefinitions: Array<LoadedModuleDefinition>;
        modulesDirectory?: string;
      }
    | {
        moduleDefinitions?: Array<LoadedModuleDefinition>;
        modulesDirectory: string;
      }
  );
type StaticCreateModuleApiOptions = Omit<
  CreateModuleApiOptions,
  'moduleDefinitions' | 'modulesDirectory'
> & {
  moduleDefinitions?: undefined;
  modulesDirectory?: undefined;
};

export async function loadProgrammaticApi(): Promise<ProgrammaticApi>;
export async function loadProgrammaticApi(
  options: StaticCreateModuleApiOptions,
): Promise<ProgrammaticApi>;
export async function loadProgrammaticApi(
  options: DynamicCreateModuleApiOptions,
): Promise<DynamicProgrammaticApi>;
export async function loadProgrammaticApi(
  options: CreateModuleApiOptions = {},
): Promise<ProgrammaticApi | DynamicProgrammaticApi> {
  const registry = await loadModuleRegistry(options);
  const requestHandler = options.requestHandler ?? requestEffect;
  const modules = buildCallServices({}, false);

  return Object.fromEntries(
    [...registry.entries()].map(([identifier, moduleDefinition]) => [
      identifier,
      createModuleInvoker(moduleDefinition, requestHandler, modules),
    ]),
  );
}

export function createModuleApi(): ProgrammaticApi;
export function createModuleApi(
  options: StaticCreateModuleApiOptions,
): ProgrammaticApi;
export function createModuleApi(
  options: DynamicCreateModuleApiOptions,
): DynamicProgrammaticApi;
export function createModuleApi(
  options: CreateModuleApiOptions = {},
): ProgrammaticApi | DynamicProgrammaticApi {
  const registryPromise = loadModuleRegistry(options);
  const requestHandler = options.requestHandler ?? requestEffect;
  const modules = buildCallServices({}, false);

  return new Proxy(
    {},
    {
      get: (_target, property) => {
        if (typeof property !== 'string' || property === 'then') {
          return undefined;
        }

        return async (
          query: ModuleQuery = {},
          config: ModuleCallConfig = {},
        ) => {
          const registry = await registryPromise;
          const moduleDefinition = registry.get(property);
          if (!moduleDefinition) {
            throw new TypeError(`Unknown module identifier: ${property}`);
          }
          return createModuleInvoker(
            moduleDefinition,
            requestHandler,
            modules,
          )(query, config);
        };
      },
      has: (_target, property) => typeof property === 'string',
      ownKeys: () => [],
    },
  );
}

export async function invokeModule<K extends ModuleIdentifier>(
  identifier: K,
  query: SdkQueryOf<K> & ModuleQuery,
  options?: StaticCreateModuleApiOptions,
  config?: ModuleCallConfig,
): Promise<ModuleResponseOf<K>>;
export async function invokeModule(
  identifier: string,
  query: ModuleQuery & DisallowExecutionKeys,
  options: DynamicCreateModuleApiOptions,
  config?: ModuleCallConfig,
): Promise<NcmApiResponse>;
export async function invokeModule(
  identifier: string,
  query: ModuleQuery = {},
  options: CreateModuleApiOptions = {},
  config: ModuleCallConfig = {},
): Promise<NcmApiResponse> {
  const registry = await loadModuleRegistry(options);
  const moduleDefinition = registry.get(identifier);
  if (!moduleDefinition) {
    throw new TypeError(`Unknown module identifier: ${identifier}`);
  }

  const requestHandler = options.requestHandler ?? requestEffect;
  const implementation = moduleDefinition.execute;
  let modules = invocationRuntimes.get(implementation);
  if (!modules) {
    modules = buildCallServices({}, false);
    invocationRuntimes.set(implementation, modules);
  }
  return createModuleInvoker(
    moduleDefinition,
    requestHandler,
    modules,
  )(query, config);
}

const createModuleInvoker =
  (
    moduleDefinition: LoadedModuleDefinition,
    requestHandler: RequestCapability,
    modules: ModuleServices,
  ): ProgrammaticModuleInvoker =>
  async (query = {}, config = {}) => {
    try {
      validateModuleConfig(config);
    } catch (error) {
      return runPublicEffect(Effect.fail(error));
    }
    const { signal, ...callConfig } = config;
    return runCall(
      {
        identifier: moduleDefinition.identifier,
        input: query,
        config: callConfig,
        signal,
      },
      modules,
      moduleDefinition,
      requestHandler,
    );
  };

const loadModuleRegistry = async (
  options: CreateModuleApiOptions,
): Promise<ModuleRegistry> => {
  const moduleDefinitions =
    options.moduleDefinitions ??
    (await loadModuleDefinitions(
      options.modulesDirectory ?? DEFAULT_MODULES_DIRECTORY,
    ));

  return new Map(
    moduleDefinitions.map((moduleDefinition) => [
      moduleDefinition.identifier,
      {
        ...moduleDefinition,
        actions: validateModuleActions(moduleDefinition.actions),
      },
    ]),
  );
};

export const NeteaseCloudMusicApi = createModuleApi();
