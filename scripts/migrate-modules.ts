import { access, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, resolve } from 'node:path'

const WORKSPACE_ROOT = resolve(import.meta.dir, '..')
const LEGACY_REPO_ROOT = resolve(WORKSPACE_ROOT, '..', 'netease-music-api')
const LEGACY_MODULES_DIRECTORY = resolve(LEGACY_REPO_ROOT, 'module')
const LEGACY_PLUGINS_DIRECTORY = resolve(LEGACY_REPO_ROOT, 'plugins')
const OUTPUT_MODULES_DIRECTORY = resolve(WORKSPACE_ROOT, 'src', 'modules')
const OUTPUT_PLUGINS_DIRECTORY = resolve(WORKSPACE_ROOT, 'src', 'plugins')
const PACKAGE_JSON_PATH = resolve(WORKSPACE_ROOT, 'package.json')
const MODULE_MIGRATION_IMPORT =
  "import { normalizeLegacyModuleError, normalizeLegacyModuleResponse } from './_migration.ts'"
const MODULE_TYPE_IMPORTS = `import type { ModuleRequest, NcmApiResponse } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'`
const PLUGIN_TYPE_IMPORTS = `import type { ModuleRequest } from '../types/index.ts'
import type { LegacyModuleQuery } from '../types/modules.ts'`
const AUTO_GENERATED_HEADER = `// 此文件由 \`scripts/migrate-modules.ts\` 自动生成。
// 它的职责是保留旧模块行为，并以最小类型边界为后续人工收敛留出空间。
`
const AUTO_GENERATED_PLUGIN_HEADER = `// 此文件由 \`scripts/migrate-modules.ts\` 自动生成，作为兼容支撑插件模板。
`

interface PackageManifest {
  readonly version?: string
}

interface GeneratedArtifact {
  readonly outputPath: string
  readonly source: string
}

async function main(): Promise<void> {
  const forceRegeneration = Bun.argv.includes('--force')
  const packageJson = await readPackageJson()
  const legacyModuleFiles = await collectFiles(LEGACY_MODULES_DIRECTORY, '.js')
  const legacyPluginFiles = await collectFiles(LEGACY_PLUGINS_DIRECTORY, '.js')

  await mkdir(OUTPUT_MODULES_DIRECTORY, {
    recursive: true,
  })
  await mkdir(OUTPUT_PLUGINS_DIRECTORY, {
    recursive: true,
  })

  if (forceRegeneration) {
    await cleanupGeneratedModuleFiles()
  }

  const generatedModules = await Promise.all(
    legacyModuleFiles.map((filePath) => {
      return createGeneratedModuleArtifact(filePath, packageJson.version ?? '0.0.0')
    }),
  )
  const generatedPlugins = await Promise.all(
    legacyPluginFiles
      .filter((filePath) => {
        const fileName = basename(filePath)
        return fileName === 'upload.js' || fileName === 'songUpload.js'
      })
      .map((filePath) => createGeneratedPluginArtifact(filePath)),
  )

  const writeResults = await Promise.all(
    [...generatedModules, ...generatedPlugins].map((artifact) =>
      writeGeneratedArtifact(artifact, forceRegeneration),
    ),
  )
  const writtenCount = writeResults.filter(Boolean).length
  const skippedCount = writeResults.length - writtenCount

  console.log(
    [
      `Migrated ${writtenCount} artifacts`,
      skippedCount > 0 ? `skipped ${skippedCount} existing artifacts` : null,
      forceRegeneration ? '(forced regeneration enabled)' : '(safe mode)',
    ]
      .filter(Boolean)
      .join(', '),
  )
}

async function readPackageJson(): Promise<PackageManifest> {
  const text = await readFile(PACKAGE_JSON_PATH, 'utf8')
  return JSON.parse(text) as PackageManifest
}

async function collectFiles(directory: string, extension: string): Promise<string[]> {
  const entries = await readdir(directory, {
    withFileTypes: true,
  })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = resolve(directory, entry.name)
      if (entry.isDirectory()) {
        return collectFiles(absolutePath, extension)
      }

      if (entry.isFile() && extname(entry.name) === extension) {
        return [absolutePath]
      }

      return []
    }),
  )

  return files.flat().toSorted((left, right) => left.localeCompare(right))
}

