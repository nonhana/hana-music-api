import { describe, expect, test } from 'bun:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { invokeModule } from '../../../src/app/module-api.ts';
import { loadModuleDefinitions } from '../../../src/server/module-loader.ts';
import type { FetchLike, ModuleCallConfig } from '../../../src/types/index.ts';
import { testEntropy } from '../../_kit/harness/sdk.ts';
import type { ApiWireMetadata } from '../../_kit/upstream/api.ts';
import { withApiScenario } from '../../_kit/upstream/api.ts';

const REAL_MODULES_DIRECTORY = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../src/modules',
);
const realModuleDefinitionsPromise = loadModuleDefinitions(
  REAL_MODULES_DIRECTORY,
);

describe('phase 5 module regression suite', () => {
  test('should keep search and voice-search request shapes aligned with legacy behavior', async () => {
    await withRequestSpy(
      [
        'https://interface.music.163.com/eapi/search/get',
        'https://interface.music.163.com/eapi/search/voice/get',
      ],
      (uri) => ({
        body: {
          code: 200,
          route: uri,
        },
        cookie: [],
        status: 200,
      }),
      async (requestSpy) => {
        await invokeRealModule(
          'search',
          {
            keywords: '周杰伦',
            limit: 20,
            offset: 5,
          },
          requestSpy.fetcher,
        );

        await invokeRealModule(
          'search',
          {
            keywords: '语音搜索',
            type: '2000',
          },
          requestSpy.fetcher,
        );

        for (const call of requestSpy.calls) {
          expect(call.options.cookie).not.toHaveProperty('MUSIC_U');
          expect(call.options.cookie).not.toHaveProperty('MUSIC_A');
        }
        expect(requestSpy.calls).toHaveLength(2);
        expect(requestSpy.calls[0]).toEqual({
          data: {
            limit: 20,
            offset: 5,
            s: '周杰伦',
            type: 1,
          },
          options: expect.objectContaining({
            cookie: expect.any(Object),
            crypto: 'eapi',
            headers: expect.objectContaining({
              'content-type': 'application/x-www-form-urlencoded',
            }),
            signal: expect.any(AbortSignal),
          }),
          uri: '/api/search/get',
        });
        expect(requestSpy.calls[1]).toEqual({
          data: {
            keyword: '语音搜索',
            limit: 30,
            offset: 0,
            scene: 'normal',
          },
          options: expect.objectContaining({
            cookie: expect.any(Object),
            crypto: 'eapi',
            headers: expect.objectContaining({
              'content-type': 'application/x-www-form-urlencoded',
            }),
            signal: expect.any(AbortSignal),
          }),
          uri: '/api/search/voice/get',
        });
      },
    );
  });

  test('should preserve song_url ordering and playlist_detail request shape', async () => {
    const fakePlaylist = {
      id: 123,
      name: 'playlist',
      coverImgUrl: 'https://p1.music.126.net/cover.jpg',
      trackCount: 2,
      trackIds: [{ id: 1 }, { id: 2 }],
      creator: { userId: 1, nickname: 'listener' },
      subscribed: false,
      updateTime: 0,
      trackUpdateTime: 0,
      description: null,
      tags: [],
      playCount: 0,
      status: 0,
      privacy: 0,
      specialType: 0,
    };
    await withRequestSpy(
      [
        'https://interface.music.163.com/eapi/song/enhance/player/url',
        'https://interface.music.163.com/eapi/v6/playlist/detail',
      ],
      (uri) => {
        if (uri === '/api/song/enhance/player/url') {
          return {
            body: {
              code: 200,
              data: [
                { id: 2, url: 'second', code: 200 },
                { id: 1, url: 'first', code: 200 },
              ],
            },
            cookie: [],
            status: 200,
          };
        }

        return {
          body: {
            code: 200,
            playlist: fakePlaylist,
          },
          cookie: [],
          status: 200,
        };
      },
      async (requestSpy) => {
        const songUrl = await invokeRealModule(
          'song_url',
          {
            ids: [1, 2],
            br: 320000,
          },
          requestSpy.fetcher,
        );
        const playlistDetail = await invokeRealModule(
          'playlist_detail',
          {
            id: '123',
          },
          requestSpy.fetcher,
        );

        for (const call of requestSpy.calls) {
          expect(call.options.cookie).not.toHaveProperty('MUSIC_U');
          expect(call.options.cookie).not.toHaveProperty('MUSIC_A');
        }
        expect(requestSpy.calls[0]).toEqual({
          data: {
            br: 320000,
            ids: '["1","2"]',
          },
          options: expect.objectContaining({
            cookie: expect.any(Object),
            crypto: 'eapi',
            signal: expect.any(AbortSignal),
          }),
          uri: '/api/song/enhance/player/url',
        });
        expect(requestSpy.calls[1]).toEqual({
          data: {
            id: '123',
            n: 100000,
            s: 8,
          },
          options: expect.objectContaining({
            cookie: expect.any(Object),
            crypto: 'eapi',
            headers: expect.objectContaining({
              'content-type': 'application/x-www-form-urlencoded',
            }),
            signal: expect.any(AbortSignal),
          }),
          uri: '/api/v6/playlist/detail',
        });
        expect(readArrayProperty(songUrl.body, 'data')).toEqual([
          { id: 1, url: 'first', code: 200 },
          { id: 2, url: 'second', code: 200 },
        ]);
        expect(readRecordProperty(playlistDetail.body, 'playlist')).toEqual(
          fakePlaylist,
        );
      },
    );
  });

  test('should keep user_account on weapi and retain cookie semantics', async () => {
    await withRequestSpy(
      ['https://music.163.com/weapi/nuser/account/get'],
      () => ({
        body: {
          code: 200,
          account: { id: 1, anonimousUser: false, vipType: 0 },
          profile: {
            userId: 1,
            nickname: 'hana',
            avatarUrl: 'https://p1.music.126.net/a.jpg',
            vipType: 0,
          },
        },
        cookie: ['MUSIC_U=upstream-account; Path=/'],
        status: 200,
      }),
      async (requestSpy) => {
        const response = await invokeRealModule(
          'user_account',
          {},
          requestSpy.fetcher,
          { cookie: 'MUSIC_U=phase5-cookie' },
        );

        expect(requestSpy.calls).toEqual([
          {
            data: {},
            options: expect.objectContaining({
              cookie: expect.objectContaining({
                MUSIC_U: 'phase5-cookie',
              }),
              crypto: 'weapi',
              signal: expect.any(AbortSignal),
            }),
            uri: '/api/nuser/account/get',
          },
        ]);
        expect(response.cookie).toEqual(['MUSIC_U=upstream-account; Path=/']);
        expect(readRecordProperty(response.body, 'profile')).toEqual({
          userId: 1,
          nickname: 'hana',
          avatarUrl: 'https://p1.music.126.net/a.jpg',
          vipType: 0,
        });
      },
    );
  });

  test('should preserve login_cellphone request body and success normalization', async () => {
    await withRequestSpy(
      ['https://music.163.com/weapi/w/login/cellphone'],
      () => ({
        body: {
          avatarImgId_str: 'avatar-id',
          code: 200,
          account: { id: 1 },
          profile: {
            userId: 1,
            nickname: 'hana',
            avatarUrl: 'https://p1.music.126.net/a.jpg',
          },
        },
        cookie: ['MUSIC_U=login-cookie; Path=/', '__csrf=token; Path=/'],
        status: 200,
      }),
      async (requestSpy) => {
        const response = await invokeRealModule(
          'login_cellphone',
          {
            password: 'secret',
            phone: '13800138000',
          },
          requestSpy.fetcher,
        );

        for (const call of requestSpy.calls) {
          expect(call.options.cookie).not.toHaveProperty('MUSIC_U');
          expect(call.options.cookie).not.toHaveProperty('MUSIC_A');
        }
        expect(requestSpy.calls).toEqual([
          {
            data: {
              countrycode: '86',
              https: 'true',
              password: '5ebe2294ecd0e0f08eab7690d2a6ee69',
              phone: '13800138000',
              remember: 'true',
              type: '1',
            },
            options: expect.objectContaining({
              cookie: expect.any(Object),
              crypto: 'weapi',
              signal: expect.any(AbortSignal),
            }),
            uri: '/api/w/login/cellphone',
          },
        ]);
        expect(readStringProperty(response.body, 'avatarImgIdStr')).toBe(
          'avatar-id',
        );
        expect(readStringProperty(response.body, 'cookie')).toBe(
          'MUSIC_U=login-cookie; Path=/;__csrf=token; Path=/',
        );
      },
    );
  });

  test('should keep login_qr_create local qr generation behavior', async () => {
    const response = await invokeRealModule(
      'login_qr_create',
      { key: 'qr-key', platform: 'web', qrimg: true },
      undefined,
      { cookie: 'sDeviceId=device-phase5' },
    );

    const bodyData = readRecordProperty(response.body, 'data');
    const qrurl = readStringProperty(bodyData, 'qrurl');
    const qrimg = readStringProperty(bodyData, 'qrimg');

    expect(qrurl).toMatch(
      /^https:\/\/music\.163\.com\/login\?codekey=qr-key&chainId=v1_device-phase5_web_login_\d+$/,
    );
    expect(qrimg.startsWith('data:image/png;base64,')).toBe(true);
  });

  test('should keep batch filtering only legacy /api-prefixed subrequests', async () => {
    await withRequestSpy(
      ['https://interface.music.163.com/eapi/batch'],
      () => ({
        body: {
          code: 200,
        },
        cookie: [],
        status: 200,
      }),
      async (requestSpy) => {
        await invokeRealModule(
          'batch',
          {
            '/api/song/detail': {
              c: '[{"id":"1"}]',
            },
            '/api/user/account': {},
            shouldIgnore: true,
          },
          requestSpy.fetcher,
        );

        for (const call of requestSpy.calls) {
          expect(call.options.cookie).not.toHaveProperty('MUSIC_U');
          expect(call.options.cookie).not.toHaveProperty('MUSIC_A');
        }
        expect(requestSpy.calls).toEqual([
          {
            data: {
              '/api/song/detail': {
                c: '[{"id":"1"}]',
              },
              '/api/user/account': {},
            },
            options: expect.objectContaining({
              cookie: expect.any(Object),
              crypto: 'eapi',
              signal: expect.any(AbortSignal),
            }),
            uri: '/api/batch',
          },
        ]);
      },
    );
  });

  test('should keep daily_signin and personal_fm request contracts', async () => {
    await withRequestSpy(
      [
        'https://interface.music.163.com/eapi/point/dailyTask',
        'https://music.163.com/weapi/v1/radio/get',
      ],
      (uri) => {
        if (uri === '/api/point/dailyTask') {
          return {
            body: {
              code: 301,
            },
            cookie: [],
            status: 200,
          };
        }

        return {
          body: {
            code: 200,
            data: [],
          },
          cookie: [],
          status: 200,
        };
      },
      async (requestSpy) => {
        try {
          await invokeRealModule(
            'daily_signin',
            { type: 1 },
            requestSpy.fetcher,
            { cookie: 'MUSIC_U=signed-in' },
          );
          throw new TypeError(
            'Expected daily_signin to preserve the legacy 301 response',
          );
        } catch (error) {
          expect(error).toEqual({
            body: {
              code: 301,
            },
            cookie: [],
            status: 301,
          });
        }

        const personalFm = await invokeRealModule(
          'personal_fm',
          {},
          requestSpy.fetcher,
          { cookie: 'MUSIC_U=fm-cookie' },
        );

        expect(requestSpy.calls).toEqual([
          {
            data: {
              type: 1,
            },
            options: expect.objectContaining({
              cookie: expect.objectContaining({
                MUSIC_U: 'signed-in',
              }),
              crypto: 'eapi',
              signal: expect.any(AbortSignal),
            }),
            uri: '/api/point/dailyTask',
          },
          {
            data: {},
            options: expect.objectContaining({
              cookie: expect.objectContaining({
                MUSIC_U: 'fm-cookie',
              }),
              crypto: 'weapi',
              signal: expect.any(AbortSignal),
            }),
            uri: '/api/v1/radio/get',
          },
        ]);
        expect(personalFm.status).toBe(200);
        expect(readArrayProperty(personalFm.body, 'data')).toEqual([]);
      },
    );
  });

  test('should keep voice_upload missing-file validation on the legacy error contract', async () => {
    try {
      await invokeRealModule('voice_upload', {});
      throw new TypeError(
        'Expected voice_upload to reject when songFile is missing',
      );
    } catch (error) {
      expect(error).toEqual({
        body: {
          code: 500,
          msg: '请上传音频文件',
        },
        cookie: [],
        status: 500,
      });
    }
  });
});

