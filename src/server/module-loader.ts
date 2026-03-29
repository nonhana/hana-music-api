import { readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import type { ModuleDefinition } from '../types/index.ts'

const DEFAULT_SPECIAL_ROUTES: Readonly<Record<string, string>> = {
  'daily-signin': '/daily_signin',
  daily_signin: '/daily_signin',
  'fm-trash': '/fm_trash',
  fm_trash: '/fm_trash',
  'personal-fm': '/personal_fm',
  personal_fm: '/personal_fm',
}

export async function loadModuleDefinitions(modulesDirectory: string): Promise<ModuleDefinition[]> {
  const files = await collectModuleFiles(modulesDirectory)
  const modules = await Promise.all(
    files.toReversed().map(async (filePath) => {
      const relativePath = relative(modulesDirectory, filePath)
      const identifier = relativePath.replace(/\.[^.]+$/u, '').replaceAll('\\', '/')
      const route = parseModuleRoute(identifier)
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

export function parseModuleRoute(identifier: string): string {
  const normalized = identifier.replaceAll('\\', '/')
  if (normalized in DEFAULT_SPECIAL_ROUTES) {
    return DEFAULT_SPECIAL_ROUTES[normalized] ?? `/${normalized}`
  }

  const route = normalized
    .split('/')
    .flatMap((segment) => segment.split(/[_-]/u))
    .filter(Boolean)
    .join('/')

  return `/${route}`
}

async function collectModuleFiles(directory: string): Promise<string[]> {
  let entries
  try {
    entries = await readdir(resolve(directory), {
      withFileTypes: true,
    })
  } catch (error) {
    if (hasErrorCode(error, 'ENOENT')) {
      return []
    }

    throw error
  }
  const files = await Promise.all(
    entries.map(async (entry) => {
      const filePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        return collectModuleFiles(filePath)
      }

      if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
        !entry.name.endsWith('.d.ts') &&
        !entry.name.startsWith('_')
      ) {
        return [filePath]
      }

      return []
    }),
  )

  return files.flat()
}

function isModuleImport(value: unknown): value is { readonly default: ModuleDefinition['module'] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'default' in value &&
    typeof value.default === 'function'
  )
}

function hasErrorCode(value: unknown, code: string): value is NodeJS.ErrnoException {
  return typeof value === 'object' && value !== null && 'code' in value && value.code === code
}
