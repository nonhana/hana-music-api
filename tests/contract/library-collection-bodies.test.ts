import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  SongDownlistBody,
  SongMonthdownlistBody,
  SongPurchasedBody,
  SongSingledownlistBody,
  UserPlaylistCollectBody,
  UserPlaylistCreateBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { replay } from '../_kit/replay.ts';
import songDownlist from '../fixtures/netease/library/song_downlist.default.json';
import songDownlistEmpty from '../fixtures/netease/library/song_downlist.empty.json';
import songDownlistRejected from '../fixtures/netease/library/song_downlist.rejected.json';
import songMonthdownlist from '../fixtures/netease/library/song_monthdownlist.default.json';
import songMonthdownlistEmpty from '../fixtures/netease/library/song_monthdownlist.empty.json';
import songPurchasedEmpty from '../fixtures/netease/library/song_purchased.empty.json';
import songSingledownlistEmpty from '../fixtures/netease/library/song_singledownlist.empty.json';
import userPlaylistCollectAnonymous from '../fixtures/netease/library/user_playlist_collect.anonymous.json';
import userPlaylistCollect from '../fixtures/netease/library/user_playlist_collect.default.json';
import userPlaylistCollectEmpty from '../fixtures/netease/library/user_playlist_collect.empty.json';
import userPlaylistCollectRejected from '../fixtures/netease/library/user_playlist_collect.rejected.json';
import userPlaylistCreateAnonymous from '../fixtures/netease/library/user_playlist_create.anonymous.json';
import userPlaylistCreate from '../fixtures/netease/library/user_playlist_create.default.json';
import userPlaylistCreateEmpty from '../fixtures/netease/library/user_playlist_create.empty.json';