async function cleanupGeneratedModuleFiles(): Promise<void> {
  const moduleEntries = await readdir(OUTPUT_MODULES_DIRECTORY, {
    withFileTypes: true,
  })

  await Promise.all(
    moduleEntries.map(async (entry) => {
      const absolutePath = resolve(OUTPUT_MODULES_DIRECTORY, entry.name)
      if (entry.isDirectory()) {
        await rm(absolutePath, {
          force: true,
          recursive: true,
        })
        return
      }

      if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.startsWith('_')) {
        await rm(absolutePath, {
          force: true,
        })
      }
    }),
  )

  const pluginEntries = await readdir(OUTPUT_PLUGINS_DIRECTORY, {
    withFileTypes: true,
  })

  await Promise.all(
    pluginEntries.map(async (entry) => {
      const absolutePath = resolve(OUTPUT_PLUGINS_DIRECTORY, entry.name)
      if (entry.isDirectory()) {
        return
      }

      if (entry.isFile() && entry.name.endsWith('.ts')) {
        await rm(absolutePath, {
          force: true,
        })
      }
    }),
  )
}

async function writeGeneratedArtifact(
  artifact: GeneratedArtifact,
  forceRegeneration: boolean,
): Promise<boolean> {
  if (!forceRegeneration && (await pathExists(artifact.outputPath))) {
    return false
  }

  await mkdir(dirname(artifact.outputPath), {
    recursive: true,
  })
  await writeFile(artifact.outputPath, artifact.source, 'utf8')

  return true
}

async function createGeneratedModuleArtifact(
  filePath: string,
  packageVersion: string,
): Promise<GeneratedArtifact> {
  const source = await readFile(filePath, 'utf8')
  return {
    outputPath: resolve(OUTPUT_MODULES_DIRECTORY, `${basename(filePath, '.js')}.ts`),
    source: transformLegacyModuleSource(source, basename(filePath), packageVersion),
  }
}

async function createGeneratedPluginArtifact(filePath: string): Promise<GeneratedArtifact> {
  const source = await readFile(filePath, 'utf8')
  const normalizedFileName = normalizePluginFileName(basename(filePath, '.js'))
  return {
    outputPath: resolve(OUTPUT_PLUGINS_DIRECTORY, `${normalizedFileName}.ts`),
    source: transformLegacyPluginSource(source, normalizedFileName),
  }
}

function transformLegacyModuleSource(
  originalSource: string,
  fileName: string,
  packageVersion: string,
): string {
  let transformed = originalSource.replaceAll('\r\n', '\n')

  transformed = applyCommonReplacements(transformed, {
    isPlugin: false,
    packageVersion,
  })

  transformed = transformed.replace(/module\.exports\s*=\s*/u, `const legacyModule = `)
  transformed = annotateLegacyFunctionParameters(transformed, 'legacyModule')

  transformed = transformed.trimEnd()

  return `${AUTO_GENERATED_HEADER}
${MODULE_TYPE_IMPORTS}
${MODULE_MIGRATION_IMPORT}
${transformed}

export default async function migrated${toPascalCase(fileName)}(
  query: LegacyModuleQuery,
  request: ModuleRequest,
): Promise<NcmApiResponse> {
  try {
    return normalizeLegacyModuleResponse(await legacyModule(query, request))
  } catch (error) {
    throw normalizeLegacyModuleError(error)
  }
}
`
}

function transformLegacyPluginSource(originalSource: string, fileName: string): string {
  let transformed = originalSource.replaceAll('\r\n', '\n')

  transformed = applyCommonReplacements(transformed, {
    isPlugin: true,
    packageVersion: '0.0.0',
  })

  transformed = transformed.replace(/module\.exports\s*=\s*/u, 'const legacyPlugin = ')
  transformed = annotateLegacyFunctionParameters(transformed, 'legacyPlugin')
  transformed = transformed.trimEnd()

  return `${AUTO_GENERATED_PLUGIN_HEADER}
${PLUGIN_TYPE_IMPORTS}
${transformed}

export default function migrated${toPascalCase(fileName)}Plugin(
  query: LegacyModuleQuery,
  request: ModuleRequest,
) {
  return legacyPlugin(query, request)
}
`
}

