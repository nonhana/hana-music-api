import { describe, expect, test } from 'bun:test';

import { Cause, Effect, Exit } from 'effect';

import { createHanaMusicApi } from '../../index.ts';
import {
  DeadlineExceeded,
  InvalidModuleInput,
  ProtocolFailed,
  TransportFailed,
  UnexpectedUpstreamShape,
  UpstreamBusinessFailed,
  UpstreamRateLimited,
} from '../../src/core/errors.ts';
import album from '../../src/modules/album.ts';
import batch from '../../src/modules/batch.ts';
import checkMusic from '../../src/modules/check_music.ts';
import cloudImport from '../../src/modules/cloud_import.ts';
import login from '../../src/modules/login.ts';
import loginCellphone from '../../src/modules/login_cellphone.ts';
import loginQrCheck from '../../src/modules/login_qr_check.ts';
import loginQrCreate from '../../src/modules/login_qr_create.ts';
import playlistSubscribe from '../../src/modules/playlist_subscribe.ts';
import playlistTrackAll from '../../src/modules/playlist_track_all.ts';
import playlistTracks from '../../src/modules/playlist_tracks.ts';
import registerAnonymous from '../../src/modules/register_anonimous.ts';
import songUrl from '../../src/modules/song_url.ts';
import verifyGetQr from '../../src/modules/verify_getQr.ts';
import type {
  RequestCapability,
  RequestIntent,
} from '../../src/types/index.ts';
import { runEffect, runExit } from '../_kit/it.ts';
import { executeModule, response } from '../fixtures/upload-effect.ts';

const requestFailures = [
  new TransportFailed({ message: 'socket failed' }),
  new DeadlineExceeded({ message: 'deadline' }),
  new UpstreamRateLimited({
    host: 'music.163.com',
    identity: 'test',
    status: 429,
    retryAfterMs: 30000,
  }),
];

