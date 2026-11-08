import { describe, expect, test } from 'bun:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildGeneratedArtifacts } from '../../../scripts/gen-module-types.mts';
import { sdkModuleRegistry } from '../../../src/sdk/generated/registry.generated.ts';
import { discoverModuleFiles } from '../../../src/server/module-discovery.ts';
import { loadModuleDefinitions } from '../../../src/server/module-loader.ts';
import {
  generatedActionModuleIdentifiers,
  generatedModuleIdentifiers,
  generatedModuleRoutes,
  generatedPendingActionModuleIdentifiers,
} from '../../../src/types/generated/module-surface.generated.ts';
import accountSocial from '../../fixtures/requests/account-social.json';
import libraryPlayback from '../../fixtures/requests/library-playback.json';
import membershipBusiness from '../../fixtures/requests/membership-business.json';
import podcastVideo from '../../fixtures/requests/podcast-video.json';
import searchDiscovery from '../../fixtures/requests/search-discovery.json';
import specialChains from '../../fixtures/requests/special-chains.json';

const REAL_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../src/modules',
);

describe('generated module type surface', () => {
  test('tracks declared and pending actions consistently across SDK and HTTP discovery', async () => {
    const loaded = await loadModuleDefinitions(REAL_MODULES_DIRECTORY);
    const declared = loaded
      .filter((definition) => definition.actions !== undefined)
      .map((definition) => definition.identifier)
      .toSorted();
    expect(declared).toEqual(
      [
        ...new Set(
          [
            ...libraryPlayback.cases,
            ...searchDiscovery.cases,
            ...accountSocial.cases,
            ...podcastVideo.cases,
            ...membershipBusiness.cases,
            ...specialChains.cases,
          ].map((entry) => entry.module),
        ),
        'album_sub',
        'artist_sub',
        'lyric',
        'playlist_detail',
        'playlist_subscribe',
        'search',
        'song_detail',
      ].toSorted(),
    );
    for (const entry of libraryPlayback.cases.filter(
      (candidate) => candidate.label === 'default',
    )) {
      const definition = loaded.find(
        (candidate) => candidate.identifier === entry.module,
      )!;
      expect(Object.keys(definition.actions!)).not.toHaveLength(0);
      for (const action of Object.values(definition.actions!)) {
        expect(action).toMatchObject({
          profile: entry.profile === 'weapiPc' ? 'web' : entry.profile,
          semantic: entry.semantic,
          cache: 'none',
          retry: entry.retry,
        });
      }
    }
    for (const entry of searchDiscovery.cases) {
      const definition = loaded.find(
        (candidate) => candidate.identifier === entry.module,
      )!;
      const action =
        definition.actions![
          entry.module === 'search_suggest'
            ? entry.query.type === 'mobile'
              ? 'mobile'
              : 'web'
            : entry.semantic === 'write'
              ? 'write'
              : 'read'
        ];
      expect(action as unknown).toEqual({
        profile: entry.profile === 'weapiPc' ? 'web' : entry.profile,
        target: entry.path,
        semantic: entry.semantic,
        cache: 'none',
        retry: entry.retry,
      });
    }
    const accountModules = new Set(
      accountSocial.cases.map((entry) => entry.module),
    );
    expect(
      loaded
        .filter((definition) => accountModules.has(definition.identifier))
        .reduce(
          (count, definition) =>
            count + Object.keys(definition.actions!).length,
          0,
        ),
    ).toBe(89);
    for (const entry of accountSocial.cases) {
      const definition = loaded.find(
        (candidate) => candidate.identifier === entry.module,
      )!;
      const query = entry.query as Record<string, unknown>;
      const actionName =
        entry.module === 'comment'
          ? ({ 0: 'delete', 1: 'add', 2: 'reply' } as Record<number, string>)[
              Number(query.t)
            ]!
          : ['comment_like', 'resource_like'].includes(entry.module)
            ? Number(query.t) === 1
              ? 'like'
              : 'unlike'
            : entry.module === 'follow'
              ? Number(query.t) === 1
                ? 'follow'
                : 'delfollow'
              : entry.module === 'login_cellphone'
                ? query.captcha
                  ? 'captcha'
                  : 'password'
                : entry.module === 'login'
                  ? 'password'
                  : 'request';
      const action = definition.actions![actionName]!;
      expect(action).toMatchObject({
        profile: entry.profile === 'weapiPc' ? 'web' : entry.profile,
        semantic: entry.semantic,
        cache: 'none',
        retry: entry.retry,
      });
      expect(
        typeof action.target === 'string'
          ? action.target === entry.path
          : entry.path.startsWith(action.target.prefix),
      ).toBe(true);
    }
    const contentModules = new Set(
      podcastVideo.cases.map((entry) => entry.module),
    );
    expect(
      loaded
        .filter((definition) => contentModules.has(definition.identifier))
        .reduce(
          (count, definition) =>
            count + Object.keys(definition.actions!).length,
          0,
        ),
    ).toBe(71);
    for (const entry of podcastVideo.cases.filter(
      (candidate) => candidate.label === 'default',
    )) {
      const definition = loaded.find(
        (candidate) => candidate.identifier === entry.module,
      )!;
      expect(Object.keys(definition.actions!)).not.toHaveLength(0);
      for (const action of Object.values(definition.actions!))
        expect(action).toMatchObject({
          profile: entry.profile === 'weapiPc' ? 'web' : entry.profile,
          semantic: entry.semantic,
          cache: 'none',
          retry: entry.retry,
        });
    }
    const membershipModules = new Set(
      membershipBusiness.cases.map((entry) => entry.module),
    );
    expect(
      loaded
        .filter((definition) => membershipModules.has(definition.identifier))
        .reduce(
          (count, definition) =>
            count + Object.keys(definition.actions!).length,
          0,
        ),
    ).toBe(50);
    for (const entry of membershipBusiness.cases.filter(
      (candidate) => candidate.label === 'default',
    )) {
      const definition = loaded.find(
        (candidate) => candidate.identifier === entry.module,
      )!;
      expect(Object.keys(definition.actions!)).not.toHaveLength(0);
      for (const action of Object.values(definition.actions!))
        expect(action).toMatchObject({
          profile: entry.profile === 'weapiPc' ? 'web' : entry.profile,
          semantic: entry.semantic,
          cache: 'none',
          retry: entry.retry,
        });
    }
    expect(declared).toHaveLength(352);
    expect(declared).toEqual([...generatedActionModuleIdentifiers].toSorted());
    expect(generatedPendingActionModuleIdentifiers).toHaveLength(0);
    for (const identifier of declared)
      expect(generatedPendingActionModuleIdentifiers).not.toContain(identifier);
    for (const definition of loaded.filter(
      (entry) => entry.actions !== undefined,
    ))
      expect(
        sdkModuleRegistry[
          definition.identifier as keyof typeof sdkModuleRegistry
        ].actions,
      ).toEqual(definition.actions);
  });

  test('recognizes named action exports in the generated registry', async () => {
    const directory = await mkdtemp(
      resolve(tmpdir(), 'hana-module-actions-export-'),
    );
    try {
      await writeFile(
        resolve(directory, 'tsconfig.json'),
        '{"include":["*.ts"]}',
      );
      await writeFile(
        resolve(directory, 'sample.ts'),
        `
        export type ModuleInput = {}
        export const decodeModuleInput = (input: unknown) => Effect.succeed(input)
        const actions = { cancel: { profile: 'web', target: '/api/playlist/unsubscribe', semantic: 'write', cache: 'none', retry: 'never' } }
        export { actions as moduleActions }
        const sample: ModuleEffect<ModuleInput> = () => Effect.succeed({})
        export default sample
      `,
      );
      const artifacts = await buildGeneratedArtifacts(directory);
      const registry = artifacts.files.find((file) =>
        file.path.endsWith('registry.generated.ts'),
      )!;
      expect(registry.contents).toContain('moduleActions as sampleActions');
      expect(registry.contents).toContain('actions: sampleActions');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });

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
