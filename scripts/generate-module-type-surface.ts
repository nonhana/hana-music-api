import { spawnSync } from 'node:child_process'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

import { discoverModuleFiles } from '../src/server/module-discovery.ts'

const MODULES_DIRECTORY = resolve(import.meta.dir, '../src/modules')
const OUTPUT_FILE = resolve(import.meta.dir, '../src/types/generated/module-surface.generated.ts')
const TEMP_FILE = resolve(import.meta.dir, '../src/types/generated/module-surface.tmp.ts')
const SDK_GENERATED_FILE = resolve(import.meta.dir, '../src/sdk/generated/client.generated.ts')
const SDK_GENERATED_TEMP_FILE = resolve(import.meta.dir, '../src/sdk/generated/client.tmp.ts')
const SDK_REGISTRY_FILE = resolve(import.meta.dir, '../src/sdk/generated/registry.generated.ts')
const SDK_REGISTRY_TEMP_FILE = resolve(import.meta.dir, '../src/sdk/generated/registry.tmp.ts')
const SDK_API_DIRECTORY = resolve(import.meta.dir, '../src/sdk/api')

interface GeneratedArtifacts {
  readonly files: ReadonlyArray<{
    readonly contents: string
    readonly path: string
    readonly tempPath?: string
  }>
  readonly moduleCount: number
}

function toCamelCase(identifier: string): string {
  return identifier.replaceAll(/[/_-]+([a-zA-Z0-9])/g, (_match, char: string) => {
    return char.toUpperCase()
  })
}

function buildSdkEntries(identifiers: readonly string[]): ReadonlyArray<{
  readonly functionName: string
  readonly identifier: string
  readonly importName: string
}> {
  const entries = identifiers.map((identifier) => {
    return {
      functionName: toCamelCase(identifier),
      identifier,
      importName: `${toCamelCase(identifier)}Module`,
    }
  })
  const collisions = new Map<string, string>()

  for (const entry of entries) {
    const existing = collisions.get(entry.functionName)
    if (existing) {
      throw new Error(
        `SDK export name collision: "${entry.functionName}" maps to both "${existing}" and "${entry.identifier}".`,
      )
    }

    collisions.set(entry.functionName, entry.identifier)
  }

  return entries
}

function buildSdkGeneratedClient(identifiers: readonly string[]): string {
  const entries = buildSdkEntries(identifiers)
  const methodLines = entries.map(({ functionName, identifier }) => {
    return `  ${functionName}: SdkModuleInvoker<'${identifier}'>`
  })
  const exportLines = entries.map(({ functionName, identifier }) => {
    return `export const ${functionName} = createModuleInvoker('${identifier}', sdkModuleRegistry.${identifier})`
  })
  const clientLines = entries.map(({ functionName, identifier }) => {
    return `    ${functionName}: createModuleInvoker('${identifier}', sdkModuleRegistry.${identifier}, config),`
  })

  return `import type { CreateHanaMusicApiConfig, SdkModuleInvoker } from '../../types/index.ts'
import { createModuleInvoker } from '../runtime.ts'
import { sdkModuleRegistry } from './registry.generated.ts'

export interface HanaMusicApiClient {
${methodLines.join('\n')}
}

${exportLines.join('\n')}

export function createHanaMusicApi(config: CreateHanaMusicApiConfig = {}): HanaMusicApiClient {
  return {
${clientLines.join('\n')}
  }
}
`
}

function buildSdkRegistry(identifiers: readonly string[]): string {
  const entries = buildSdkEntries(identifiers)
  const importLines = entries.map(({ identifier, importName }) => {
    return `import ${importName} from '../../modules/${identifier}.ts'`
  })
  const registryLines = entries.map(({ identifier, importName }) => {
    return `  ${identifier}: ${importName},`
  })

  return `import type { SdkModuleRegistry } from '../../types/index.ts'
${importLines.join('\n')}

export const sdkModuleRegistry = {
${registryLines.join('\n')}
} as const satisfies SdkModuleRegistry
`
}

async function buildGeneratedArtifacts(): Promise<GeneratedArtifacts> {
  const discovered = await discoverModuleFiles(MODULES_DIRECTORY)
  const sorted = discovered.toSorted((left, right) =>
    left.identifier.localeCompare(right.identifier),
  )

  const identifiers = sorted.map((moduleFile) => moduleFile.identifier)
  const routes = sorted.map((moduleFile) => [moduleFile.identifier, moduleFile.route] as const)

  const moduleSurfaceContents = `import type { LegacyModuleQuery } from '../modules.ts'
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
    files: [
      {
        contents: moduleSurfaceContents,
        path: OUTPUT_FILE,
        tempPath: TEMP_FILE,
      },
      {
        contents: buildSdkGeneratedClient(identifiers),
        path: SDK_GENERATED_FILE,
        tempPath: SDK_GENERATED_TEMP_FILE,
      },
      {
        contents: buildSdkRegistry(identifiers),
        path: SDK_REGISTRY_FILE,
        tempPath: SDK_REGISTRY_TEMP_FILE,
      },
      ...identifiers.map((identifier) => {
        const sdkApiPath = resolve(SDK_API_DIRECTORY, `${identifier}.ts`)
        return {
          contents: `export { ${toCamelCase(identifier)} } from '../generated/client.generated.ts'\n`,
          path: sdkApiPath,
        }
      }),
    ],
    moduleCount: identifiers.length,
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
  const { files, moduleCount } = await buildGeneratedArtifacts()

  for (const file of files) {
    await mkdir(dirname(file.path), {
      recursive: true,
    })
    await writeFile(file.path, file.contents)
    formatFile(file.path)
  }

  console.log(`Generated ${moduleCount} module identifiers -> ${OUTPUT_FILE}`)
}

async function checkSurface(): Promise<void> {
  const { files } = await buildGeneratedArtifacts()
  const tempFiles = files.filter((file) => file.tempPath)

  for (const file of tempFiles) {
    await mkdir(dirname(file.tempPath!), {
      recursive: true,
    })
    await writeFile(file.tempPath!, file.contents)
    formatFile(file.tempPath!)
  }

  try {
    for (const file of files) {
      const expected = file.tempPath ? await readFile(file.tempPath, 'utf8') : file.contents
      const actual = await readFile(file.path, 'utf8').catch(() => '')

      if (expected !== actual) {
        throw new Error(
          `Generated SDK surface is out of date. Run "bun run types:modules:generate" and commit ${file.path}.`,
        )
      }
    }

    console.log(`Generated module type surface is up to date -> ${OUTPUT_FILE}`)
  } finally {
    for (const file of tempFiles) {
      await rm(file.tempPath!, {
        force: true,
      })
    }
  }
}

if (process.argv.includes('--check')) {
  await checkSurface()
} else {
  await writeSurface()
}