// issue #102 B41 的录制：用户歌单列表与下载/已购资产只读接口。登录状态先用 login_status 确认
// `account.anonimousUser: false`。两个歌单列表用公开账号 32953014（binaryify）录制，query.uid
// 与正文一致、正文未改写，同参数重录逐字段一致；清单一节的第三方账号是歌单创建者，属于公开
// 数据。空结果用越界偏移录制；`song_singledownlist` 和 `song_purchased` 的录制账号没有已购买/
// 已购单曲，两份录制是真实空结果，元素类型没有证据。匿名对照只保留两个歌单列表
// （`subscribed` 为 `null`）；下载列表匿名时同样是空 `info`，不单独保留录制。
type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ readonly status: number; readonly body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'user_playlist_collect',
    recording: userPlaylistCollect,
    bodySchema: UserPlaylistCollectBody,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCollect(userPlaylistCollect.query),
  },
  {
    name: 'user_playlist_collect without collected playlists',
    recording: userPlaylistCollectEmpty,
    bodySchema: UserPlaylistCollectBody,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCollect(
        userPlaylistCollectEmpty.query,
      ),
  },
  {
    name: 'user_playlist_collect anonymously',
    recording: userPlaylistCollectAnonymous,
    bodySchema: UserPlaylistCollectBody,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCollect(
        userPlaylistCollectAnonymous.query,
      ),
  },
  {
    name: 'user_playlist_create',
    recording: userPlaylistCreate,
    bodySchema: UserPlaylistCreateBody,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCreate(userPlaylistCreate.query),
  },
  {
    name: 'user_playlist_create without created playlists',
    recording: userPlaylistCreateEmpty,
    bodySchema: UserPlaylistCreateBody,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCreate(
        userPlaylistCreateEmpty.query,
      ),
  },
  {
    name: 'user_playlist_create anonymously',
    recording: userPlaylistCreateAnonymous,
    bodySchema: UserPlaylistCreateBody,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCreate(
        userPlaylistCreateAnonymous.query,
      ),
  },
  {
    name: 'song_downlist',
    recording: songDownlist,
    bodySchema: SongDownlistBody,
    call: (upstream, status) =>
      replay(upstream, status).songDownlist(songDownlist.query),
  },
  {
    name: 'song_downlist without records',
    recording: songDownlistEmpty,
    bodySchema: SongDownlistBody,
    call: (upstream, status) =>
      replay(upstream, status).songDownlist(songDownlistEmpty.query),
  },
  {
    name: 'song_monthdownlist',
    recording: songMonthdownlist,
    bodySchema: SongMonthdownlistBody,
    call: (upstream, status) =>
      replay(upstream, status).songMonthdownlist(songMonthdownlist.query),
  },
  {
    name: 'song_monthdownlist without records',
    recording: songMonthdownlistEmpty,
    bodySchema: SongMonthdownlistBody,
    call: (upstream, status) =>
      replay(upstream, status).songMonthdownlist(songMonthdownlistEmpty.query),
  },
  {
    name: 'song_singledownlist without purchased singles',
    recording: songSingledownlistEmpty,
    bodySchema: SongSingledownlistBody,
    call: (upstream, status) =>
      replay(upstream, status).songSingledownlist(
        songSingledownlistEmpty.query,
      ),
  },
  {
    name: 'song_purchased without purchases',
    recording: songPurchasedEmpty,
    bodySchema: SongPurchasedBody,
    call: (upstream, status) =>
      replay(upstream, status).songPurchased(songPurchasedEmpty.query),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(entry.recording.response.status);
  expect(result.body).toEqual(entry.recording.response.body);

  const validated = validateSync(
    entry.bodySchema,
    entry.recording.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(entry.recording.response.body);
});

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'user_playlist_collect',
    recording: userPlaylistCollectRejected,
    call: (upstream, status) =>
      replay(upstream, status).userPlaylistCollect(
        userPlaylistCollectRejected.query,
      ),
  },
  {
    name: 'song_downlist',
    recording: songDownlistRejected,
    call: (upstream, status) =>
      replay(upstream, status).songDownlist(songDownlistRejected.query),
  },
])('$name passes a rejected code through', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: (entry.recording.response.body as { code: number }).code,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('library collection bodies type their tightened records and loose fields', () => {
  expectTypeOf<UserPlaylistCollectBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    UserPlaylistCollectBody['data']['playlist'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<UserPlaylistCollectBody['data']['more']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<UserPlaylistCreateBody['data']['subCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<
    SongDownlistBody['info'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    NonNullable<SongDownlistBody['info'][number]['song']>['name']
  >().toEqualTypeOf<string | null | undefined>();
  expectTypeOf<SongMonthdownlistBody['info'][number]['type']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<SongPurchasedBody['data']['hasMore']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<SongSingledownlistBody['code']>().toEqualTypeOf<200>();
});

test('library collection modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.userPlaylistCollect(null as never),
    () => api.userPlaylistCreate(null as never),
    () => api.songDownlist(null as never),
    () => api.songMonthdownlist(null as never),
    () => api.songSingledownlist(null as never),
    () => api.songPurchased(null as never),
  ];

  for (const call of calls) {
    expect(await settle(call())).toEqual({
      rejected: {
        status: 400,
        cookie: [],
        body: { code: 400, msg: 'Expected <Declaration>' },
      },
    });
  }
  expect(upstreamCalls).toBe(0);
});

test('user_playlist_collect rejects a body without the playlist data', async () => {
  const upstream = structuredClone(userPlaylistCollect.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).userPlaylistCollect(userPlaylistCollect.query),
    {
      module: 'user_playlist_collect',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_playlist_collect rejects a non-array playlist list', async () => {
  const upstream = structuredClone(userPlaylistCollect.response.body) as {
    data: { playlist: unknown };
  };
  upstream.data.playlist = null;

  await expectUpstreamShapeRejection(
    replay(upstream).userPlaylistCollect(userPlaylistCollect.query),
    {
      module: 'user_playlist_collect',
      path: 'body.data.playlist',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('user_playlist_collect rejects a playlist without an id', async () => {
  const upstream = structuredClone(userPlaylistCollect.response.body) as {
    data: { playlist: Array<{ id?: unknown }> };
  };
  delete upstream.data.playlist[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).userPlaylistCollect(userPlaylistCollect.query),
    {
      module: 'user_playlist_collect',
      path: 'body.data.playlist[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_playlist_collect rejects a non-numeric playlist id', async () => {
  const upstream = structuredClone(userPlaylistCollect.response.body) as {
    data: { playlist: Array<{ id: unknown }> };
  };
  upstream.data.playlist[1]!.id = '8668352551';

  await expectUpstreamShapeRejection(
    replay(upstream).userPlaylistCollect(userPlaylistCollect.query),
    {
      module: 'user_playlist_collect',
      path: 'body.data.playlist[1].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_playlist_collect drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(userPlaylistCollect.response.body) as {
    data: {
      count?: unknown;
      more: unknown;
      playlist: Array<{
        artists?: unknown;
        name: unknown;
        playCount: unknown;
        shareStatus?: unknown;
        subscribed: unknown;
      }>;
    };
  };
  delete upstream.data.count;
  upstream.data.more = null;
  upstream.data.playlist[0]!.name = 42;
  upstream.data.playlist[0]!.playCount = '21023';
  upstream.data.playlist[0]!.subscribed = null;
  upstream.data.playlist[0]!.artists = [{ id: 1 }];
  upstream.data.playlist[0]!.shareStatus = { shared: true };

  const result = await replay(upstream).userPlaylistCollect(
    userPlaylistCollect.query,
  );
  const first = result.body.data.playlist[0]! as unknown as Record<
    string,
    unknown
  >;

  expect(result.body.data as unknown).not.toHaveProperty('count');
  expect(result.body.data as unknown).toHaveProperty('more', null);
  expect(first).not.toHaveProperty('name');
  expect(first).not.toHaveProperty('playCount');
  expect(first).toHaveProperty('subscribed', null);
  expect(first).toHaveProperty('artists', [{ id: 1 }]);
  expect(first).toHaveProperty('shareStatus', { shared: true });
  expect(first.id).toBe(userPlaylistCollect.response.body.data.playlist[0]?.id);
});

test('user_playlist_create rejects a body without the playlist list', async () => {
  const upstream = structuredClone(userPlaylistCreate.response.body) as {
    data: { playlist?: unknown };
  };
  delete upstream.data.playlist;

  await expectUpstreamShapeRejection(
    replay(upstream).userPlaylistCreate(userPlaylistCreate.query),
    {
      module: 'user_playlist_create',
      path: 'body.data.playlist',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_playlist_create rejects a non-numeric playlist id', async () => {
  const upstream = structuredClone(userPlaylistCreate.response.body) as {
    data: { playlist: Array<{ id: unknown }> };
  };
  upstream.data.playlist[2]!.id = '12529334864';

  await expectUpstreamShapeRejection(
    replay(upstream).userPlaylistCreate(userPlaylistCreate.query),
    {
      module: 'user_playlist_create',
      path: 'body.data.playlist[2].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_playlist_create drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(userPlaylistCreate.response.body) as {
    data: {
      count: unknown;
      subCount: unknown;
      playlist: Array<{ shareStatus?: unknown; updateFrequency?: unknown }>;
    };
  };
  upstream.data.count = '19';
  upstream.data.subCount = null;
  upstream.data.playlist[0]!.updateFrequency = 7;
  upstream.data.playlist[0]!.shareStatus = { shared: false };

  const result = await replay(upstream).userPlaylistCreate(
    userPlaylistCreate.query,
  );
  const first = result.body.data.playlist[0]! as unknown as Record<
    string,
    unknown
  >;

  expect(result.body.data as unknown).not.toHaveProperty('count');
  expect(result.body.data as unknown).toHaveProperty('subCount', null);
  expect(first).not.toHaveProperty('updateFrequency');
  expect(first).toHaveProperty('shareStatus', { shared: false });
});

test('song_downlist rejects a body without the download list', async () => {
  const upstream = structuredClone(songDownlist.response.body) as {
    info?: unknown;
  };
  delete upstream.info;

  await expectUpstreamShapeRejection(
    replay(upstream).songDownlist(songDownlist.query),
    {
      module: 'song_downlist',
      path: 'body.info',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_downlist rejects a download record without an id', async () => {
  const upstream = structuredClone(songDownlist.response.body) as {
    info: Array<{ id?: unknown }>;
  };
  delete upstream.info[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).songDownlist(songDownlist.query),
    {
      module: 'song_downlist',
      path: 'body.info[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_downlist rejects a non-numeric download record id', async () => {
  const upstream = structuredClone(songDownlist.response.body) as {
    info: Array<{ id: unknown }>;
  };
  upstream.info[2]!.id = '46144768391';

  await expectUpstreamShapeRejection(
    replay(upstream).songDownlist(songDownlist.query),
    {
      module: 'song_downlist',
      path: 'body.info[2].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('song_downlist drops a bad embedded song and keeps undeclared fields', async () => {
  const upstream = structuredClone(songDownlist.response.body) as {
    info: Array<{
      albumName?: unknown;
      firstTime: unknown;
      song: unknown;
      type: unknown;
    }>;
  };
  upstream.info[0]!.firstTime = '1792590609878';
  upstream.info[0]!.type = null;
  upstream.info[0]!.albumName = 'download-note';
  upstream.info[0]!.song = 'Theme Of Laura II';

  const secondSong = upstream.info[1]!.song as Record<string, unknown>;
  secondSong.rtUrl = 'https://example.invalid/song';
  secondSong.crbt = 'cbt';

  const result = await replay(upstream).songDownlist(songDownlist.query);
  const first = result.body.info[0]! as unknown as Record<string, unknown>;
  const second = result.body.info[1]! as unknown as {
    song: Record<string, unknown>;
  };

  expect(first).not.toHaveProperty('firstTime');
  expect(first).not.toHaveProperty('song');
  expect(first).toHaveProperty('type', null);
  expect(first).toHaveProperty('albumName', 'download-note');
  expect(first.id).toBe(songDownlist.response.body.info[0]?.id);
  expect(second.song).toHaveProperty('rtUrl', 'https://example.invalid/song');
  expect(second.song).toHaveProperty('crbt', 'cbt');
  expect(second.song.id).toBe(songDownlist.response.body.info[1]?.song.id);
});

test('song_monthdownlist rejects a body without the download list', async () => {
  const upstream = structuredClone(songMonthdownlist.response.body) as {
    info?: unknown;
  };
  delete upstream.info;

  await expectUpstreamShapeRejection(
    replay(upstream).songMonthdownlist(songMonthdownlist.query),
    {
      module: 'song_monthdownlist',
      path: 'body.info',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_monthdownlist rejects a download record without an id', async () => {
  const upstream = structuredClone(songMonthdownlist.response.body) as {
    info: Array<{ id?: unknown }>;
  };
  delete upstream.info[3]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).songMonthdownlist(songMonthdownlist.query),
    {
      module: 'song_monthdownlist',
      path: 'body.info[3].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_monthdownlist rejects a non-numeric download record id', async () => {
  const upstream = structuredClone(songMonthdownlist.response.body) as {
    info: Array<{ id: unknown }>;
  };
  upstream.info[1]!.id = '46166452901';

  await expectUpstreamShapeRejection(
    replay(upstream).songMonthdownlist(songMonthdownlist.query),
    {
      module: 'song_monthdownlist',
      path: 'body.info[1].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('song_monthdownlist drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(songMonthdownlist.response.body) as {
    info: Array<{
      downloadNote?: unknown;
      firstTime: unknown;
      song: unknown;
    }>;
  };
  upstream.info[0]!.firstTime = null;
  upstream.info[0]!.downloadNote = 'month-download';
  upstream.info[0]!.song = 42;

  const result = await replay(upstream).songMonthdownlist(
    songMonthdownlist.query,
  );
  const first = result.body.info[0]! as unknown as Record<string, unknown>;

  expect(first).toHaveProperty('firstTime', null);
  expect(first).toHaveProperty('downloadNote', 'month-download');
  expect(first).not.toHaveProperty('song');
  expect(first.id).toBe(songMonthdownlist.response.body.info[0]?.id);
});

test('song_purchased rejects a body without purchase data', async () => {
  const upstream = structuredClone(songPurchasedEmpty.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).songPurchased(songPurchasedEmpty.query),
    {
      module: 'song_purchased',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('song_purchased rejects non-object purchase data', async () => {
  const upstream = structuredClone(songPurchasedEmpty.response.body) as {
    data: unknown;
  };
  upstream.data = [];

  await expectUpstreamShapeRejection(
    replay(upstream).songPurchased(songPurchasedEmpty.query),
    {
      module: 'song_purchased',
      path: 'body.data',
      expected: 'object',
      actual: 'array',
    },
  );
});

test('song_purchased keeps the undeclared list and drops bad loose fields', async () => {
  const upstream = structuredClone(songPurchasedEmpty.response.body) as {
    data: { count: unknown; hasMore: unknown; list: unknown };
    message: unknown;
  };
  upstream.data.count = '0';
  upstream.data.hasMore = null;
  upstream.data.list = [{ songId: 2662577181 }];
  upstream.message = 7;

  const result = await replay(upstream).songPurchased(songPurchasedEmpty.query);

  expect(result.body.data as unknown).not.toHaveProperty('count');
  expect(result.body.data as unknown).toHaveProperty('hasMore', null);
  expect(result.body.data as unknown).toHaveProperty('list', [
    { songId: 2662577181 },
  ]);
  expect(result.body as unknown).not.toHaveProperty('message');
});

test('song_singledownlist schema rejects a string return code', () => {
  // 请求层 interpretResponse 会先把字符串 code 归一成数字，模块级只可能看到数字；这里直接校验结构定义。
  const validated = validateSync(SongSingledownlistBody, {
    ...songSingledownlistEmpty.response.body,
    code: '200',
  });
  expect(validated.issues).toHaveLength(1);
  expect(validated.issues?.[0]).toEqual({
    path: ['code'],
    message: 'Expected 200',
  });
});

test('song_singledownlist keeps the undeclared list and rejects a body without code', async () => {
  const upstream = structuredClone(songSingledownlistEmpty.response.body) as {
    code?: unknown;
    info: unknown;
  };
  upstream.info = [{ songId: 2662577181 }];

  const result = await replay(upstream).songSingledownlist(
    songSingledownlistEmpty.query,
  );
  expect(result.body as unknown).toHaveProperty('info', [
    { songId: 2662577181 },
  ]);

  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).songSingledownlist(songSingledownlistEmpty.query),
    {
      module: 'song_singledownlist',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});
