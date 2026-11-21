import { describe, expect, test } from 'bun:test';

import { loginCellphone } from '../../../src/sdk/api/login_cellphone.ts';
import { search } from '../../../src/sdk/api/search.ts';
import {
  songDetail,
  SongDetailBody,
} from '../../../src/sdk/api/song_detail.ts';
import {
  createClient,
  createOption,
  generateDeviceId,
  getNcmFailureInfo,
  isNcmApiResponse,
} from '../../../src/sdk/core.ts';
import { LoginCellphoneRiskBody } from '../../../src/sdk/schemas.ts';
import { SongDetailBody as StandaloneSongDetailBody } from '../../../src/sdk/schemas/song_detail.ts';
import * as utils from '../../../src/sdk/utils.ts';
import { validateSync } from '../../_kit/assertions.ts';
import songDetailPrivileges from '../../fixtures/netease/library/song_detail.privileges.json';
import smsRisk from '../../fixtures/netease/login/login_cellphone.10004-risk.json';

describe('scoped client and subpath entrypoints', () => {
  test('createClient binds only passed modules and shares ReadStore cache and default config', async () => {
    let fetches = 0;
    const cookies: Array<string | null> = [];
    const fetcher = async (
      _input: Request | URL | string,
      init?: RequestInit,
    ) => {
      fetches += 1;
      cookies.push(new Headers(init?.headers).get('cookie'));
      return Response.json({
        code: 200,
        songs: [{ id: 123, name: 'Song' }],
        privileges: [{ id: 123 }],
      });
    };

    const client = createClient(
      { songDetail, search },
      {
        cookie: 'MUSIC_U=scoped-client-session',
        cache: { enabled: true, ttlMs: 60_000 },
        fetcher,
      },
    );

    expect(Object.keys(client).toSorted()).toEqual(['search', 'songDetail']);

    const first = await client.songDetail({ ids: [123] });
    const second = await client.songDetail({ ids: [123] });

    expect(first.status).toBe(200);
    expect(second.body).toEqual(first.body);
    expect(fetches).toBe(1);
    expect(cookies[0]).toContain('MUSIC_U=scoped-client-session');
  });

  test('createClient supports custom property names and per-call config overrides', async () => {
    const cookies: Array<string | null> = [];
    const client = createClient(
      { fetchSongs: songDetail, loginByPhone: loginCellphone },
      {
        cookie: 'MUSIC_U=default-cookie',
        fetcher: async (_input, init) => {
          cookies.push(new Headers(init?.headers).get('cookie'));
          return Response.json({ code: 200, songs: [], privileges: [] });
        },
      },
    );

    await client.fetchSongs(
      { ids: [1] },
      { cookie: 'MUSIC_U=override-cookie' },
    );

    expect(cookies).toHaveLength(1);
    expect(cookies[0]).toContain('MUSIC_U=override-cookie');
    expect(cookies[0]).not.toContain('default-cookie');
  });

  test('createClient shares one identityPool across all bound modules and validates pool config', async () => {
    let anonymousRegistrations = 0;
    const seenCookies: Array<string> = [];
    const fetcher = async (
      input: Request | URL | string,
      init?: RequestInit,
    ) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url.includes('/register/anonimous')) {
        anonymousRegistrations += 1;
        return new Response(
          JSON.stringify({
            code: 200,
            userId: 1001,
            createTime: Date.now(),
          }),
          {
            headers: {
              'content-type': 'application/json',
              'set-cookie': `MUSIC_A=pooled-anon-${String(anonymousRegistrations)}; Path=/`,
            },
          },
        );
      }
      seenCookies.push(new Headers(init?.headers).get('cookie') ?? '');
      if (url.includes('/song/detail')) {
        return Response.json({
          code: 200,
          songs: [{ id: 123 }],
          privileges: [{ id: 123 }],
        });
      }
      return Response.json({
        code: 200,
        result: { songs: [] },
      });
    };

    const client = createClient(
      { songDetail, search },
      {
        identityPool: { size: 1 },
        fetcher,
      },
    );

    const detailResult = await client.songDetail({ ids: [123] });
    const searchResult = await client.search({ keywords: 'pool' });

    expect(detailResult.status).toBe(200);
    expect(searchResult.status).toBe(200);
    expect(anonymousRegistrations).toBe(1);
    expect(seenCookies).toHaveLength(2);
    expect(seenCookies[0]).toContain('MUSIC_A=pooled-anon-1');
    expect(seenCookies[1]).toContain('MUSIC_A=pooled-anon-1');
    expect(() =>
      createClient({ songDetail }, { identityPool: { size: 0 } }),
    ).toThrow(TypeError);
  });

  test('createClient rejects invalid default config or invalid module entries synchronously with TypeError', () => {
    expect(() =>
      createClient(
        { songDetail },
        // @ts-expect-error Removed execution keys must be rejected at construction time.
        { crypto: 'api' },
      ),
    ).toThrow(TypeError);

    expect(() =>
      createClient(
        // @ts-expect-error Non-object module maps must be rejected.
        null,
      ),
    ).toThrow(TypeError);

    expect(() =>
      createClient(
        // @ts-expect-error Array module maps must be rejected.
        [songDetail],
      ),
    ).toThrow(TypeError);

    expect(() =>
      createClient({
        notAModule: async () => ({ status: 200, cookie: [], body: {} }),
      }),
    ).toThrow(TypeError);

    const protoCarrier = Object.defineProperty({}, '__proto__', {
      configurable: true,
      enumerable: true,
      value: songDetail,
    }) as Record<string, typeof songDetail>;
    const boundProtoCarrier = createClient(protoCarrier);
    expect(Object.getPrototypeOf(boundProtoCarrier)).toBe(Object.prototype);
    expect(Object.hasOwn(boundProtoCarrier, '__proto__')).toBe(true);
  });

  test('standalone api, schemas, core, and utils entrypoints work without registry coupling', async () => {
    const result = await songDetail(
      { ids: [42] },
      {
        cookie: 'MUSIC_U=standalone',
        fetcher: async () =>
          Response.json({
            code: 200,
            songs: [{ id: 42 }],
            privileges: [{ id: 42 }],
          }),
      },
    );
    expect(result.status).toBe(200);
    expect(result.body.songs[0]?.id).toBe(42);

    expect(SongDetailBody).toBe(StandaloneSongDetailBody);
    expect(
      validateSync(StandaloneSongDetailBody, songDetailPrivileges.response.body)
        .issues,
    ).toBeUndefined();
    expect(
      validateSync(LoginCellphoneRiskBody, smsRisk.response.body).issues,
    ).toBeUndefined();

    expect(utils.generateDeviceId).toBe(generateDeviceId);
    expect(utils.isNcmApiResponse).toBe(isNcmApiResponse);
    expect(utils.getNcmFailureInfo).toBe(getNcmFailureInfo);
    expect(utils.createOption).toBe(createOption);
    expect(utils.generateDeviceId()).toMatch(/^[0-9A-F]{52}$/);
    expect(utils.createOption({ timeoutMs: '2500' }, 'eapi')).toMatchObject({
      crypto: 'eapi',
      timeoutMs: 2500,
    });
  });
});
