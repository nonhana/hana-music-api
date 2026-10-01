import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { Effect } from 'effect';

import { createHanaMusicApi } from '../../index.ts';
import {
  invokeModule as invokeProgrammatic,
  loadProgrammaticApi,
} from '../../src/app/module-api.ts';
import { buildCallServices, Call, runCall } from '../../src/core/call.ts';
import { InvalidModuleInput } from '../../src/core/errors.ts';
import { getRuntimeState, setRuntimeState } from '../../src/core/runtime.ts';
import { decodeLegacyModuleInput } from '../../src/modules/_input.ts';
import audioMatch, {
  decodeModuleInput as decodeAudioInput,
} from '../../src/modules/audio_match.ts';
import commentNew, {
  decodeModuleInput as decodeCommentInput,
} from '../../src/modules/comment_new.ts';
import djToplist from '../../src/modules/dj_toplist.ts';
import search, {
  decodeModuleInput as decodeSearchInput,
} from '../../src/modules/search.ts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import {
  createEffectModuleInvoker,
  createSdkClientContext,
} from '../../src/sdk/runtime.ts';
import { createServer } from '../../src/server/create-server.ts';
import { discoverModuleFiles } from '../../src/server/module-discovery.ts';
import type {
  ModuleDefinition,
  ModuleQuery,
  RequestCapability,
  UnknownJson,
} from '../../src/types/index.ts';
import { runEffect } from '../_kit/it.ts';
import { moduleResponse } from '../fixtures/request-capability.ts';
import { executeModule, response } from '../fixtures/upload-effect.ts';

const projectDirectory = resolve(import.meta.dir, '../..');
const echoRequest: RequestCapability = (intent) =>
  Effect.succeed(response(intent.body ? JSON.parse(String(intent.body)) : {}));

describe('module input ownership', () => {
  test('all 351 endpoints own inputs without importing the central public alias barrel', async () => {
    const modules = await discoverModuleFiles(
      resolve(projectDirectory, 'src/modules'),
    );
    const centralized: Array<string> = [];
    let legacyCount = 0;
    for (const module of modules) {
      const source = await readFile(module.filePath, 'utf8');
      if (source.includes("from '../types/modules.ts'")) {
        centralized.push(module.identifier);
      }
      expect(
        source.match(/export (?:type|interface) ModuleInput\b/g) ?? [],
      ).toHaveLength(1);
      if (/export type ModuleInput = LegacyModuleInput\b/.test(source)) {
        legacyCount += 1;
      }
    }
    expect(modules).toHaveLength(351);
    expect(centralized).toEqual([]);
    expect(legacyCount).toBe(284);
  });

  test('all 351 registry entries expose their local decoder', () => {
    expect(
      Object.values(sdkModuleRegistry).filter(
        (definition) =>
          'decodeInput' in definition &&
          typeof definition.decodeInput === 'function',
      ),
    ).toHaveLength(351);
  });

  test('shared input primitives have no execution fields or central domain maps', async () => {
    const shared = await readFile(
      resolve(projectDirectory, 'src/types/module-shared.ts'),
      'utf8',
    );
    expect(shared).not.toMatch(
      /\b(?:proxy|domain|fetcher|timeoutMs|signal|retry|ip|realIP|state|cookie)\??:/,
    );
    expect(shared).not.toMatch(
      /OptionCompatibleQuery|AlbumQuery|ArtistQuery|UserDetailQuery/,
    );
    expect(
      existsSync(resolve(projectDirectory, 'src/types/module-overrides.ts')),
    ).toBe(false);
    expect(
      existsSync(resolve(projectDirectory, 'src/modules/_module-inputs.ts')),
    ).toBe(false);
    expect(
      await readFile(
        resolve(projectDirectory, 'src/types/module-contracts.ts'),
        'utf8',
      ),
    ).not.toContain('ModuleInputMigrationMap');
    expect(
      await readFile(resolve(projectDirectory, 'src/core/config.ts'), 'utf8'),
    ).not.toContain('RESOURCE_TYPE_MAP');
  });
});

