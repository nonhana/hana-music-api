import { describe, expect, test } from 'bun:test'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join, resolve } from 'node:path'

const ROOT = resolve(import.meta.dir, '..')
const PACKAGE_JSON_PATH = resolve(ROOT, 'package.json')
const WORKFLOWS_DIRECTORY = resolve(ROOT, '.github/workflows')
const CHANGESET_CONFIG_PATH = resolve(ROOT, '.changeset/config.json')
const TSC_CLI_PATH = resolve(ROOT, 'node_modules/typescript/bin/tsc')
const sdkPackage = readPackageJson()
const REQUIRED_ROOT_EXPORTS = [
  'createHanaMusicApi',
  'invokeModule',
  'createRequest',
  'createOption',
]
const REPRESENTATIVE_CAMEL_CASE_EXPORTS = ['search', 'songUrl']
const FORBIDDEN_ROOT_EXPORTS = [
  'startServer',
  'serveNcmApi',
  'createServer',
  'ensureAnonymousToken',
  'generateConfig',
  'registerAnonymous',
  'createModuleApi',
  'loadProgrammaticApi',
  'NeteaseCloudMusicApi',
]
const EXPECTED_EXPORT_PATHS = ['.']

describe('sdk release contract', () => {
  test('should expose only the root package entrypoint as the public ESM boundary', () => {
    const exportMap = sdkPackage.exports ?? {}

    expect(sdkPackage.name).toBe('hana-music-api')
    expect(sdkPackage.private).toBe(false)
    expect(sdkPackage.type).toBe('module')
    expect(sdkPackage.sideEffects).toBe(false)
    expect(Object.keys(exportMap).toSorted()).toEqual(EXPECTED_EXPORT_PATHS)
    expect(exportMap['.']).toEqual({
      types: './dist/index.d.ts',
      default: './dist/index.js',
    })
  })

  test('should keep the root runtime surface inside the frozen allowlist/denylist contract', async () => {
    const entry = (await import('../index.ts')) as Record<string, unknown>

    for (const exportName of REQUIRED_ROOT_EXPORTS) {
      expect(entry).toHaveProperty(exportName)
    }

    for (const exportName of REPRESENTATIVE_CAMEL_CASE_EXPORTS) {
      expect(entry).toHaveProperty(exportName)
    }

    for (const exportName of FORBIDDEN_ROOT_EXPORTS) {
      expect(entry).not.toHaveProperty(exportName)
    }
  })

  test('should provide release governance files with changesets and trusted publishing guardrails', () => {
    expect(() => readFileSync(CHANGESET_CONFIG_PATH, 'utf8')).not.toThrow()

    const workflows = readdirSync(WORKFLOWS_DIRECTORY)
      .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
      .map((file) => readFileSync(resolve(WORKFLOWS_DIRECTORY, file), 'utf8'))

    expect(workflows.length).toBeGreaterThan(0)
    expect(workflows.some((workflow) => workflow.includes('changesets'))).toBe(true)
    expect(workflows.some((workflow) => workflow.includes('id-token: write'))).toBe(true)
    expect(workflows.some((workflow) => workflow.includes('22.14.0'))).toBe(true)
    expect(workflows.some((workflow) => workflow.includes('11.5.1'))).toBe(true)
  })

  test('should pack a consumer-safe tarball and allow only approved runtime imports', () => {
    ensureBuiltArtifacts()

    const packResult = run(['npm', 'pack', '--json'], ROOT)
    expect(packResult.exitCode).toBe(0)

    const packEntries = JSON.parse(packResult.stdout) as Array<{
      files?: Array<{ path: string }>
      filename: string
    }>
    const [{ filename, files = [] } = { filename: '', files: [] }] = packEntries
    const filePaths = files.map((file) => file.path)

    expect(filename.length).toBeGreaterThan(0)
    expect(filePaths).toContain('dist/index.d.ts')
    expect(filePaths).toContain('dist/index.js')
    expect(filePaths.some((file) => file.startsWith('docs/'))).toBe(false)
    expect(filePaths.some((file) => file.startsWith('src/server/'))).toBe(false)
    expect(filePaths.some((file) => file.startsWith('src/demo/'))).toBe(false)

    const consumerDirectory = mkdtempSync(join(tmpdir(), 'hana-music-api-sdk-consumer-'))
    const tarballPath = resolve(ROOT, filename)

    try {
      writeFileSync(
        resolve(consumerDirectory, 'package.json'),
        JSON.stringify(
          {
            name: 'hana-music-api-sdk-consumer-fixture',
            private: true,
            type: 'module',
          },
          null,
          2,
        ),
      )

      const installResult = run(
        ['npm', 'install', '--no-package-lock', tarballPath],
        consumerDirectory,
      )
      expect(installResult.exitCode).toBe(0)

      const smokeScriptPath = resolve(consumerDirectory, 'smoke.mjs')
      writeFileSync(
        smokeScriptPath,
        [
          "import { createHanaMusicApi, invokeModule, search, songUrl } from 'hana-music-api'",
          '',
          'const fetcher = async () => {',
          '  return new Response(JSON.stringify({ code: 200, result: { songs: [] }, data: [] }), {',
          "    headers: { 'content-type': 'application/json' },",
          '  })',
          '}',
          '',
          "if (typeof createHanaMusicApi !== 'function') throw new Error('missing createHanaMusicApi')",
          "if (typeof invokeModule !== 'function') throw new Error('missing invokeModule')",
          "if (typeof search !== 'function') throw new Error('missing root search export')",
          "if (typeof songUrl !== 'function') throw new Error('missing root songUrl export')",
          'const client = createHanaMusicApi({ fetcher })',
          "const clientSearchResult = await client.search({ keywords: 'demo' })",
          "const rawSearchResult = await search({ keywords: 'demo' }, { fetcher })",
          "const invokedSearchResult = await invokeModule('search', { keywords: 'demo' }, { fetcher })",
          "if (clientSearchResult.status !== 200) throw new Error('client search call failed')",
          "if (rawSearchResult.status !== 200) throw new Error('raw search call failed')",
          "if (invokedSearchResult.status !== 200) throw new Error('invokeModule search call failed')",
        ].join('\n'),
      )

      const smokeResult = run(['node', smokeScriptPath], consumerDirectory)
      expect(smokeResult.exitCode).toBe(0)

      const negativeImportScriptPath = resolve(consumerDirectory, 'negative-import.mjs')
      writeFileSync(
        negativeImportScriptPath,
        [
          "const blockedSpecifiers = ['hana-music-api/api/search', 'hana-music-api/src/app/cli.ts']",
          'for (const specifier of blockedSpecifiers) {',
          '  let failedAsExpected = false',
          '  try {',
          '    await import(specifier)',
          '  } catch {',
          '    failedAsExpected = true',
          '  }',
          '  if (!failedAsExpected) throw new Error(`blocked import unexpectedly resolved: ${specifier}`)',
          '}',
        ].join('\n'),
      )

      const negativeImportResult = run(['node', negativeImportScriptPath], consumerDirectory)
      expect(negativeImportResult.exitCode).toBe(0)

      const typesFixturePath = resolve(consumerDirectory, 'types-fixture.ts')
      writeFileSync(
        typesFixturePath,
        [
          "import { createHanaMusicApi, songUrl, type CreateHanaMusicApiConfig, type ModuleResponseOf } from 'hana-music-api'",
          '',
          'const config: CreateHanaMusicApiConfig = {',
          "  cookie: 'MUSIC_U=consumer',",
          '}',
          '',
          'const api = createHanaMusicApi(config)',
          "const resultPromise: Promise<ModuleResponseOf<'song_url'>> = api.songUrl({ id: '1,2' })",
          "const rawResultPromise: Promise<ModuleResponseOf<'song_url'>> = songUrl({ id: '1,2' }, config)",
          'void resultPromise',
          'void rawResultPromise',
        ].join('\n'),
      )

      writeFileSync(
        resolve(consumerDirectory, 'tsconfig.json'),
        JSON.stringify(
          {
            compilerOptions: {
              module: 'NodeNext',
              moduleResolution: 'NodeNext',
              noEmit: true,
              strict: true,
              skipLibCheck: true,
              target: 'ES2022',
              types: [],
            },
            include: ['types-fixture.ts'],
          },
          null,
          2,
        ),
      )

      const nodeOnlyTypecheckResult = run(
        ['node', TSC_CLI_PATH, '--project', resolve(consumerDirectory, 'tsconfig.json')],
        consumerDirectory,
      )
      expect(nodeOnlyTypecheckResult.exitCode).toBe(0)
    } finally {
      rmSync(consumerDirectory, { force: true, recursive: true })
      if (filename.length > 0) {
        rmSync(resolve(ROOT, basename(filename)), { force: true })
      }
    }
  }, 30_000)
})

function readPackageJson(): PackageJsonLike {
  return JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as PackageJsonLike
}

function ensureBuiltArtifacts(): void {
  const buildOutputPath = resolve(ROOT, 'dist/index.js')

  try {
    readFileSync(buildOutputPath, 'utf8')
    return
  } catch {}

  const buildResult = run(['bun', 'run', 'build'], ROOT)
  expect(buildResult.exitCode).toBe(0)
}

function run(cmd: string[], cwd: string) {
  const result = Bun.spawnSync({
    cmd,
    cwd,
    env: process.env,
    stderr: 'pipe',
    stdout: 'pipe',
  })

  return {
    exitCode: result.exitCode,
    stderr: Buffer.from(result.stderr).toString('utf8'),
    stdout: Buffer.from(result.stdout).toString('utf8'),
  }
}

type PackageJsonLike = {
  exports?: Record<string, unknown>
  name?: string
  private?: boolean
  sideEffects?: boolean
  type?: string
}
