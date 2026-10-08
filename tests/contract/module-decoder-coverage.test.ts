import { expect, test } from 'bun:test';

import { Effect, Exit } from 'effect';

import { createHanaMusicApi } from '../../index.ts';
import { invokeModule } from '../../src/app/module-api.ts';
import { InvalidModuleInput } from '../../src/core/errors.ts';
import { sdkModuleRegistry } from '../../src/sdk/generated/registry.generated.ts';
import { createServer } from '../../src/server/create-server.ts';
import type { ModuleDefinition, ModuleQuery } from '../../src/types/index.ts';
import { response, songFile } from '../fixtures/upload-effect.ts';

const contracts: Array<{
  modules: Array<string>;
  valid: ModuleQuery;
  required: Array<string>;
}> = [
  {
    modules: [
      'album',
      'album_detail',
      'album_detail_dynamic',
      'album_privilege',
      'artist_desc',
      'artist_detail',
      'artist_detail_dynamic',
      'artist_top_song',
      'artists',
    ],
    valid: { id: 'id' },
    required: ['id'],
  },
  {
    modules: ['album_list', 'album_new'],
    valid: { area: 'future-area', type: '2', limit: '10', offset: 0 },
    required: [],
  },
  {
    modules: ['album_list_style'],
    valid: { area: 'future-style', limit: '10', offset: 0 },
    required: [],
  },
  {
    modules: [
      'album_newest',
      'image_upload_token',
      'register_anonimous',
      'user_account',
      'user_level',
      'user_subcount',
    ],
    valid: {},
    required: [],
  },
  {
    modules: ['album_songsaleboard'],
    valid: { albumType: '1', type: 'future-board', year: 2026 },
    required: [],
  },
  {
    modules: ['album_sub', 'artist_sub'],
    valid: { id: 1, t: '1' },
    required: ['id', 't'],
  },
  {
    modules: ['album_sublist', 'artist_sublist'],
    valid: { limit: '10', offset: 0 },
    required: [],
  },
  {
    modules: ['artist_album', 'artist_mv'],
    valid: { id: 1, limit: '10', offset: 0 },
    required: ['id'],
  },
  {
    modules: ['artist_songs'],
    valid: { id: 1, limit: '10', offset: 0, order: 'future-order' },
    required: ['id'],
  },
  {
    modules: ['audio_match'],
    valid: { audioFP: 'fingerprint', duration: '2.5' },
    required: ['audioFP', 'duration'],
  },
  { modules: ['avatar_upload'], valid: { imgFile: songFile }, required: [] },
  {
    modules: ['batch'],
    valid: { '/api/song/detail': { future: { nested: [null, true, 3] } } },
    required: [],
  },
  {
    modules: ['check_music', 'song_url'],
    valid: { id: 'id', br: '128000' },
    required: ['id'],
  },
  { modules: ['cloud'], valid: { songFile }, required: [] },
  {
    modules: ['cloud_import'],
    valid: {
      album: 'album',
      artist: 'artist',
      bitrate: '320',
      fileSize: 2,
      fileType: 'mp3',
      id: 1,
      md5: 'hash',
      song: 'song',
    },
    required: [],
  },
  {
    modules: ['comment'],
    valid: {
      id: 1,
      type: '99',
      commentId: 'comment',
      content: 'text',
      t: '2',
      threadId: 'thread',
    },
    required: ['id', 'type', 't'],
  },
  {
    modules: [
      'comment_album',
      'comment_dj',
      'comment_music',
      'comment_mv',
      'comment_playlist',
      'comment_video',
    ],
    valid: { id: 'id', limit: '10', offset: 0, before: '1' },
    required: ['id'],
  },
  {
    modules: ['comment_event'],
    valid: { before: '1', limit: '10', offset: 0, threadId: 'thread' },
    required: ['threadId'],
  },
  {
    modules: ['comment_floor'],
    valid: {
      id: 1,
      type: '99',
      limit: '10',
      parentCommentId: 'comment',
      time: '1',
    },
    required: ['id', 'type', 'parentCommentId'],
  },
  {
    modules: ['comment_hot'],
    valid: { id: 1, type: '99', before: '1', limit: '10', offset: 0 },
    required: ['id', 'type'],
  },
  {
    modules: ['comment_like'],
    valid: { id: 1, type: '99', cid: 'comment', t: '1', threadId: 'thread' },
    required: ['id', 'type', 'cid', 't'],
  },
  {
    modules: ['comment_new'],
    valid: {
      id: 1,
      type: '99',
      cursor: 'cursor',
      pageNo: '2',
      pageSize: 5,
      showInner: true,
      sortType: '3',
    },
    required: ['id', 'type'],
  },
  {
    modules: ['login'],
    valid: { email: 'email', password: 'password', md5_password: 'hash' },
    required: ['email'],
  },
  {
    modules: ['login_cellphone'],
    valid: {
      phone: 'phone',
      countrycode: '86',
      password: 'password',
      md5_password: 'hash',
      captcha: 'code',
    },
    required: ['phone'],
  },
  { modules: ['login_qr_check'], valid: { key: 'key' }, required: ['key'] },
  {
    modules: ['login_qr_create'],
    valid: { key: 'key', platform: 'future-platform', qrimg: 'yes' },
    required: ['key'],
  },
  { modules: ['lyric'], valid: { id: 1 }, required: [] },
  {
    modules: ['playlist_cover_update'],
    valid: { imgFile: songFile, imgId: 'img', id: 'id' },
    required: [],
  },
  { modules: ['playlist_detail'], valid: { id: 1, s: '8' }, required: ['id'] },
  {
    modules: ['playlist_track_all'],
    valid: { id: 1, s: '8', limit: '10', offset: 0 },
    required: ['id'],
  },
  {
    modules: ['register_cellphone'],
    valid: {
      captcha: 'code',
      countrycode: '86',
      nickname: 'name',
      password: 'password',
      phone: 'phone',
    },
    required: ['captcha', 'nickname', 'password', 'phone'],
  },
  {
    modules: ['search'],
    valid: { keywords: 'music', type: '99', limit: '10', offset: 0 },
    required: ['keywords'],
  },
  { modules: ['song_detail'], valid: { ids: '1,2' }, required: [] },
  {
    modules: ['song_url_v1'],
    valid: { id: 1, level: 'lossless' },
    required: ['id'],
  },
  {
    modules: ['user_audio', 'user_detail'],
    valid: { uid: 'id' },
    required: ['uid'],
  },
  {
    modules: ['user_dj', 'user_followeds', 'user_follows', 'user_playlist'],
    valid: { uid: 1, limit: '10', offset: 0 },
    required: ['uid'],
  },
  {
    modules: ['user_event'],
    valid: { uid: 1, limit: '10', offset: 0, lasttime: '1' },
    required: ['uid'],
  },
  {
    modules: ['user_follow_mixed'],
    valid: { cursor: '1', scene: '2', size: 5 },
    required: [],
  },
  { modules: ['user_record'], valid: { uid: 1, type: '1' }, required: ['uid'] },
  {
    modules: ['verify_getQr'],
    valid: {
      evid: 'evid',
      sign: 'sign',
      token: 'token',
      type: 'arbitrary-type',
      vid: 'vid',
    },
    required: [],
  },
  {
    modules: ['voice_upload'],
    valid: {
      autoPublish: 'false',
      autoPublishText: 'text',
      categoryId: 1,
      composedSongs: 'songs',
      coverImgId: 'cover',
      description: 'description',
      orderNo: '1',
      privacy: 0,
      publishTime: '0',
      secondCategoryId: 'category',
      songFile,
      songName: 'song',
      voiceListId: 'list',
    },
    required: [],
  },
];

