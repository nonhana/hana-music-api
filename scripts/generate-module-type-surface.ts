import { spawnSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { discoverModuleFiles } from '../src/server/module-discovery.ts'

const MODULES_DIRECTORY = resolve(import.meta.dir, '../src/modules')
const OUTPUT_FILE = resolve(import.meta.dir, '../src/types/generated/module-surface.generated.ts')
const TEMP_FILE = resolve(import.meta.dir, '../src/types/generated/module-surface.tmp.ts')

async function buildModuleSurface(): Promise<{ contents: string; count: number }> {
  const discovered = await discoverModuleFiles(MODULES_DIRECTORY)
  const sorted = discovered.toSorted((left, right) =>
    left.identifier.localeCompare(right.identifier),
  )

  const identifiers = sorted.map((moduleFile) => moduleFile.identifier)
  const routes = sorted.map((moduleFile) => [moduleFile.identifier, moduleFile.route] as const)

  const contents = `import type { LegacyModuleQuery } from '../modules.ts'
import type { NcmApiResponse } from '../runtime.ts'

export const generatedModuleIdentifiers = ${JSON.stringify(identifiers, null, 2)} as const

export type GeneratedModuleIdentifier = (typeof generatedModuleIdentifiers)[number]

export const generatedModuleRoutes = ${JSON.stringify(Object.fromEntries(routes), null, 2)} as const satisfies Readonly<
  Record<GeneratedModuleIdentifier, string>
>

export interface GeneratedModuleContractDefinition {
  query: LegacyModuleQuery
  response: NcmApiResponse
}

export type GeneratedModuleContractMap = {
  [K in GeneratedModuleIdentifier]: GeneratedModuleContractDefinition
}
`

  return {
    contents,
    count: identifiers.length,
  }
}

function formatFile(filePath: string): void {
  const formatResult = spawnSync('bun', ['x', 'oxfmt', filePath], {
    stdio: 'inherit',
  })

  if (formatResult.status !== 0) {
    throw new Error(`Failed to format generated module type surface: ${filePath}`)
  }
}

async function writeSurface(): Promise<void> {
  const { contents, count } = await buildModuleSurface()
  await mkdir(dirname(OUTPUT_FILE), {
    recursive: true,
  })
  await writeFile(OUTPUT_FILE, contents)
  formatFile(OUTPUT_FILE)
  console.log(`Generated ${count} module identifiers -> ${OUTPUT_FILE}`)
}

async function checkSurface(): Promise<void> {
  const { contents } = await buildModuleSurface()
  await mkdir(dirname(TEMP_FILE), {
    recursive: true,
  })
  await writeFile(TEMP_FILE, contents)

  try {
    formatFile(TEMP_FILE)
    const [expected, actual] = await Promise.all([
      readFile(TEMP_FILE, 'utf8'),
      readFile(OUTPUT_FILE, 'utf8').catch(() => ''),
    ])

    if (expected !== actual) {
      throw new Error(
        `Generated module type surface is out of date. Run "bun run types:modules:generate" and commit ${OUTPUT_FILE}.`,
      )
    }

    console.log(`Generated module type surface is up to date -> ${OUTPUT_FILE}`)
  } finally {
    await rm(TEMP_FILE, {
      force: true,
    })
  }
}

if (process.argv.includes('--check')) {
  await checkSurface()
} else {
  await writeSurface()
}
