import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { sdkModuleRegistry } from '../sdk/generated/registry.generated.ts';
import type { ModuleDefinition } from '../types/index.ts';
import { discoverModuleFiles } from './module-discovery.ts';

export { parseModuleRoute } from './module-discovery.ts';

export type LoadedModuleDefinition = ModuleDefinition;

export const loadModuleDefinitions = async (
  modulesDirectory = resolve(
    dirname(fileURLToPath(import.meta.url)),
    '../modules',
  ),
): Promise<Array<LoadedModuleDefinition>> => {
  const moduleFiles = await discoverModuleFiles(modulesDirectory);
  const modules = await Promise.all(
    moduleFiles.map(async ({ filePath, identifier, route }) => {
      const imported: unknown = await import(pathToFileURL(filePath).href);

      if (!isModuleImport(imported)) {
        throw new TypeError(
          `Module "${filePath}" must export a default function`,
        );
      }
      if (
        !('decodeModuleInput' in imported) ||
        typeof imported.decodeModuleInput !== 'function'
      ) {
        throw new TypeError(
          `Module "${filePath}" must export decodeModuleInput`,
        );
      }

      if (Object.hasOwn(sdkModuleRegistry, identifier)) {
        const definition =
          sdkModuleRegistry[identifier as keyof typeof sdkModuleRegistry];
        if (imported.default === definition.execute) {
          return definition as ModuleDefinition;
        }
      }

      return {
        identifier,
        execute: imported.default as ModuleDefinition['execute'],
        decodeInput:
          imported.decodeModuleInput as ModuleDefinition['decodeInput'],
        route,
      } satisfies ModuleDefinition;
    }),
  );

  return modules;
};

const isModuleImport = (
  value: unknown,
): value is { readonly default: (...args: Array<never>) => unknown } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'default' in value &&
    typeof value.default === 'function'
  );
};
