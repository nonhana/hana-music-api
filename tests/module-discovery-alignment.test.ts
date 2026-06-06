import { describe, expect, test } from 'bun:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { discoverModuleFiles } from '../src/server/module-discovery.ts'
import {
  generatedModuleIdentifiers,
  generatedModuleRoutes,
} from '../src/types/generated/module-surface.generated.ts'

const REAL_MODULES_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '../src/modules')

describe('generated module type surface', () => {
  test('should stay aligned with runtime module discovery', async () => {
    const discovered = await discoverModuleFiles(REAL_MODULES_DIRECTORY)
    const identifiers = discovered
      .map((moduleFile) => moduleFile.identifier)
      .toSorted((left, right) => left.localeCompare(right))
    const routes = Object.fromEntries(
      discovered
        .map((moduleFile) => [moduleFile.identifier, moduleFile.route] as const)
        .toSorted(([left], [right]) => left.localeCompare(right)),
    )
    const generatedIdentifiers: string[] = [...generatedModuleIdentifiers]
    const generatedRoutes: Record<string, string> = {
      ...generatedModuleRoutes,
    }

    expect(generatedIdentifiers).toEqual(identifiers)
    expect(generatedRoutes).toEqual(routes)
  })
})
