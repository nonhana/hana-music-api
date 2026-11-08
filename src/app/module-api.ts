import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { InternalExecution } from '../core/call-context.ts';
import { buildCallServices, runCall } from '../core/call.ts';
import { rejectRemovedRequestHandler } from '../core/options.ts';
import { validateModuleActions } from '../core/request-actions.ts';
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

export async function loadProgrammaticApi(
  options?: StaticCreateModuleApiOptions,
  execution?: InternalExecution,
): Promise<ProgrammaticApi>;
export async function loadProgrammaticApi(
  options: DynamicCreateModuleApiOptions,
  execution?: InternalExecution,
): Promise<DynamicProgrammaticApi>;
export async function loadProgrammaticApi(
  options: CreateModuleApiOptions = {},
  execution?: InternalExecution,
): Promise<ProgrammaticApi | DynamicProgrammaticApi> {
  const registry = await loadModuleRegistry(options);
  const modules = buildCallServices({}, false, execution);

  return Object.fromEntries(
    [...registry.entries()].map(([identifier, moduleDefinition]) => [
      identifier,
      createModuleInvoker(moduleDefinition, modules),
    ]),
  );
}

export function createModuleApi(
  options?: StaticCreateModuleApiOptions,
  execution?: InternalExecution,
): ProgrammaticApi;
export function createModuleApi(
  options: DynamicCreateModuleApiOptions,
  execution?: InternalExecution,
): DynamicProgrammaticApi;
export function createModuleApi(
  options: CreateModuleApiOptions = {},
  execution?: InternalExecution,
): ProgrammaticApi | DynamicProgrammaticApi {
  rejectRemovedRequestHandler(options);
  const registryPromise = loadModuleRegistry(options);
  const modules = buildCallServices({}, false, execution);

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
          return createModuleInvoker(moduleDefinition, modules)(query, config);
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
  execution?: InternalExecution,
): Promise<ModuleResponseOf<K>>;
export async function invokeModule(
  identifier: string,
  query: ModuleQuery & DisallowExecutionKeys,
  options: DynamicCreateModuleApiOptions,
  config?: ModuleCallConfig,
  execution?: InternalExecution,
): Promise<NcmApiResponse>;
export async function invokeModule(
  identifier: string,
  query: ModuleQuery = {},
  options: CreateModuleApiOptions = {},
  config: ModuleCallConfig = {},
  execution?: InternalExecution,
): Promise<NcmApiResponse> {
  const registry = await loadModuleRegistry(options);
  const moduleDefinition = registry.get(identifier);
  if (!moduleDefinition) {
    throw new TypeError(`Unknown module identifier: ${identifier}`);
  }

  const implementation = moduleDefinition.execute;
  const runtimeKey = execution ?? implementation;
  let modules = invocationRuntimes.get(runtimeKey);
  if (!modules) {
    modules = buildCallServices({}, false, execution);
    invocationRuntimes.set(runtimeKey, modules);
  }
  return createModuleInvoker(moduleDefinition, modules)(query, config);
}

const createModuleInvoker =
  (
    moduleDefinition: LoadedModuleDefinition,
    modules: ModuleServices,
  ): ProgrammaticModuleInvoker =>
  async (query = {}, config = {}) =>
    runCall(
      {
        identifier: moduleDefinition.identifier,
        input: query,
        config,
      },
      modules,
      moduleDefinition,
    );

const loadModuleRegistry = async (
  options: CreateModuleApiOptions,
): Promise<ModuleRegistry> => {
  rejectRemovedRequestHandler(options);
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
