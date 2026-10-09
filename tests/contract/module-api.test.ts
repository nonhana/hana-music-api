import { describe, expect, test } from 'bun:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { Effect } from 'effect';

import {
  createModuleApi,
  invokeModule,
  loadProgrammaticApi,
} from '../../src/app/module-api.ts';
import { decodeLegacyModuleInput } from '../../src/core/module-input.ts';
import type {
  CreateRequestOptions,
  DynamicProgrammaticApi,
  ModuleDefinition,
  ModuleQuery,
  ProgrammaticModuleInvoker,
  RequestCapability,
} from '../../src/types/index.ts';
import {
  mockRequest,
  moduleResponse,
  testRequest,
} from '../fixtures/request-capability.ts';

const REAL_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../src/modules',
);

describe('programmatic module api', () => {
  test('execution options are consumed before the module receives business input', async () => {
    const api = await loadProgrammaticApi({
      moduleDefinitions: [
        {
          identifier: 'example',
          route: '/example',
          decodeInput: decodeLegacyModuleInput,
          execute: (query: ModuleQuery) =>
            Effect.sync(() => ({
              status: 200,
              cookie: [],
              body: { keys: Object.keys(query) },
            })).pipe(Effect.map(moduleResponse)),
        },
      ],
    });
    const response = await getProgrammaticInvoker(
      api,
      'example',
    )({ value: 'business', timeoutMs: 100, headers: { 'X-Test': 'secret' } });
    expect(response.body).toEqual({ keys: ['value'] });
  });
  const moduleDefinitions: Array<ModuleDefinition> = [
    {
      identifier: 'search',
      decodeInput: decodeLegacyModuleInput,
      execute: (query: ModuleQuery, request: RequestCapability) =>
        Effect.gen(function* () {
          const upstream = yield* testRequest(
            request,
            '/api/search/get',
            {
              keyword: query.keyword,
              keywords: query.keywords,
            },
            {
              cookie: readCookieRecord(query.cookie),
            },
          );

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
    const api = await loadProgrammaticApi({
      moduleDefinitions,
      requestHandler: mockRequest(async (_uri, _data, options = {}) => ({
        body: {
          code: 200,
          cookie: options.cookie,
        },
        cookie: [],
        status: 200,
      })),
    });

    const search = getProgrammaticInvoker(api, 'search');
    const response = await search({
      cookie: 'MUSIC_U=test-cookie',
      keywords: 'hello',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      query: {
        cookie: {
          MUSIC_U: 'test-cookie',
        },
        keywords: 'hello',
      },
      upstream: {
        body: {
          code: 200,
          cookie: {
            MUSIC_U: 'test-cookie',
          },
        },
        cookie: [],
        status: 200,
      },
    });
  });

  test('should expose lazy proxy invokers', async () => {
    const api = createModuleApi({
      moduleDefinitions,
      requestHandler: mockRequest(async () => ({
        body: {
          code: 200,
        },
        cookie: [],
        status: 200,
      })),
    });

    const search = getProgrammaticInvoker(api, 'search');
    const response = await search({
      keywords: 'proxy-call',
    });

    expect(response.status).toBe(200);
    expect(readKeywordFromBody(response.body)).toBe('proxy-call');
  });

  test('should share concurrent lazy proxy reads', async () => {
    let calls = 0;
    const api = createModuleApi({
      moduleDefinitions: [
        {
          identifier: 'search',
          decodeInput: decodeLegacyModuleInput,
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
        identifier: 'search',
        route: '/search',
        decodeInput: decodeLegacyModuleInput,
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
            identifier: 'search',
            route: '/search',
            decodeInput: decodeLegacyModuleInput,
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
    const response = await invokeModule(
      'search',
      {
        keywords: 'invoke',
      },
      {
        moduleDefinitions,
        requestHandler: mockRequest(async () => ({
          body: {
            code: 200,
          },
          cookie: [],
          status: 200,
        })),
      },
    );

    expect(response.status).toBe(200);
    expect(readKeywordFromBody(response.body)).toBe('invoke');
  });

  test('should load real migrated modules for programmatic invocation', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};
    const api = await loadProgrammaticApi({
      modulesDirectory: REAL_MODULES_DIRECTORY,
      requestHandler: mockRequest(async (uri, data, options = {}) => {
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
      }),
    });

    const search = getProgrammaticInvoker(api, 'search');
    const response = await search({
      cookie: 'MUSIC_U=real-cookie',
      keywords: 'phase-5',
      limit: 5,
      offset: 2,
    });

    expect(captured.uri).toBe('/api/search/get');
    expect(captured.data).toEqual({
      limit: 5,
      offset: 2,
      s: 'phase-5',
      type: 1,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'real-cookie',
    });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      code: 200,
      result: {
        songs: [],
      },
    });
  });

  test('should support typed comment module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'comment_music',
      {
        before: 10,
        cookie: 'MUSIC_U=comment-cookie',
        id: 12345,
        limit: 30,
        offset: 5,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
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
        }),
      },
    );

    expect(captured.uri).toBe('/api/v1/resource/comments/R_SO_4_12345');
    expect(captured.data).toEqual({
      beforeTime: 10,
      limit: 30,
      offset: 5,
      rid: 12345,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'comment-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should support typed album list module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'album_list',
      {
        area: 'EA',
        cookie: 'MUSIC_U=album-cookie',
        limit: 12,
        offset: 24,
        type: 2,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
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
        }),
      },
    );

    expect(captured.uri).toBe('/api/vipmall/albumproduct/list');
    expect(captured.data).toEqual({
      area: 'EA',
      limit: 12,
      offset: 24,
      total: true,
      type: 2,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'album-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should support typed album subscription module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'album_sub',
      {
        cookie: 'MUSIC_U=album-sub-cookie',
        id: 99887,
        t: 1,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
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
        }),
      },
    );

    expect(captured.uri).toBe('/api/album/sub');
    expect(captured.data).toEqual({
      id: 99887,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'album-sub-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should support typed user detail module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'user_detail',
      {
        cookie: 'MUSIC_U=user-detail-cookie',
        uid: 67890,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
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
        }),
      },
    );

    expect(captured.uri).toBe('/api/v1/user/detail/67890');
    expect(captured.data).toEqual({});
    expect(captured.options?.cookie).toEqual({
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
  });

  test('should support typed user playlist module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'user_playlist',
      {
        cookie: 'MUSIC_U=user-playlist-cookie',
        limit: 20,
        offset: 40,
        uid: 24680,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
          captured.uri = uri;
          captured.data = data;
          captured.options = options;

          return {
            body: {
              code: 200,
              playlist: [],
            },
            cookie: [],
            status: 200,
          };
        }),
      },
    );

    expect(captured.uri).toBe('/api/user/playlist');
    expect(captured.data).toEqual({
      includeVideo: true,
      limit: 20,
      offset: 40,
      uid: 24680,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'user-playlist-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should support typed user level module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'user_level',
      {
        cookie: 'MUSIC_U=user-level-cookie',
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
          captured.uri = uri;
          captured.data = data;
          captured.options = options;

          return {
            body: {
              code: 200,
              level: 10,
            },
            cookie: [],
            status: 200,
          };
        }),
      },
    );

    expect(captured.uri).toBe('/api/user/level');
    expect(captured.data).toEqual({});
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'user-level-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should support typed artist album module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'artist_album',
      {
        cookie: 'MUSIC_U=artist-album-cookie',
        id: 1122,
        limit: 15,
        offset: 30,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
          captured.uri = uri;
          captured.data = data;
          captured.options = options;

          return {
            body: {
              code: 200,
              hotAlbums: [],
            },
            cookie: [],
            status: 200,
          };
        }),
      },
    );

    expect(captured.uri).toBe('/api/artist/albums/1122');
    expect(captured.data).toEqual({
      limit: 15,
      offset: 30,
      total: true,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'artist-album-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should support typed artist subscription module identifiers in the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'artist_sub',
      {
        cookie: 'MUSIC_U=artist-sub-cookie',
        id: 4455,
        t: 1,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
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
        }),
      },
    );

    expect(captured.uri).toBe('/api/artist/sub');
    expect(captured.data).toEqual({
      artistId: 4455,
      artistIds: '[4455]',
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'artist-sub-cookie',
    });
    expect(response.status).toBe(200);
  });

  test('should expose fallback-typed module identifiers from the real module registry', async () => {
    const captured: {
      data?: Record<string, unknown>;
      options?: CreateRequestOptions;
      uri?: string;
    } = {};

    const response = await invokeModule(
      'top_song',
      {
        cookie: 'MUSIC_U=top-song-cookie',
        type: 96,
      },
      {
        requestHandler: mockRequest(async (uri, data, options = {}) => {
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
        }),
      },
    );

    expect(captured.uri).toBe('/api/v1/discovery/new/songs');
    expect(captured.data).toEqual({
      areaId: 96,
      total: true,
    });
    expect(captured.options?.cookie).toEqual({
      MUSIC_U: 'top-song-cookie',
    });
    expect(response.status).toBe(200);
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

const readCookieRecord = (
  value: unknown,
): Record<string, string> | undefined => {
  if (!isStringRecord(value)) {
    return undefined;
  }

  return value;
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

const isStringRecord = (value: unknown): value is Record<string, string> =>
  isRecordLike(value) &&
  Object.values(value).every((entry) => typeof entry === 'string');