const cases = contracts.flatMap(({ modules, ...contract }) =>
  modules.map((identifier) => ({ identifier, ...contract })),
);
const definitions = sdkModuleRegistry as unknown as Record<
  string,
  ModuleDefinition
>;

test('confirmed decoder cases cover exactly the 68 confirmed modules', () => {
  expect(new Set(cases.map(({ identifier }) => identifier)).size).toBe(68);
});

test('all 284 legacy decoders preserve unknown nested input and require plain objects', () => {
  const confirmed = new Set(cases.map(({ identifier }) => identifier));
  const legacy = Object.entries(definitions).filter(
    ([identifier]) => !confirmed.has(identifier),
  );
  expect(legacy).toHaveLength(284);
  const input = {
    future: { nested: [null, 'kept', { enabled: true }] },
    custom: 7,
  };
  for (const [, definition] of legacy) {
    expect(Effect.runSync(definition.decodeInput(input))).toBe(input);
    for (const invalid of [null, [], new Date()]) {
      expect(
        Effect.runSync(definition.decodeInput(invalid).pipe(Effect.flip)),
      ).toBeInstanceOf(InvalidModuleInput);
    }
  }
});

test.each(cases)(
  '$identifier validates every established field and required key',
  ({ identifier, valid, required }) => {
    const decode = definitions[identifier]!.decodeInput;
    expect(typeof decode).toBe('function');
    if (!decode) {
      return;
    }
    expect(
      Effect.runSync(decode({ ...valid, unknownFutureField: true })),
    ).toEqual(valid);
    for (const field of Object.keys(valid)) {
      const failure = Effect.runSyncExit(decode({ ...valid, [field]: [] }));
      expect(Exit.isFailure(failure)).toBe(true);
      const without = { ...valid };
      delete without[field];
      const omitted = Effect.runSyncExit(decode(without));
      expect(Exit.isFailure(omitted)).toBe(required.includes(field));
    }
    for (const input of [null, [], 'string', 1, new Date()]) {
      const failure = Effect.runSync(decode(input).pipe(Effect.flip));
      expect(failure).toBeInstanceOf(InvalidModuleInput);
    }
  },
);

