import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface ServicePackageMetadata {
  readonly version?: string
}

const MODULE_DIRECTORY = dirname(fileURLToPath(import.meta.url))

function resolvePackageJsonPath(): string {
  let currentDirectory = MODULE_DIRECTORY

  for (let index = 0; index < 4; index += 1) {
    const packageJsonPath = resolve(currentDirectory, 'package.json')

    try {
      const packageJson = JSON.parse(
        readFileSync(packageJsonPath, 'utf8'),
      ) as ServicePackageMetadata

      if (typeof packageJson.version === 'string' && packageJson.version.length > 0) {
        return packageJsonPath
      }
    } catch {
      // Continue climbing toward the package root.
    }

    currentDirectory = resolve(currentDirectory, '..')
  }

  throw new Error(`Unable to locate package.json from ${MODULE_DIRECTORY}`)
}

const PACKAGE_JSON_PATH = resolvePackageJsonPath()

function readServiceVersion(): string {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as ServicePackageMetadata

  if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
    throw new TypeError(`Missing package version in ${PACKAGE_JSON_PATH}`)
  }

  return packageJson.version
}

export const SERVICE_VERSION = readServiceVersion()
