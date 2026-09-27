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
  dts: true,
  clean: true,
  outDir: 'dist',
  target: 'esnext',
  publint: true,
  attw: true,
})
