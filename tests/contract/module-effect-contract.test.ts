import { describe, expect, test } from 'bun:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { Effect } from 'effect';

import { createHanaMusicApi } from '../../index.ts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import { discoverModuleFiles } from '../../src/server/module-discovery.ts';
import { loadModuleDefinitions } from '../../src/server/module-loader.ts';

const modulesDirectory = resolve(import.meta.dir, '../../src/modules');

describe('complete Effect module contract', () => {
  test('every discovered default constructs lazy Effect work', async () => {
    const modules = await discoverModuleFiles(modulesDirectory);
    const failures: Array<string> = [];
    for (const module of modules) {
      const imported = await import(pathToFileURL(module.filePath).href);
      const result: unknown = imported.default({}, () =>
        Effect.die('request must stay lazy'),
      );
      if (result instanceof Promise) {
        void result.catch(() => undefined);
      }
      if (!Effect.isEffect(result)) {
        failures.push(module.identifier);
      }
    }
    expect(failures).toEqual([]);
    expect(modules).toHaveLength(351);
  });

  test('modules cannot reintroduce Promise adapters or direct transport', async () => {
    const failures: Array<string> = [];
    for (const module of await discoverModuleFiles(modulesDirectory)) {
      const source = await readFile(module.filePath, 'utf8');
      if (
        /\b(?:ModuleRequest|RawRequest|NcmApiResponse|legacyModule|normalizeLegacyModuleResponse|normalizeLegacyModuleError|createRawRequest)\b|_migration\.ts|export default async|\bfetch\(/.test(
          source,
        )
      ) {
        failures.push(module.identifier);
      }
      expect(source).toMatch(/ModuleEffect<ModuleInput/);
    }
    expect(failures).toEqual([]);
  });

  test('loader and SDK expose all 351 Effect implementations', async () => {
    const loaded = await loadModuleDefinitions(modulesDirectory);
    const identifiers = loaded.map((module) => module.identifier).toSorted();
    expect(loaded.every((module) => 'execute' in module)).toBe(true);
    expect(Object.keys(sdkModuleRegistry).toSorted()).toEqual(identifiers);
    expect(Object.keys(sdkModuleRegistry)).toHaveLength(351);
    expect(Object.keys(createHanaMusicApi())).toHaveLength(351);
    const generatedClient = await readFile(
      resolve(import.meta.dir, '../../src/sdk/generated/client.generated.ts'),
      'utf8',
    );
    expect(generatedClient).not.toMatch(
      /legacySdkModuleRegistry|createLegacyModuleInvoker/,
    );
  });
});
