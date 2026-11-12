import { describe, expect, test } from 'bun:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Effect } from 'effect';

import {
  createModuleApi,
  invokeModule,
  loadProgrammaticApi,
} from '../../../src/app/module-api.ts';
import { decodeModuleObject } from '../../../src/core/module-input.ts';
import type {
  DynamicProgrammaticApi,
  ModuleDefinition,
  ModuleQuery,
  ProgrammaticModuleInvoker,
  RequestCapability,
} from '../../../src/types/index.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import {
  moduleResponse,
  probeReadActions,
  testRequest,
} from '../../_kit/module.ts';
import type { ApiWireMetadata } from '../../_kit/upstream/api.ts';
import { withApiScenario } from '../../_kit/upstream/api.ts';
import artistAlbum from '../../fixtures/netease/library/artist_album.json';

const REAL_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../src/modules',
);

describe('programmatic module api', () => {
  test('execution options are consumed before the module receives business input', async () => {
    const api = await loadProgrammaticApi({
      moduleDefinitions: [
        {
          actions: {},
          identifier: 'example',
          route: '/example',
          decodeInput: decodeModuleObject,
          execute: (query: ModuleQuery) =>
            Effect.sync(() => ({
              status: 200,
              cookie: [],
              body: { keys: Object.keys(query) },
            })).pipe(Effect.map(moduleResponse)),
        },
      ],
    });
    const response = await getProgrammaticInvoker(api, 'example')(
      { value: 'business' },
      { timeoutMs: 100 },
    );
    expect(response.body).toEqual({ keys: ['value'] });
  });
  const moduleDefinitions: Array<ModuleDefinition> = [
    {
      actions: probeReadActions,
      identifier: 'search',
      decodeInput: decodeModuleObject,
      execute: (query: ModuleQuery, request: RequestCapability) =>
        Effect.gen(function* () {
          const upstream = yield* testRequest(request, '/api/search/get', {
            keyword: query.keyword,
            keywords: query.keywords,
          });

          return {
            body: {
              query,
              upstream,
            },
            cookie: [],
            status: 200,
          };
        }).pipe(Effect.map(moduleResponse)),
      route: '/search',
    },
  ];

  test('should expose eagerly loaded module invokers', async () => {
    await withApiScenario(
      ['https://interface.music.163.com/api/search/get'],
      async ({ ...options }) => ({
        body: {
          code: 200,
          cookie: options.cookie,
        },
        cookie: [],
        status: 200,
      }),
      async (upstream) => {
        const api = await loadProgrammaticApi(
          {
            moduleDefinitions,
          },
          { fetcher: upstream, entropy: testEntropy },
        );

        const search = getProgrammaticInvoker(api, 'search');
        const response = await search(
          { keywords: 'hello' },
          { cookie: 'MUSIC_U=test-cookie' },
        );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          query: { keywords: 'hello' },
          upstream: {
            body: {
              code: 200,
              cookie: expect.objectContaining({
                MUSIC_U: 'test-cookie',
              }),
            },
            cookie: [],
            status: 200,
          },
        });
      },
    );
  });

  test('should expose lazy proxy invokers', async () => {
    await withApiScenario(
      ['https://interface.music.163.com/api/search/get'],
      async () => ({
        body: {
          code: 200,
        },
        cookie: [],
        status: 200,
      }),
      async (upstream) => {
        const api = createModuleApi(
          {
            moduleDefinitions,
          },
          { fetcher: upstream, entropy: testEntropy },
        );

        const search = getProgrammaticInvoker(api, 'search');
        const response = await search({
          keywords: 'proxy-call',
        });

        expect(response.status).toBe(200);
        expect(readKeywordFromBody(response.body)).toBe('proxy-call');
      },
    );
  });

  test('should share concurrent lazy proxy reads', async () => {
    let calls = 0;
    const api = createModuleApi({
      moduleDefinitions: [
        {
          actions: probeReadActions,
          identifier: 'search',
          decodeInput: decodeModuleObject,
          execute: () =>
            Effect.gen(function* () {
              calls += 1;
              yield* Effect.sleep(10);
              return { body: { code: 200 }, cookie: [], status: 200 };
            }).pipe(Effect.map(moduleResponse)),
          route: '/search',
        },
      ],
    });
    await Promise.all(
      Array.from({ length: 20 }, () =>
        getProgrammaticInvoker(api, 'search')({ keywords: 'same' }),
      ),
    );

    expect(calls).toBe(1);
  });

  test('direct invocation merges matching reads and isolates different implementations', async () => {
    let calls = 0;
    const definitions: Array<ModuleDefinition> = [
      {
        actions: probeReadActions,
        identifier: 'search',
        route: '/search',
        decodeInput: decodeModuleObject,
        execute: () =>
          Effect.gen(function* () {
            calls += 1;
            yield* Effect.sleep(10);
            return {
              status: 200,
              cookie: [],
              body: { code: 200, source: 'first' },
            };
          }).pipe(Effect.map(moduleResponse)),
      },
    ];
    const pending = Promise.all(
      Array.from({ length: 20 }, () =>
        invokeModule(
          'search',
          { keywords: 'same' },
          { moduleDefinitions: definitions },
        ),
      ),
    );
    const other = await invokeModule(
      'search',
      { keywords: 'same' },
      {
        moduleDefinitions: [
          {
            actions: {},
            identifier: 'search',
            route: '/search',
            decodeInput: decodeModuleObject,
            execute: () =>
              Effect.sync(() => ({
                status: 200,
                cookie: [],
                body: { code: 200, source: 'second' },
              })).pipe(Effect.map(moduleResponse)),
          },
        ],
      },
    );
    const responses = await pending;
    expect(calls).toBe(1);
    for (const response of responses) {
      expect(response.body).toMatchObject({ source: 'first' });
    }
    expect(other.body).toMatchObject({ source: 'second' });
    await invokeModule(
      'search',
      { keywords: 'same' },
      { moduleDefinitions: definitions },
    );
    expect(calls).toBe(2);
  });

  test('should allow direct invocation by identifier', async () => {
    await withApiScenario(
      ['https://interface.music.163.com/api/search/get'],
      async () => ({
        body: {
          code: 200,
        },
        cookie: [],
        status: 200,
      }),
      async (upstream) => {
        const response = await invokeModule(
          'search',
          {
            keywords: 'invoke',
          },
          {
            moduleDefinitions,
          },
          {},
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(response.status).toBe(200);
        expect(readKeywordFromBody(response.body)).toBe('invoke');
      },
    );
  });

  test('should load real migrated modules for programmatic invocation', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};
    await withApiScenario(
      ['https://interface.music.163.com/eapi/search/get'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            result: {
              songs: [],
            },
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const api = await loadProgrammaticApi(
          {
            modulesDirectory: REAL_MODULES_DIRECTORY,
          },
          { fetcher: upstream, entropy: testEntropy },
        );

        const search = getProgrammaticInvoker(api, 'search');
        const response = await search(
          { keywords: 'phase-5', limit: 5, offset: 2 },
          { cookie: 'MUSIC_U=real-cookie' },
        );

        expect(captured.uri).toBe('/api/search/get');
        expect(captured.data).toEqual({
          limit: 5,
          offset: 2,
          s: 'phase-5',
          type: 1,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'real-cookie',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          code: 200,
          result: {
            songs: [],
          },
        });
      },
    );
  });

  test('should support typed comment module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/v1/resource/comments/R_SO_4_12345'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            comments: [],
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'comment_music',
          { before: 10, id: 12345, limit: 30, offset: 5 },
          {},
          { cookie: 'MUSIC_U=comment-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/v1/resource/comments/R_SO_4_12345');
        expect(captured.data).toEqual({
          beforeTime: 10,
          limit: 30,
          offset: 5,
          rid: 12345,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'comment-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should support typed album list module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/vipmall/albumproduct/list'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            products: [],
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'album_list',
          { area: 'EA', limit: 12, offset: 24, type: 2 },
          {},
          { cookie: 'MUSIC_U=album-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/vipmall/albumproduct/list');
        expect(captured.data).toEqual({
          area: 'EA',
          limit: 12,
          offset: 24,
          total: true,
          type: 2,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'album-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should support typed album subscription module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/album/sub'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'album_sub',
          { id: 99887, t: 1 },
          {},
          { cookie: 'MUSIC_U=album-sub-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/album/sub');
        expect(captured.data).toEqual({
          id: 99887,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'album-sub-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should support typed user detail module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/v1/user/detail/67890'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            profile: {
              userId: 67890,
              nickname: 'listener',
              avatarUrl: 'https://p1.music.126.net/avatar.jpg',
              vipType: 0,
              avatarImgId_str: '1',
            },
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'user_detail',
          { uid: 67890 },
          {},
          { cookie: 'MUSIC_U=user-detail-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/v1/user/detail/67890');
        expect(captured.data).toEqual({});
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'user-detail-cookie',
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          code: 200,
          profile: {
            userId: 67890,
            nickname: 'listener',
            avatarUrl: 'https://p1.music.126.net/avatar.jpg',
            vipType: 0,
            avatarImgIdStr: '1',
          },
        });
      },
    );
  });

  test('should support typed user playlist module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/user/playlist'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            more: false,
            playlist: [],
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'user_playlist',
          { limit: 20, offset: 40, uid: 24680 },
          {},
          { cookie: 'MUSIC_U=user-playlist-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/user/playlist');
        expect(captured.data).toEqual({
          includeVideo: true,
          limit: 20,
          offset: 40,
          uid: 24680,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'user-playlist-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should support typed user level module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/user/level'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            data: {
              userId: 599663130,
              level: 10,
            },
            full: false,
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'user_level',
          {},
          {},
          { cookie: 'MUSIC_U=user-level-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/user/level');
        expect(captured.data).toEqual({});
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'user-level-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should support typed artist album module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/artist/albums/33927412'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: artistAlbum.response.body,
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'artist_album',
          { id: artistAlbum.query.id, limit: 15, offset: 30 },
          {},
          { cookie: 'MUSIC_U=artist-album-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/artist/albums/33927412');
        expect(captured.data).toEqual({
          limit: 15,
          offset: 30,
          total: true,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'artist-album-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should support typed artist subscription module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/artist/sub'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            data: null,
            message: 'success',
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'artist_sub',
          { id: 4455, t: 1 },
          {},
          { cookie: 'MUSIC_U=artist-sub-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/artist/sub');
        expect(captured.data).toEqual({
          artistId: 4455,
          artistIds: '[4455]',
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'artist-sub-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });

  test('should expose fallback-typed module identifiers from the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: ApiWireMetadata;
      uri?: string;
    } = {};

    await withApiScenario(
      ['https://music.163.com/weapi/v1/discovery/new/songs'],
      async ({ path: uri, data, ...options }) => {
        captured.uri = uri;
        captured.data = data;
        captured.options = options;

        return {
          body: {
            code: 200,
            data: [],
          },
          cookie: [],
          status: 200,
        };
      },
      async (upstream) => {
        const response = await invokeModule(
          'top_song',
          { type: 96 },
          {},
          { cookie: 'MUSIC_U=top-song-cookie' },
          { fetcher: upstream, entropy: testEntropy },
        );

        expect(captured.uri).toBe('/api/v1/discovery/new/songs');
        expect(captured.data).toEqual({
          areaId: 96,
          total: true,
        });
        expect(captured.options?.cookie).toMatchObject({
          MUSIC_U: 'top-song-cookie',
        });
        expect(response.status).toBe(200);
      },
    );
  });
});

const getProgrammaticInvoker = (
  api: DynamicProgrammaticApi,
  identifier: string,
): ProgrammaticModuleInvoker => {
  const candidate = api[identifier];
  if (typeof candidate !== 'function') {
    throw new TypeError(
      `Expected "${identifier}" to be a callable programmatic module`,
    );
  }

  return candidate;
};

const readKeywordFromBody = (value: unknown): string => {
  if (!isRecordLike(value)) {
    throw new TypeError('Expected response body to be an object');
  }

  const query = value.query;
  if (!isRecordLike(query) || typeof query.keywords !== 'string') {
    throw new TypeError('Expected response body to contain query.keywords');
  }

  return query.keywords;
};

const isRecordLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
