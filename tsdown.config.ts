import { defineConfig } from 'tsdown'

import { generatedModuleIdentifiers } from './src/types/generated/module-surface.generated.ts'

const apiEntries = Object.fromEntries(
  generatedModuleIdentifiers.map((identifier) => {
    return [`api/${identifier}`, `./src/sdk/api/${identifier}.ts`]
  }),
)

export default defineConfig({
  entry: {
    index: './index.ts',
    ...apiEntries,
  },
  format: ['esm'],
  external: ['bun'],
  fixedExtension: false,
  platform: 'node',
  target: 'esnext',
  dts: true,
  clean: true,
  outDir: 'dist',
  publint: true,
  attw: true,
})