describe('module-local input decoding', () => {
  test.each([
    {
      module: search,
      decoder: decodeSearchInput,
      input: {},
      field: 'keywords',
    },
    {
      module: search,
      decoder: decodeSearchInput,
      input: { keywords: [] },
      field: 'keywords',
    },
    {
      module: search,
      decoder: decodeSearchInput,
      input: { keywords: 'music', limit: {} },
      field: 'limit',
    },
    {
      module: search,
      decoder: decodeSearchInput,
      input: { keywords: 'music', offset: 'invalid' },
      field: 'offset',
    },
    {
      module: audioMatch,
      decoder: decodeAudioInput,
      input: { duration: '10' },
      field: 'audioFP',
    },
    {
      module: audioMatch,
      decoder: decodeAudioInput,
      input: { audioFP: 'fingerprint', duration: [] },
      field: 'duration',
    },
    {
      module: commentNew,
      decoder: decodeCommentInput,
      input: { id: {}, type: 0 },
      field: 'id',
    },
    {
      module: commentNew,
      decoder: decodeCommentInput,
      input: { id: '12', type: 0, showInner: [] },
      field: 'showInner',
    },
  ])(
    'rejects invalid $field before constructing a request',
    async ({ module, decoder, input, field }) => {
      let requests = 0;
      const decoded: Effect.Effect<ModuleQuery, InvalidModuleInput> =
        decoder(input);
      const outcome = await runEffect(
        decoded.pipe(
          Effect.flatMap((normalized) =>
            executeModule(module, normalized, () => {
              requests += 1;
              return Effect.succeed(response({ code: 200 }));
            }),
          ),
          Effect.match({
            onFailure: (error) => error,
            onSuccess: () => undefined,
          }),
        ),
      );
      expect(outcome).toBeInstanceOf(InvalidModuleInput);
      expect(outcome?.message).toContain(field);
      expect(requests).toBe(0);
    },
  );

  test('search accepts numeric strings without changing its existing wire representation', async () => {
    const result = await runEffect(
      executeModule(
        search,
        { keywords: 'voice', type: '2000', limit: '5', offset: '2' },
        echoRequest,
      ),
    );
    expect(result.body).toEqual({
      keyword: 'voice',
      scene: 'normal',
      limit: '5',
      offset: '2',
    });
  });

  test('audio matching accepts a numeric-string duration', async () => {
    const result = await runEffect(
      executeModule(
        audioMatch,
        { audioFP: 'a+b', duration: '2.5' },
        (intent) => {
          const url = new URL(intent.target);
          return Effect.succeed(
            response({
              code: 200,
              data: {
                duration: url.searchParams.get('duration'),
                fingerprint: url.searchParams.get('rawdata'),
              },
            }),
          );
        },
      ),
    );
    expect(result.body).toEqual({
      code: 200,
      data: { duration: '2.5', fingerprint: 'a+b' },
    });
  });

  test.each([
    { value: false, expected: false },
    { value: 0, expected: false },
    { value: '0', expected: false },
    { value: 'false', expected: false },
    { value: true, expected: true },
    { value: 1, expected: true },
    { value: '1', expected: true },
    { value: 'true', expected: true },
  ])('normalizes comment showInner=$value', async ({ value, expected }) => {
    const result = await runEffect(
      decodeCommentInput({
        id: '12',
        type: '0',
        pageNo: '2',
        pageSize: '5',
        showInner: value,
      }).pipe(
        Effect.flatMap((input) =>
          executeModule(commentNew, input, echoRequest),
        ),
      ),
    );
    expect(result.body).toEqual({
      threadId: 'R_SO_4_12',
      pageNo: 2,
      showInner: expected,
      pageSize: 5,
      cursor: '5',
      sortType: 99,
    });
  });

  test.each([0, '0', 99, '99'])(
    'preserves comment resource fallback for type=%s',
    async (type) => {
      const result = await runEffect(
        executeModule(commentNew, { id: 12, type }, echoRequest),
      );
      expect(result.body).toMatchObject({
        threadId: 'R_SO_4_12',
        showInner: true,
      });
    },
  );

  test.each([
    { type: 'hot', expected: 1 },
    { type: 'new', expected: 0 },
    { type: 'unknown', expected: 0 },
    { type: undefined, expected: 0 },
  ])('preserves DJ toplist fallback for $type', async ({ type, expected }) => {
    const result = await runEffect(
      executeModule(djToplist, { type }, echoRequest),
    );
    expect(result.body).toEqual({ limit: 100, offset: 0, type: expected });
  });
});