describe('special Effect module behavior', () => {
  test('immutable call protocol overrides a module default protocol', async () => {
    const urls: Array<string> = [];
    const client = createHanaMusicApi({
      cookie: 'MUSIC_U=protocol',
      crypto: 'api',
      e_r: false,
      fetcher: async (url) => {
        urls.push(url instanceof Request ? url.url : url.toString());
        return Response.json({ code: 200 });
      },
    });
    await client.album({ id: 1 });
    expect(urls).toEqual(['https://interface.music.163.com/api/v1/album/1']);
  });

  test.each([playlistTracks, loginQrCheck])(
    'interruption escapes without a second request',
    async (module) => {
      let requests = 0;
      const exit = await runExit(
        executeModule(module, {}, () => {
          requests += 1;
          return Effect.interrupt;
        }),
      );
      expect(Exit.isFailure(exit) && Cause.hasInterrupts(exit.cause)).toBe(
        true,
      );
      expect(requests).toBe(1);
    },
  );

  test.each([
    { module: checkMusic, body: { code: 200, data: [{}] } },
    { module: songUrl, body: { data: [{}] } },
    { module: playlistTrackAll, body: { playlist: { trackIds: [{}] } } },
    { module: cloudImport, body: { data: [{}] } },
    { module: verifyGetQr, body: { data: {} } },
    { module: login, body: [] },
    { module: loginQrCheck, body: null },
  ])(
    'field readers reject malformed upstream data before continuing',
    async ({ module, body }) => {
      let requests = 0;
      const failure = await runEffect(
        executeModule(module, {}, () => {
          requests += 1;
          return Effect.succeed(response(body));
        }).pipe(Effect.flip),
      );
      expect(failure).toBeInstanceOf(UnexpectedUpstreamShape);
      expect(requests).toBe(1);
    },
  );

  test('playlist pagination decodes only the track identifiers it consumes', async () => {
    const intents: Array<RequestIntent> = [];
    const result = await runEffect(
      executeModule(
        playlistTrackAll,
        { id: 9, limit: 2, offset: 1 },
        (intent) => {
          intents.push(intent);
          return Effect.succeed(
            response(
              intents.length === 1
                ? {
                    playlist: {
                      trackIds: [
                        { unrelated: true },
                        { id: 2 },
                        { id: '3', future: true },
                      ],
                    },
                  }
                : ['opaque'],
            ),
          );
        },
      ),
    );
    expect(intents.map((intent) => JSON.parse(String(intent.body)))).toEqual([
      { id: 9, n: 100000, s: 8 },
      { c: '[{"id":2},{"id":3}]' },
    ]);
    expect(result.body).toEqual(['opaque']);
  });

  test('cloud import carries the decoded song identifier into publication', async () => {
    const intents: Array<RequestIntent> = [];
    const result = await runEffect(
      executeModule(
        cloudImport,
        {
          md5: 'hash',
          song: 'Song',
          fileType: 'mp3',
          bitrate: 320,
          fileSize: 2,
        },
        (intent) => {
          intents.push(intent);
          return Effect.succeed(
            response(
              intents.length === 1
                ? { data: [{ songId: 42, unused: true }] }
                : { imported: true },
            ),
          );
        },
      ),
    );
    expect(JSON.parse(String(intents[1]?.body))).toEqual({
      uploadType: 0,
      songs: JSON.stringify([
        {
          songId: 42,
          bitrate: 320,
          song: 'Song',
          artist: '未知',
          album: '未知',
          fileName: 'Song.mp3',
        },
      ]),
    });
    expect(intents.every((intent) => intent.semantic === 'upload')).toBe(true);
    expect(result.body).toEqual({ imported: true });
  });

  test.each([
    'mv_sub',
    'video_sub',
    'dj_sub',
    'follow',
    'resource_like',
    'comment_hug_list',
    'hug_comment',
    'like',
    'playlist_update',
    'broadcast_sub',
    'playlist_subscribe',
  ])(
    'normalization in %s cannot mutate frozen business input',
    async (identifier) => {
      const imported = await import(`../../src/modules/${identifier}.ts`);
      const input = Object.freeze({
        id: 1,
        t: 1,
        type: 0,
        sid: 2,
        mvid: 3,
        name: 'name',
        desc: 'description',
        tags: 'tag',
        like: 'false',
      });
      const result = await runEffect(
        executeModule(imported.default, input, () =>
          Effect.succeed(response({ code: 200 })),
        ),
      );
      expect(result.status).toBe(200);
      expect(input).toMatchObject({ t: 1, type: 0, like: 'false' });
    },
  );

  test.each([
    { identifier: 'playlist_tracks', input: { tracks: {} } },
    { identifier: 'user_cloud_detail', input: { id: [] } },
    {
      identifier: 'listentogether_sync_list_command',
      input: { randomList: [], displayList: '' },
    },
    { identifier: 'dj_program', input: { asc: {} } },
    { identifier: 'playlist_update', input: { id: {} } },
  ])(
    'invalid field types in $identifier fail before network',
    async ({ identifier, input }) => {
      const imported = await import(`../../src/modules/${identifier}.ts`);
      const failure = await runEffect(
        executeModule(imported.default, input, () =>
          Effect.die('No request expected'),
        ).pipe(Effect.flip),
      );
      expect(failure).toBeInstanceOf(InvalidModuleInput);
    },
  );

  test('request intent encodes only protocol options and leaves input untouched', async () => {
    const intents: Array<RequestIntent> = [];
    const input = Object.freeze({
      id: 1,
      t: 1,
      e_r: false,
      acceptGzip: true,
      headers: { 'X-Test': 'kept' },
      ua: 'test-agent',
      proxy: 'secret-proxy',
      timeoutMs: 17,
      signal: new AbortController().signal,
    });
    await runEffect(
      executeModule(playlistSubscribe, input, (intent) => {
        intents.push(intent);
        return Effect.succeed(response({ code: 200 }));
      }),
    );
    expect(intents).toHaveLength(1);
    expect(intents[0]).toEqual({
      target: '/api/playlist/subscribe',
      protocol: 'eapi',
      method: 'POST',
      headers: {
        'X-Test': 'kept',
        'User-Agent': 'test-agent',
        'x-aeapi': 'true',
      },
      body: JSON.stringify({ id: 1, e_r: false }),
      response: 'json',
      semantic: 'write',
    });
  });

  test('ordinary requests preserve arrays and primitive upstream bodies', async () => {
    for (const body of [null, 'opaque', [1, { field: true }]]) {
      const result = await runEffect(
        executeModule(album, { id: 1 }, () => Effect.succeed(response(body))),
      );
      expect(result.body).toEqual(body);
    }
  });

  test('playlist 512 retries exactly once with duplicated tracks', async () => {
    const intents: Array<RequestIntent> = [];
    const failure = new ProtocolFailed({
      message: '512',
      response: { ...response({ code: 512 }), status: 512 },
    });
    const request: RequestCapability = (intent) => {
      intents.push(intent);
      return intents.length === 1
        ? Effect.fail(failure)
        : Effect.succeed(response({ code: 200, recovered: true }));
    };
    const result = await runEffect(
      executeModule(
        playlistTracks,
        { op: 'add', pid: 1, tracks: '2,3' },
        request,
      ),
    );
    expect(result.body).toEqual({ code: 200, recovered: true });
    expect(intents.map((intent) => JSON.parse(String(intent.body)))).toEqual([
      { op: 'add', pid: 1, trackIds: '["2","3"]', imme: 'true' },
      { op: 'add', pid: 1, trackIds: '["2","3","2","3"]', imme: 'true' },
    ]);
    expect(intents.every((intent) => intent.semantic === 'write')).toBe(true);
  });

  test.each(requestFailures)(
    'playlist propagates $._tag without recovery',
    async (failure) => {
      let requests = 0;
      const request: RequestCapability = () => {
        requests += 1;
        return Effect.fail(failure);
      };
      const result = await runEffect(
        executeModule(playlistTracks, { tracks: '2' }, request).pipe(
          Effect.flip,
        ),
      );
      expect(result).toBe(failure);
      expect(requests).toBe(1);
    },
  );

  test('playlist propagates business failures other than 512', async () => {
    const failure = new ProtocolFailed({
      message: 'no access',
      response: { ...response({ code: 403 }), status: 403 },
    });
    const result = await runEffect(
      executeModule(playlistTracks, { tracks: '2' }, () =>
        Effect.fail(failure),
      ).pipe(Effect.flip),
    );
    expect(result).toBeInstanceOf(UpstreamBusinessFailed);
    expect(result).toMatchObject({ code: 403, response: failure.response });
  });

  test.each([800, 801, 802, 803])(
    'QR polling state %i stays a success value',
    async (code) => {
      const result = await runEffect(
        executeModule(loginQrCheck, { key: 'key' }, () =>
          Effect.succeed({
            ...response({ code, message: 'polling' }),
            cookie: ['MUSIC_U=qr'],
          }),
        ),
      );
      expect(result).toEqual({
        status: 200,
        cookie: ['MUSIC_U=qr'],
        body: { code, message: 'polling', cookie: 'MUSIC_U=qr' },
      });
    },
  );

  test.each(requestFailures)(
    'QR polling propagates $._tag',
    async (failure) => {
      const result = await runEffect(
        executeModule(loginQrCheck, { key: 'key' }, () =>
          Effect.fail(failure),
        ).pipe(Effect.flip),
      );
      expect(result).toBe(failure);
    },
  );

  test.each([
    {
      module: login,
      credential: 'MUSIC_U',
      input: { email: 'test', password: 'test' },
    },
    {
      module: loginCellphone,
      credential: 'MUSIC_U',
      input: { phone: '1', password: 'test' },
    },
    { module: registerAnonymous, credential: 'MUSIC_A', input: {} },
  ])(
    '$credential is decoded from a successful login response',
    async ({ module, credential, input }) => {
      const result = await runEffect(
        executeModule(module, input, () =>
          Effect.succeed({
            ...response({
              code: 200,
              profile: { avatarImgId_str: 'image' },
              future: ['kept'],
            }),
            cookie: [`${credential}=token; Path=/`],
          }),
        ),
      );
      expect(result.cookie).toEqual([`${credential}=token; Path=/`]);
      expect(result.body).toMatchObject({
        code: 200,
        cookie: `${credential}=token; Path=/`,
        future: ['kept'],
      });
    },
  );

  test.each([login, loginCellphone, registerAnonymous])(
    'missing credentials fail through a verified decoder',
    async (module) => {
      const result = await runEffect(
        executeModule(module, {}, () =>
          Effect.succeed(response({ code: 200 })),
        ).pipe(Effect.flip),
      );
      expect(result).toBeInstanceOf(UnexpectedUpstreamShape);
    },
  );

  test('batch forwards only API entries and preserves opaque bodies', async () => {
    const intents: Array<RequestIntent> = [];
    const body = { code: 200, future: [null, { field: 'kept' }] };
    const result = await runEffect(
      executeModule(
        batch,
        { '/api/search/get': { s: 'song' }, ignored: true },
        (intent) => {
          intents.push(intent);
          return Effect.succeed(response(body));
        },
      ),
    );
    expect(JSON.parse(String(intents[0]?.body))).toEqual({
      '/api/search/get': { s: 'song' },
    });
    expect(result.body).toEqual(body);
  });

  test('QR image computation stays local', async () => {
    const result = await runEffect(
      executeModule(loginQrCreate, { key: 'key', qrimg: true }, () =>
        Effect.die('No network expected'),
      ),
    );
    expect(result.body).toMatchObject({
      code: 200,
      data: {
        qrurl: 'https://music.163.com/login?codekey=key',
        qrimg: expect.stringContaining('data:image/png;base64,'),
      },
    });
  });
});
