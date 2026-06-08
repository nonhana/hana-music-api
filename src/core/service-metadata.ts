import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

interface ServicePackageMetadata {
  readonly version?: string
}

const PACKAGE_JSON_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '../../package.json')

function readServiceVersion(): string {
  const packageJson = JSON.parse(readFileSync(PACKAGE_JSON_PATH, 'utf8')) as ServicePackageMetadata

  if (typeof packageJson.version !== 'string' || packageJson.version.length === 0) {
    throw new TypeError(`Missing package version in ${PACKAGE_JSON_PATH}`)
  }

  return packageJson.version
}

export const SERVICE_VERSION = readServiceVersion()
