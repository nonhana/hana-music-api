import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import type {
  CreateModuleApiOptions,
  DynamicProgrammaticApi,
  ModuleIdentifier,
  ModuleDefinition,
  ModuleQueryOf,
  ModuleQuery,
  ModuleRequest,
  ModuleResponseOf,
  NcmApiResponse,
  ProgrammaticApi,
  ProgrammaticModuleInvoker,
} from '../types/index.ts'

import { createRequest } from '../core/request.ts'
import { cookieToJson, isRecord } from '../core/utils.ts'
import { loadModuleDefinitions } from '../server/module-loader.ts'

const DEFAULT_MODULES_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../modules')

type ModuleRegistry = ReadonlyMap<string, ModuleDefinition>
type DynamicCreateModuleApiOptions = CreateModuleApiOptions &
  (
    | {
        moduleDefinitions: ModuleDefinition[]
        modulesDirectory?: string
      }
    | {
        moduleDefinitions?: ModuleDefinition[]
        modulesDirectory: string
      }
  )
type StaticCreateModuleApiOptions = Omit<
  CreateModuleApiOptions,
  'moduleDefinitions' | 'modulesDirectory'
> & {
  moduleDefinitions?: undefined
  modulesDirectory?: undefined
}

export async function loadProgrammaticApi(): Promise<ProgrammaticApi>
export async function loadProgrammaticApi(
  options: StaticCreateModuleApiOptions,
): Promise<ProgrammaticApi>
export async function loadProgrammaticApi(
  options: DynamicCreateModuleApiOptions,
): Promise<DynamicProgrammaticApi>
export async function loadProgrammaticApi(
  options: CreateModuleApiOptions = {},
): Promise<ProgrammaticApi | DynamicProgrammaticApi> {
  const registry = await loadModuleRegistry(options)
  const requestHandler = options.requestHandler ?? createDefaultModuleRequest()

  return Object.fromEntries(
    [...registry.entries()].map(([identifier, moduleDefinition]) => {
      return [identifier, createModuleInvoker(moduleDefinition, requestHandler)]
    }),
  ) as DynamicProgrammaticApi
}

export function createModuleApi(): ProgrammaticApi
export function createModuleApi(options: StaticCreateModuleApiOptions): ProgrammaticApi
export function createModuleApi(options: DynamicCreateModuleApiOptions): DynamicProgrammaticApi
export function createModuleApi(
  options: CreateModuleApiOptions = {},
): ProgrammaticApi | DynamicProgrammaticApi {
  const registryPromise = loadModuleRegistry(options)
  const requestHandler = options.requestHandler ?? createDefaultModuleRequest()

  return new Proxy(
    {},
    {
      get(_target, property) {
        if (typeof property !== 'string' || property === 'then') {
          return undefined
        }

        return async (query: ModuleQuery = {}) => {
          const registry = await registryPromise
          const moduleDefinition = registry.get(property)
          if (!moduleDefinition) {
            throw new TypeError(`Unknown module identifier: ${property}`)
          }

          return createModuleInvoker(moduleDefinition, requestHandler)(query)
        }
      },
      has(_target, property) {
        return typeof property === 'string'
      },
      ownKeys() {
        return []
      },
    },
  ) as DynamicProgrammaticApi
}

export async function invokeModule<K extends ModuleIdentifier>(
  identifier: K,
  query: ModuleQueryOf<K>,
  options?: StaticCreateModuleApiOptions,
): Promise<ModuleResponseOf<K>>
export async function invokeModule(
  identifier: string,
  query: ModuleQuery,
  options: DynamicCreateModuleApiOptions,
): Promise<NcmApiResponse>
export async function invokeModule(
  identifier: string,
  query: ModuleQuery = {},
  options: CreateModuleApiOptions = {},
): Promise<NcmApiResponse> {
  const registry = await loadModuleRegistry(options)
  const moduleDefinition = registry.get(identifier)
  if (!moduleDefinition) {
    throw new TypeError(`Unknown module identifier: ${identifier}`)
  }

  const requestHandler = options.requestHandler ?? createDefaultModuleRequest()
  return createModuleInvoker(moduleDefinition, requestHandler)(query)
}

export const NeteaseCloudMusicApi = createModuleApi()

function createDefaultModuleRequest(): ModuleRequest {
  // oxlint-disable-next-line typescript-eslint/no-unsafe-type-assertion -- ModuleRequest is the typed facade used across migrated modules.
  return createRequest as ModuleRequest
}

function createModuleInvoker(
  moduleDefinition: ModuleDefinition,
  requestHandler: ModuleRequest,
): ProgrammaticModuleInvoker {
  return async (query = {}) => {
    return moduleDefinition.module(normalizeProgrammaticQuery(query), requestHandler)
  }
}

async function loadModuleRegistry(options: CreateModuleApiOptions): Promise<ModuleRegistry> {
  const moduleDefinitions =
    options.moduleDefinitions ??
    (await loadModuleDefinitions(options.modulesDirectory ?? DEFAULT_MODULES_DIRECTORY))

  return new Map(
    moduleDefinitions.map((moduleDefinition) => [moduleDefinition.identifier, moduleDefinition]),
  )
}

function normalizeProgrammaticQuery(query: ModuleQuery): ModuleQuery {
  if (!isRecord(query)) {
    return {}
  }

  const normalized = {
    ...query,
  }

  if (typeof normalized.cookie === 'string') {
    normalized.cookie = cookieToJson(normalized.cookie)
  }

  return normalized
}
