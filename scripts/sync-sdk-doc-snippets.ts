import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

const DOCS_API_DIRECTORY = resolve(import.meta.dir, '../docs/api')
const CHECK_MODE = process.argv.includes('--check')

function toCamelCase(identifier: string): string {
  return identifier.replaceAll(/[/_-]+([a-zA-Z0-9])/g, (_match, char: string) => {
    return char.toUpperCase()
  })
}

async function collectMarkdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const targetPath = join(directory, entry.name)
      if (entry.isDirectory()) {
        return collectMarkdownFiles(targetPath)
      }

      return entry.isFile() && entry.name.endsWith('.md') ? [targetPath] : []
    }),
  )

  return files.flat()
}

function updateProgrammaticSnippet(source: string): string {
  const moduleMatch = source.match(/\|\s*对应模块\s*\|\s*`([^`]+)`\s*\|/u)
  if (!moduleMatch) {
    return source
  }

  const moduleIdentifier = moduleMatch[1]!
  const functionName = toCamelCase(moduleIdentifier)
  const blockPattern =
    /## 编程式调用\s+```ts\s+import \{ createModuleApi \} from 'hana-music-api'\s+\s*const api = createModuleApi\(\)\s+\s*const result = await api\.([a-zA-Z0-9_]+)\(/u

  if (!blockPattern.test(source)) {
    return source
  }

  return source
    .replace(
      /## 编程式调用\s+```ts\s+import \{ createModuleApi \} from 'hana-music-api'\s+\s*const api = createModuleApi\(\)\s+/u,
      `## 编程式调用\n\n\`\`\`ts\nimport { ${functionName} } from 'hana-music-api'\n\n`,
    )
    .replace(new RegExp(`api\\.${moduleIdentifier}\\(`, 'u'), `${functionName}(`)
}

async function main(): Promise<void> {
  const files = await collectMarkdownFiles(DOCS_API_DIRECTORY)
  const changedFiles: string[] = []

  for (const file of files) {
    const original = await readFile(file, 'utf8')
    const updated = updateProgrammaticSnippet(original)

    if (updated !== original) {
      changedFiles.push(relative(resolve(import.meta.dir, '..'), file))
      if (!CHECK_MODE) {
        await writeFile(file, updated)
      }
    }
  }

  if (changedFiles.length > 0) {
    if (CHECK_MODE) {
      throw new Error(
        `SDK doc snippets are out of sync in:\n${changedFiles.map((file) => `- ${file}`).join('\n')}`,
      )
    }

    console.log(`Updated SDK doc snippets in ${changedFiles.length} files.`)
    return
  }

  console.log('SDK doc snippets are in sync.')
}

await main()
