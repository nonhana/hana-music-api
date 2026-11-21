import { readFileSync } from 'node:fs';

import { defineConfig } from 'tsdown';

import {
  generatedModuleIdentifiers,
  generatedSchemaIdentifiers,
} from './src/types/generated/module-surface.generated.ts';

const packageJson = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { readonly version: string };

const apiEntries = Object.fromEntries(
  generatedModuleIdentifiers.map((identifier) => [
    `api/${identifier}`,
    `./src/sdk/api/${identifier}.ts`,
  ]),
);

const schemaEntries = Object.fromEntries(
  generatedSchemaIdentifiers.map((identifier) => [
    `schemas/${identifier}`,
    `./src/sdk/schemas/${identifier}.ts`,
  ]),
);

export default defineConfig({
  entry: {
    index: './index.ts',
    core: './src/sdk/core.ts',
    utils: './src/sdk/utils.ts',
    schemas: './src/sdk/schemas.ts',
    ...apiEntries,
    ...schemaEntries,
  },
  unbundle: true,
  format: ['esm'],
  tsconfig: './tsconfig.json',
  define: {
    __HANA_SERVICE_VERSION__: JSON.stringify(packageJson.version),
  },
  deps: {
    neverBundle: ['bun', 'effect'],
  },
  fixedExtension: false,
  platform: 'node',
  target: 'esnext',
  dts: true,
  clean: true,
  outDir: 'dist',
  // 整包检查在最后的浏览器构建阶段执行，此时所有公开入口的产物才齐全。
  publint: false,
  attw: false,
});