function applyCommonReplacements(
  source: string,
  context: {
    readonly isPlugin: boolean
    readonly packageVersion: string
  },
): string {
  let transformed = source

  transformed = transformed.replace(
    /^const createOption = require\('\.\.\/util\/option\.js'\)\n/gmu,
    `import { createOption } from '../core/options.ts'\n`,
  )
  transformed = transformed.replace(
    /^const \{([^}]+)\} = require\('\.\.\/util\/index'\)\n/gmu,
    (_match, imports: string) => {
      return `import {${imports}} from '../core/utils.ts'\n`
    },
  )
  transformed = transformed.replace(
    /^const \{([^}]+)\} = require\('\.\.\/util'\)\n/gmu,
    (_match, imports: string) => {
      return `import {${imports}} from '../core/utils.ts'\n`
    },
  )
  transformed = transformed.replace(
    /^const \{([^}]+)\} = require\('\.\.\/util\/crypto'\)\n/gmu,
    (_match, imports: string) => {
      return `import {${imports}} from '../core/crypto.ts'\n`
    },
  )
  transformed = transformed.replace(
    /^const \{ resourceTypeMap \} = require\('\.\.\/util\/config\.json'\)\n/gmu,
    `import { RESOURCE_TYPE_MAP as resourceTypeMap } from '../core/config.ts'\n`,
  )
  transformed = transformed.replace(
    /^const \{ APP_CONF \} = require\('\.\.\/util\/config\.json'\)\n/gmu,
    `import { APP_CONF } from '../core/config.ts'\n`,
  )
  transformed = transformed.replace(
    /^const \{ default: axios \} = require\('axios'\)\n/gmu,
    `import axios from 'axios'\n`,
  )
  transformed = transformed.replace(
    /^var xml2js = require\('xml2js'\)\n/gmu,
    `import * as xml2js from 'xml2js'\n`,
  )
  transformed = transformed.replace(
    /^const QRCode = require\('qrcode'\)\n/gmu,
    `import * as QRCode from 'qrcode'\n`,
  )
  transformed = transformed.replace(
    /^const CryptoJS = require\('crypto-js'\)\n/gmu,
    `import * as CryptoJS from 'crypto-js'\n`,
  )
  transformed = transformed.replace(
    /^const mm = require\('music-metadata'\)\n/gmu,
    `import * as mm from 'music-metadata'\n`,
  )
  transformed = transformed.replace(/^const md5 = require\('md5'\)\n/gmu, `import md5 from 'md5'\n`)
  transformed = transformed.replace(
    /^const path = require\('path'\)\n/gmu,
    `import * as path from 'node:path'\n`,
  )
  transformed = transformed.replace(
    /^const fs = require\('fs'\)\n/gmu,
    `import * as fs from 'node:fs'\n`,
  )
  transformed = transformed.replace(
    /^const pkg = require\('\.\.\/package\.json'\)\n/gmu,
    `const pkg = { version: '${context.packageVersion}' }\n`,
  )

  if (!context.isPlugin) {
    transformed = transformed.replace(
      /^const uploadPlugin = require\('\.\.\/plugins\/upload'\)\n/gmu,
      `import uploadPlugin from '../plugins/upload.ts'\n`,
    )
    transformed = transformed.replace(
      /^const uploadPlugin = require\('\.\.\/plugins\/songUpload'\)\n/gmu,
      `import uploadPlugin from '../plugins/song-upload.ts'\n`,
    )
  }

  transformed = transformed.replace(
    /global\.deviceId\s*=\s*deviceId/gu,
    `setRuntimeState({ deviceId })`,
  )

  if (transformed.includes('setRuntimeState({ deviceId })')) {
    transformed = `import { setRuntimeState } from '../core/runtime.ts'\n${transformed}`
  }

  return transformed
}

function normalizePluginFileName(fileName: string): string {
  if (fileName === 'songUpload') {
    return 'song-upload'
  }

  return fileName
}

function annotateLegacyFunctionParameters(source: string, bindingName: string): string {
  const patterns: readonly [RegExp, string][] = [
    [
      new RegExp(`const ${bindingName} = async \\(query, request\\) =>`, 'u'),
      `const ${bindingName} = async (query: LegacyModuleQuery, request: ModuleRequest) =>`,
    ],
    [
      new RegExp(`const ${bindingName} = \\(query, request\\) =>`, 'u'),
      `const ${bindingName} = (query: LegacyModuleQuery, request: ModuleRequest) =>`,
    ],
    [
      new RegExp(`const ${bindingName} = async function\\s*\\(query, request\\)`, 'u'),
      `const ${bindingName} = async function (query: LegacyModuleQuery, request: ModuleRequest)`,
    ],
    [
      new RegExp(`const ${bindingName} = function\\s*\\(query, request\\)`, 'u'),
      `const ${bindingName} = function (query: LegacyModuleQuery, request: ModuleRequest)`,
    ],
  ]

  let transformed = source

  for (const [pattern, replacement] of patterns) {
    transformed = transformed.replace(pattern, replacement)
  }

  return transformed
}

function toPascalCase(fileName: string): string {
  return basename(fileName, extname(fileName))
    .split(/[_-]/u)
    .filter(Boolean)
    .map((segment) => segment.slice(0, 1).toUpperCase() + segment.slice(1))
    .join('')
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

await main()