test.each(['login', 'login_cellphone'])(
  '%s requires one complete credential alternative',
  (identifier) => {
    const decode = definitions[identifier]!.decodeInput;
    expect(typeof decode).toBe('function');
    if (!decode) {
      return;
    }
    const identity =
      identifier === 'login' ? { email: 'user' } : { phone: '123' };
    expect(Exit.isFailure(Effect.runSyncExit(decode(identity)))).toBe(true);
    for (const credential of [
      { password: 'password' },
      { md5_password: 'hash' },
      ...(identifier === 'login_cellphone' ? [{ captcha: 'code' }] : []),
    ]) {
      expect(Effect.runSync(decode({ ...identity, ...credential }))).toEqual({
        ...identity,
        ...credential,
      });
    }
  },
);

test('upload decoder validates bytes and file metadata without requiring optional uploads', () => {
  const decode = definitions.voice_upload!.decodeInput;
  expect(typeof decode).toBe('function');
  if (!decode) {
    return;
  }
  for (const data of [
    new Uint8Array([1]),
    Buffer.from([1]),
    new ArrayBuffer(1),
  ]) {
    const file = { ...songFile, data, md5: 'hash' };
    expect(Effect.runSync(decode({ songFile: file }))).toEqual({
      songFile: file,
    });
  }
  for (const file of [
    { ...songFile, data: 'text' },
    { ...songFile, name: 1 },
    { data: songFile.data },
  ]) {
    expect(Exit.isFailure(Effect.runSyncExit(decode({ songFile: file })))).toBe(
      true,
    );
  }
  expect(Effect.runSync(decode({}))).toEqual({});
});

