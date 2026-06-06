import { readdir } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

export interface DiscoveredModuleFile {
  readonly filePath: string
  readonly identifier: string
  readonly route: string
}

const DEFAULT_SPECIAL_ROUTES: Readonly<Record<string, string>> = {
  'daily-signin': '/daily_signin',
  daily_signin: '/daily_signin',
  'fm-trash': '/fm_trash',
  fm_trash: '/fm_trash',
  'personal-fm': '/personal_fm',
  personal_fm: '/personal_fm',
}

export async function discoverModuleFiles(
  modulesDirectory: string,
): Promise<DiscoveredModuleFile[]> {
  const files = await collectModuleFiles(modulesDirectory)
  return files.toReversed().map((filePath) => {
    const relativePath = relative(modulesDirectory, filePath)
    const identifier = relativePath.replace(/\.[^.]+$/u, '').replaceAll('\\', '/')

    return {
      filePath,
      identifier,
      route: parseModuleRoute(identifier),
    }
  })
}

export function parseModuleRoute(identifier: string): string {
  const normalized = identifier.replaceAll('\\', '/')
  if (normalized in DEFAULT_SPECIAL_ROUTES) {
    return DEFAULT_SPECIAL_ROUTES[normalized]!
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

function hasErrorCode(value: unknown, code: string): value is NodeJS.ErrnoException {
  return typeof value === 'object' && value !== null && 'code' in value && value.code === code
}
