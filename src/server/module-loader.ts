import { pathToFileURL } from 'node:url'

import type { ModuleDefinition } from '../types/index.ts'

import { discoverModuleFiles } from './module-discovery.ts'

export { parseModuleRoute } from './module-discovery.ts'

export async function loadModuleDefinitions(modulesDirectory: string): Promise<ModuleDefinition[]> {
  const moduleFiles = await discoverModuleFiles(modulesDirectory)
  const modules = await Promise.all(
    moduleFiles.map(async ({ filePath, identifier, route }) => {
      const imported: unknown = await import(pathToFileURL(filePath).href)

      if (!isModuleImport(imported)) {
        throw new TypeError(`Module "${filePath}" must export a default function`)
      }

      return {
        identifier,
        module: imported.default,
        route,
      } satisfies ModuleDefinition
    }),
  )

  return modules
}

function isModuleImport(value: unknown): value is { readonly default: ModuleDefinition['module'] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'default' in value &&
    typeof value.default === 'function'
  )
}