describe('untrusted entry input', () => {
  test.each([
    { method: 'album', input: { id: {} }, pool: false },
    { method: 'login', input: { email: 'x' }, pool: false },
    { method: 'playlistDetail', input: { id: 1n }, pool: false },
    { method: 'album', input: { id: {} }, pool: true },
    { method: 'login', input: { email: 'x' }, pool: true },
    { method: 'playlistDetail', input: { id: 1n }, pool: true },
    { method: 'search', input: { keywords: [] }, pool: false },
    {
      method: 'audioMatch',
      input: { audioFP: 'fingerprint', duration: [] },
      pool: false,
    },
    {
      method: 'commentNew',
      input: { id: '12', type: 0, showInner: [] },
      pool: false,
    },
    { method: 'search', input: { keywords: [] }, pool: true },
    {
      method: 'audioMatch',
      input: { audioFP: 'fingerprint', duration: [] },
      pool: true,
    },
    {
      method: 'commentNew',
      input: { id: '12', type: 0, showInner: [] },
      pool: true,
    },
  ] as const)(
    '$method rejects invalid cold input before identity initialization (pool=$pool)',
    async ({ method, input, pool }) => {
      const state = getRuntimeState();
      setRuntimeState({ anonymousToken: '' });
      let requests = 0;
      try {
        const api = createHanaMusicApi({
          ...(pool ? { identityPool: { size: 1 } } : {}),
          fetcher: async () => {
            requests += 1;
            throw new Error('anonymous initialization must not run');
          },
        });
        const result = await Reflect.apply(api[method], undefined, [
          input,
        ]).catch((error: unknown) => error);
        expect(result).toMatchObject({ status: 400, body: { code: 400 } });
        expect(requests).toBe(0);
      } finally {
        setRuntimeState(state);
      }
    },
  );

  test('invalid functions cannot bypass validation by colliding with a cached optional field', async () => {
    let requests = 0;
    const config = {
      cookie: 'MUSIC_U=input-cache',
      cache: { ttlMs: 60_000 },
      fetcher: async () => {
        requests += 1;
        return Response.json({ code: 200 });
      },
    };
    const context = createSdkClientContext(config);
    const invoke = createEffectModuleInvoker(
      'search',
      sdkModuleRegistry.search,
      config,
      context,
    );
    await invoke({ keywords: 'music', limit: undefined });
    const snapshot = context.reads.snapshot;
    const result = await Reflect.apply(invoke, undefined, [
      { keywords: 'music', limit: () => 5 },
    ]).catch((error: unknown) => error);
    expect(result).toMatchObject({ status: 400, body: { code: 400 } });
    expect(context.reads.snapshot).toEqual(snapshot);
    expect(requests).toBe(1);
  });

  test('SDK and programmatic BigInt fields fail with 400 before cache-key serialization', async () => {
    let requests = 0;
    const api = createHanaMusicApi({
      cookie: 'MUSIC_U=input-bigint',
      fetcher: async () => {
        requests += 1;
        return Response.json({ code: 200 });
      },
    });
    const input = { keywords: 'music', limit: 1n };
    const sdk = await Reflect.apply(api.search, undefined, [input]).catch(
      (error: unknown) => error,
    );
    const programmatic = await invokeProgrammatic(
      'search',
      input as unknown as { keywords: string },
      {
        requestHandler: () =>
          Effect.sync(() => {
            requests += 1;
            throw new Error('invalid input reached upstream');
          }),
      },
    ).catch((error: unknown) => error);
    expect(sdk).toMatchObject({ status: 400, body: { code: 400 } });
    expect(programmatic).toMatchObject({ status: 400, body: { code: 400 } });
    expect(requests).toBe(0);
  });

  test('search normalization removes unknown fields before building the cache key', async () => {
    let requests = 0;
    const config = {
      cookie: 'MUSIC_U=normalized-input-cache',
      cache: { ttlMs: 60_000 },
      fetcher: async () => {
        requests += 1;
        return Response.json({ code: 200 });
      },
    };
    const context = createSdkClientContext(config);
    const invoke = createEffectModuleInvoker(
      'search',
      sdkModuleRegistry.search,
      config,
      context,
    );
    await Reflect.apply(invoke, undefined, [
      { keywords: 'music', extra: 'first' },
    ]);
    await Reflect.apply(invoke, undefined, [
      { keywords: 'music', extra: 'second' },
    ]);
    expect(requests).toBe(1);
    expect(context.reads.snapshot.cacheHits).toBe(1);
  });

  test('Hono rejects a BigInt literal in a JSON body with 400', async () => {
    let requests = 0;
    const app = await createServer({
      requestHandler: () =>
        Effect.sync(() => {
          requests += 1;
          throw new Error('invalid input reached upstream');
        }),
    });
    const result = await app.request('http://localhost/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"keywords":"music","limit":1n}',
    });
    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({ code: 400 });
    expect(requests).toBe(0);
  });

  test('the Call kernel decodes once per invocation and keys execution by normalized input', async () => {
    let decodes = 0;
    const executed: Array<{
      input: ModuleQuery;
      callInput: Readonly<ModuleQuery>;
    }> = [];
    const definition = {
      identifier: 'search',
      route: '/search',
      decodeInput: (input: unknown) =>
        Effect.sync(() => {
          decodes += 1;
          return { id: String((input as ModuleQuery).id) };
        }),
      execute: (input) =>
        Effect.gen(function* () {
          const call = yield* Call;
          executed.push({ input, callInput: call.input });
          return { status: 200, cookie: [], body: { code: 200, id: input.id } };
        }),
    } satisfies ModuleDefinition<'search', { id: string }>;
    const context = buildCallServices(
      undefined,
      { cache: { ttlMs: 60_000 } },
      false,
    );
    for (const id of [12, '12']) {
      await runCall(
        { identifier: 'search', input: { id }, config: {} },
        context,
        definition,
      );
    }
    expect(decodes).toBe(2);
    expect(executed).toEqual([
      { input: { id: '12' }, callInput: { id: '12' } },
    ]);
    expect(context.reads.snapshot.cacheHits).toBe(1);
  });

  test('SDK JavaScript callers receive 400 for invalid business fields', async () => {
    let requests = 0;
    const api = createHanaMusicApi({
      cookie: 'MUSIC_U=input-contract',
      fetcher: async () => {
        requests += 1;
        return Response.json({ code: 200 });
      },
    });
    const result = await Reflect.apply(api.search, undefined, [
      { keywords: [] },
    ]).catch((error: unknown) => error);
    expect(result).toMatchObject({ status: 400, body: { code: 400 } });
    expect(requests).toBe(0);
  });

  test('programmatic callers receive 400 before invoking their request handler', async () => {
    let requests = 0;
    const result = await invokeProgrammatic(
      'search',
      { keywords: [] } as unknown as { keywords: string },
      {
        requestHandler: () =>
          Effect.sync(() => {
            requests += 1;
            throw new Error('invalid input reached the request handler');
          }),
      },
    ).catch((error: unknown) => error);
    expect(result).toMatchObject({ status: 400, body: { code: 400 } });
    expect(requests).toBe(0);
  });

  test('Hono JSON bodies use the same input validation', async () => {
    let requests = 0;
    const app = await createServer({
      requestHandler: () =>
        Effect.sync(() => {
          requests += 1;
          throw new Error('invalid input reached the request handler');
        }),
    });
    const result = await app.request('http://localhost/search', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ keywords: [] }),
    });
    expect(result.status).toBe(400);
    expect(await result.json()).toMatchObject({ code: 400 });
    expect(requests).toBe(0);
  });

  test('legacy programmatic inputs preserve unknown nested business fields', async () => {
    const api = await loadProgrammaticApi({
      moduleDefinitions: [
        {
          identifier: 'legacy',
          route: '/legacy',
          decodeInput: decodeLegacyModuleInput,
          execute: (input: ModuleQuery) =>
            Effect.sync(() => ({
              status: 200,
              cookie: [],
              body: input as UnknownJson,
            })).pipe(Effect.map(moduleResponse)),
        },
      ],
    });
    const input = {
      future: { nested: [null, 'kept', { enabled: true }] },
      custom: 7,
    };
    expect((await api.legacy!(input)).body).toMatchObject(input);
  });

  test('explicit legacy decoders preserve unknown legacy input fields', async () => {
    const api = await loadProgrammaticApi({
      moduleDefinitions: [
        {
          identifier: 'legacy_effect',
          route: '/legacy/effect',
          decodeInput: decodeLegacyModuleInput,
          execute: (input) =>
            Effect.succeed({
              status: 200,
              cookie: [],
              body: input as UnknownJson,
            }),
        },
      ],
    });
    const input = {
      future: { nested: [null, 'kept', { enabled: true }] },
      custom: 7,
    };
    expect((await api.legacy_effect!(input)).body).toMatchObject(input);
  });
});
