import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildCallServices, runCall } from '../core/call.ts';
import { createOption } from '../core/options.ts';
import { requestEffect } from '../core/request.ts';
import { cookieToJson, isRecord } from '../core/utils.ts';
import { loadModuleDefinitions } from '../server/module-loader.ts';
import type { LoadedModuleDefinition } from '../server/module-loader.ts';
import type {
  CreateModuleApiOptions,
  DynamicProgrammaticApi,
  ModuleIdentifier,
  ModuleQuery,
  ModuleQueryOf,
  ModuleResponseOf,
  NcmApiResponse,
  ProgrammaticApi,
  ProgrammaticModuleInvoker,
  RequestCapability,
} from '../types/index.ts';

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

        return async (query: ModuleQuery = {}) => {
          const registry = await registryPromise;
          const moduleDefinition = registry.get(property);
          if (!moduleDefinition) {
            throw new TypeError(`Unknown module identifier: ${property}`);
          }
          return createModuleInvoker(
            moduleDefinition,
            requestHandler,
            modules,
          )(query);
        };
      },
      has: (_target, property) => typeof property === 'string',
      ownKeys: () => [],
    },
  );
}

export async function invokeModule<K extends ModuleIdentifier>(
  identifier: K,
  query: ModuleQueryOf<K> & ModuleQuery,
  options?: StaticCreateModuleApiOptions,
): Promise<ModuleResponseOf<K>>;
export async function invokeModule(
  identifier: string,
  query: ModuleQuery,
  options: DynamicCreateModuleApiOptions,
): Promise<NcmApiResponse>;
export async function invokeModule(
  identifier: string,
  query: ModuleQuery = {},
  options: CreateModuleApiOptions = {},
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
  return createModuleInvoker(moduleDefinition, requestHandler, modules)(query);
}

const createModuleInvoker =
  (
    moduleDefinition: LoadedModuleDefinition,
    requestHandler: RequestCapability,
    modules: ModuleServices,
  ): ProgrammaticModuleInvoker =>
  async (query = {}) => {
    if (
      !isRecord(query) ||
      (Object.getPrototypeOf(query) !== Object.prototype &&
        Object.getPrototypeOf(query) !== null)
    ) {
      return runCall(
        { identifier: moduleDefinition.identifier, input: query, config: {} },
        modules,
        moduleDefinition,
        requestHandler,
      );
    }
    const normalized = normalizeProgrammaticQuery(query);
    const { signal, ...config } = createOption(normalized);
    const business = Object.fromEntries(
      Object.entries(normalized).filter(
        ([key]) =>
          key === 'cookie' || (!Object.hasOwn(config, key) && key !== 'signal'),
      ),
    );
    return runCall(
      {
        identifier: moduleDefinition.identifier,
        input: business,
        config,
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
      moduleDefinition,
    ]),
  );
};

const normalizeProgrammaticQuery = (query: ModuleQuery): ModuleQuery => {
  const normalized = {
    ...query,
  };

  if (typeof normalized.cookie === 'string') {
    normalized.cookie = cookieToJson(normalized.cookie);
  }

  return normalized;
};

export const NeteaseCloudMusicApi = createModuleApi();
