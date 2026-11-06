import { describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildGeneratedArtifacts } from '../../scripts/gen-module-types.mts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import { discoverModuleFiles } from '../../src/server/module-discovery.ts';
import { loadModuleDefinitions } from '../../src/server/module-loader.ts';
import {
  generatedModuleIdentifiers,
  generatedModuleRoutes,
} from '../../src/types/generated/module-surface.generated.ts';

const REAL_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/modules',
);

describe('generated module type surface', () => {
  test('rejects a discovered Effect module without a decoder', async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'hana-module-decoder-required-'),
    );
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        'export type ModuleInput = {}; const sample: ModuleEffect<ModuleInput> = () => Effect.succeed({}); export default sample',
      );
      const result = await buildGeneratedArtifacts(directory).catch(
        (error: unknown) => error,
      );
      expect(result).toBeInstanceOf(Error);
      expect(String(result)).toContain('decodeModuleInput');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  test('module domain helpers are excluded while standalone nested routes remain discoverable', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'hana-module-domain-'));
    try {
      await mkdir(resolve(directory, 'voice_upload'));
      await mkdir(resolve(directory, 'nested'));
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["**/*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'voice_upload.ts'),
        'export type ModuleInput = {}; export const decodeModuleInput = () => Effect.succeed({}); const upload: ModuleEffect<ModuleInput> = () => Effect.succeed({}); export default upload',
      );
      await writeFile(
        resolve(directory, 'voice_upload/multipart_xml.ts'),
        'export function parse() {}',
      );
      await writeFile(
        resolve(directory, 'nested/endpoint.ts'),
        'export type ModuleInput = {}; export const decodeModuleInput = () => Effect.succeed({}); const endpoint: ModuleEffect<ModuleInput> = () => Effect.succeed({}); export default endpoint',
      );
      const modules = await discoverModuleFiles(directory);
      expect(modules.map((entry) => entry.identifier).toSorted()).toEqual([
        'nested/endpoint',
        'voice_upload',
      ]);
      const generated = await buildGeneratedArtifacts(directory);
      expect(generated.moduleCount).toBe(2);
      expect(
        generated.files.every(
          (file) => !file.contents.includes('multipart_xml'),
        ),
      ).toBe(true);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
  test('rejects a discovered module without its own input contract', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'hana-module-contract-'));
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        'export default async function sample() {}',
      );
      const result = await buildGeneratedArtifacts(directory).catch(
        (error: unknown) => error,
      );
      expect(result).toBeInstanceOf(Error);
      expect(String(result)).toContain('ModuleInput');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test('rejects an input alias re-export without a local declaration', async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'hana-module-input-owner-'),
    );
    try {
      await mkdir(resolve(directory, 'sample'));
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["**/*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample/central.ts'),
        'export type SharedInput = { id: string }',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        `
        export type { SharedInput as ModuleInput } from './sample/central.ts'
        const sample: ModuleEffect<ModuleInput> = () => Effect.succeed({})
        export default sample
      `,
      );
      const result = await buildGeneratedArtifacts(directory).catch(
        (error: unknown) => error,
      );
      expect(result).toBeInstanceOf(Error);
      expect(String(result)).toContain('declare ModuleInput locally');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test('generates local input and verified body imports with Effect metadata', async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'hana-module-contract-'));
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        `
        export type ModuleInput = { id: string }
        export type ModuleBody = { title: string }
        export const decodeModuleInput = (input: unknown) => Effect.succeed(input)
        const sample: ModuleEffect<ModuleInput, ModuleBody> = () => Effect.succeed({})
        export default sample
      `,
      );
      const artifacts = await buildGeneratedArtifacts(directory);
      const surface = artifacts.files.find((file) =>
        file.path.endsWith('module-surface.generated.ts'),
      )!;
      const registry = artifacts.files.find((file) =>
        file.path.endsWith('registry.generated.ts'),
      )!;
      expect(surface.contents).toContain('ModuleInput as sampleInput');
      expect(surface.contents).toContain('ModuleBody as sampleBody');
      expect(surface.contents).toContain('input: sampleInput');
      expect(surface.contents).toContain('ModuleResponse<sampleBody>');
      expect(registry.contents).toContain("identifier: 'sample'");
      expect(registry.contents).toContain("route: '/sample'");
      expect(registry.contents).toContain('execute: sampleModule');
      expect(await buildGeneratedArtifacts(directory)).toEqual(artifacts);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

  test('places every identifier in the Effect registry', async () => {
    const generated = await buildGeneratedArtifacts(REAL_MODULES_DIRECTORY);
    expect(generated.moduleCount).toBe(352);
    const registry = generated.files.find((file) =>
      file.path.endsWith('registry.generated.ts'),
    )!;
    expect(registry.contents.match(/decodeInput: /g)).toHaveLength(352);
    const effect = Object.keys(sdkModuleRegistry);
    expect(effect).toHaveLength(352);
    expect(effect.toSorted((left, right) => left.localeCompare(right))).toEqual(
      [...generatedModuleIdentifiers],
    );
    const loaded = await loadModuleDefinitions(REAL_MODULES_DIRECTORY);
    expect(
      loaded
        .filter((definition) => 'execute' in definition)
        .map((definition) => definition.identifier)
        .toSorted((left, right) => left.localeCompare(right)),
    ).toEqual(effect);
  });

  test.each([
    {
      form: 'constant',
      declaration:
        'export const decodeModuleInput = (input: unknown) => Effect.succeed(input)',
    },
    {
      form: 'function',
      declaration:
        'export function decodeModuleInput(input: unknown) { return Effect.succeed(input) }',
    },
  ])(
    'generates local $form decoders and named legacy re-exports',
    async ({ declaration }) => {
      const directory = await mkdtemp(
        resolve(tmpdir(), 'hana-module-decoder-'),
      );
      try {
        await writeFile(
          resolve(directory, 'tsconfig.json'),
          '{"include":["*.ts"]}',
        );
        await writeFile(
          resolve(directory, 'decoded.ts'),
          `
        export type ModuleInput = { id: string }
        ${declaration}
        const decoded: ModuleEffect<ModuleInput> = () => Effect.succeed({})
        export default decoded
      `,
        );
        await writeFile(
          resolve(directory, 'plain.ts'),
          `
        export type ModuleInput = LegacyModuleInput
        export { decodeLegacyModuleInput as decodeModuleInput } from './_input.ts'
        const plain: ModuleEffect<ModuleInput> = () => Effect.succeed({})
        export default plain
      `,
        );
        const artifacts = await buildGeneratedArtifacts(directory);
        const registry = artifacts.files.find((file) =>
          file.path.endsWith('registry.generated.ts'),
        )!;
        expect(registry.contents).toContain(
          'decodeModuleInput as decodedInputDecoder',
        );
        expect(registry.contents).toContain('decodeInput: decodedInputDecoder');
        expect(registry.contents).toContain(
          'decodeModuleInput as plainInputDecoder',
        );
        expect(registry.contents).toContain(
          "plain: { identifier: 'plain', route: '/plain', execute: plainModule, decodeInput: plainInputDecoder }",
        );
        expect(await buildGeneratedArtifacts(directory)).toEqual(artifacts);
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    },
  );

  test('should stay aligned with runtime module discovery', async () => {
    const discovered = await discoverModuleFiles(REAL_MODULES_DIRECTORY);
    const identifiers = discovered
      .map((moduleFile) => moduleFile.identifier)
      .toSorted((left, right) => left.localeCompare(right));
    const routes = Object.fromEntries(
      discovered
        .map((moduleFile) => [moduleFile.identifier, moduleFile.route] as const)
        .toSorted(([left], [right]) => left.localeCompare(right)),
    );
    const generatedIdentifiers: Array<string> = [...generatedModuleIdentifiers];
    const generatedRoutes: Record<string, string> = {
      ...generatedModuleRoutes,
    };

    expect(generatedIdentifiers).toEqual(identifiers);
    expect(generatedRoutes).toEqual(routes);
  });
});