test('closed literal unions reject only values excluded by the public input types', () => {
  for (const identifier of ['album_sub', 'artist_sub', 'comment_like']) {
    const valid = cases.find((entry) => entry.identifier === identifier)!.valid;
    for (const value of [0, 1, '0', '1']) {
      expect(
        Exit.isSuccess(
          Effect.runSyncExit(
            definitions[identifier]!.decodeInput({ ...valid, t: value }),
          ),
        ),
      ).toBe(true);
    }
    expect(
      Exit.isFailure(
        Effect.runSyncExit(
          definitions[identifier]!.decodeInput({ ...valid, t: 2 }),
        ),
      ),
    ).toBe(true);
  }
  for (const [identifier, field, valid, allowed, invalid] of [
    ['comment', 't', { id: 1, type: 0 }, [0, 1, 2, '0', '1', '2'], 3],
    ['user_record', 'type', { uid: 1 }, [0, 1, '0', '1'], 2],
    ['user_follow_mixed', 'scene', {}, [0, 1, 2, '0', '1', '2'], 3],
    [
      'song_url_v1',
      'level',
      { id: 1 },
      [
        'standard',
        'higher',
        'exhigh',
        'lossless',
        'hires',
        'jyeffect',
        'sky',
        'jymaster',
      ],
      'future',
    ],
  ] as const) {
    for (const value of allowed) {
      expect(
        Exit.isSuccess(
          Effect.runSyncExit(
            definitions[identifier]!.decodeInput({ ...valid, [field]: value }),
          ),
        ),
      ).toBe(true);
    }
    expect(
      Exit.isFailure(
        Effect.runSyncExit(
          definitions[identifier]!.decodeInput({ ...valid, [field]: invalid }),
        ),
      ),
    ).toBe(true);
  }
  for (const value of [true, false, 0, 1, '0', '1', 'true', 'false']) {
    expect(
      Effect.runSync(
        definitions.voice_upload!.decodeInput({
          autoPublish: value,
          privacy: value,
        }),
      ),
    ).toEqual({ autoPublish: value, privacy: value });
  }
  for (const value of [true, false, 5, 'any-string']) {
    expect(
      Effect.runSync(
        definitions.login_qr_create!.decodeInput({ key: 'key', qrimg: value }),
      ),
    ).toEqual({ key: 'key', qrimg: value });
  }
});

test.each([{ input: null }, { input: [] }])(
  'legacy input $input fails at every dynamic entry before a request',
  async ({ input }) => {
    let requests = 0;
    const api = createHanaMusicApi({
      cookie: 'MUSIC_U=legacy-input',
      fetcher: async () => {
        requests += 1;
        return Response.json({ code: 200 });
      },
    });
    const requestHandler = () =>
      Effect.sync(() => {
        requests += 1;
        return response({ code: 200 });
      });
    const sdk = await Reflect.apply(api.likelist, undefined, [input]).catch(
      (error: unknown) => error,
    );
    const programmatic = await invokeModule(
      'likelist',
      input as unknown as ModuleQuery,
      {
        requestHandler,
      },
    ).catch((error: unknown) => error);
    const app = await createServer({ requestHandler });
    const http = await app.request('http://localhost/likelist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    expect(sdk).toMatchObject({ status: 400 });
    expect(programmatic).toMatchObject({ status: 400 });
    expect(http.status).toBe(400);
    expect(requests).toBe(0);
  },
);

test.each([
  { identifier: 'album', route: '/album', input: { id: {} } },
  { identifier: 'login', route: '/login', input: { email: 'x' } },
  {
    identifier: 'playlist_detail',
    route: '/playlist/detail',
    input: { id: {} },
  },
] as const)(
  '$identifier rejects malformed programmatic and Hono input before execution',
  async ({ identifier, route, input }) => {
    let requests = 0;
    const requestHandler = () =>
      Effect.sync(() => {
        requests += 1;
        return response({ code: 200 });
      });
    const programmatic = await Reflect.apply(invokeModule, undefined, [
      identifier,
      input,
      { requestHandler },
    ]).catch((error: unknown) => error);
    const app = await createServer({ requestHandler });
    const http = await app.request(`http://localhost${route}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    });
    expect(programmatic).toMatchObject({ status: 400 });
    expect(http.status).toBe(400);
    expect(requests).toBe(0);
  },
);
