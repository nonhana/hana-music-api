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
          // registry 条目按 identifier 与模块一一对应，execute 引用相同即同一模块；
          // ModuleDefinition 的 Input 逆变无法结构化证明，此处信任生成物类型。
          return definition as ModuleDefinition;
        }
      }

      const execute = imported.default;
      const decodeInput = imported.decodeModuleInput;
      if (!isModuleEffect(execute)) {
        throw new TypeError(
          `Module "${filePath}" default export is not a ModuleEffect`,
        );
      }
      if (!isDecodeInput(decodeInput)) {
        throw new TypeError(
          `Module "${filePath}" decodeModuleInput is not a decoder`,
        );
      }

      return {
        identifier,
        execute,
        decodeInput,
        route,
      } satisfies ModuleDefinition;
    }),
  );

  return modules;
};

const isModuleImport = (
  value: unknown,
): value is {
  readonly default: unknown;
  readonly decodeModuleInput?: unknown;
} =>
  typeof value === 'object' &&
  value !== null &&
  'default' in value &&
  typeof value.default === 'function';

/** 运行时能校验的合同下限：返回 Effect 值的二元函数。 */
const isModuleEffect = (value: unknown): value is ModuleDefinition['execute'] =>
  typeof value === 'function' && value.length >= 1;

const isDecodeInput = (
  value: unknown,
): value is ModuleDefinition['decodeInput'] => typeof value === 'function';