interface CapturedRequest {
  readonly data: Record<string, unknown>;
  readonly options: ApiWireMetadata;
  readonly uri: string;
}

const withRequestSpy = (
  targets: ReadonlyArray<string>,
  responder: (
    uri: string,
    data: Record<string, unknown>,
    options: ApiWireMetadata,
  ) => PromiseLikeReturn | Promise<PromiseLikeReturn>,
  work: (spy: {
    calls: Array<CapturedRequest>;
    fetcher: FetchLike;
  }) => Promise<void>,
) => {
  const calls: Array<CapturedRequest> = [];
  return withApiScenario(
    targets,
    async ({ path: uri, data, ...options }) => {
      calls.push({ uri, data, options });
      return responder(uri, data, options);
    },
    (fetcher) => work({ calls, fetcher }),
  );
};

const invokeRealModule = async (
  identifier: string,
  query: Record<string, unknown>,
  fetcher?: FetchLike,
  config: ModuleCallConfig = { cookie: '', state: { anonymousToken: '' } },
) => {
  const moduleDefinitions = await realModuleDefinitionsPromise;

  return invokeModule(
    identifier,
    query,
    {
      moduleDefinitions,
    },
    { ...config, fetcher: fetcher ?? config.fetcher },
    { entropy: testEntropy },
  );
};

type PromiseLikeReturn = {
  readonly body: Record<string, unknown>;
  readonly cookie: Array<string>;
  readonly status: number;
};

const readArrayProperty = (value: unknown, key: string): Array<unknown> => {
  if (!isRecordLike(value) || !Array.isArray(value[key])) {
    throw new TypeError(
      'Expected response body to contain an array data field',
    );
  }

  return value[key];
};

const readRecordProperty = (
  value: unknown,
  key: string,
): Record<string, unknown> => {
  if (!isRecordLike(value) || !isRecordLike(value[key])) {
    throw new TypeError(`Expected "${key}" to be an object property`);
  }

  return value[key];
};

const readStringProperty = (value: unknown, key: string): string => {
  if (!isRecordLike(value) || typeof value[key] !== 'string') {
    throw new TypeError(`Expected "${key}" to be a string property`);
  }

  return value[key];
};

const isRecordLike = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;
