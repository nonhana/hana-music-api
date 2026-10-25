import { expect, expectTypeOf, test } from 'bun:test';

import { createHanaMusicApi, TopPlaylistBody } from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import topPlaylistAnonymous from '../fixtures/netease/playlist/top_playlist.anonymous.json';
import topPlaylistBeyondLastPage from '../fixtures/netease/playlist/top_playlist.beyond-last-page.json';
import topPlaylistDefault from '../fixtures/netease/playlist/top_playlist.default.json';
import topPlaylistEmpty from '../fixtures/netease/playlist/top_playlist.empty.json';
import topPlaylistFallbackIgnoresLimit from '../fixtures/netease/playlist/top_playlist.fallback-ignores-limit.json';
import topPlaylistInvalidLimit from '../fixtures/netease/playlist/top_playlist.invalid-limit.json';
import topPlaylistLastPage from '../fixtures/netease/playlist/top_playlist.last-page.json';

// 录制保存上游原文：`creator`、`subscribers[]` 里的字段名是 `avatarImgId_str`。
// `top_playlist` 的公开行为是成功返回前把正文里所有 `avatarImgId_str` 改写成 `avatarImgIdStr`；
// 契约比较用这里显式写出的转换算出最终体，不 import 模块内部实现。
const rewriteAvatarKey = (raw: unknown) =>
  JSON.parse(
    JSON.stringify(raw).replaceAll('avatarImgId_str', 'avatarImgIdStr'),
  ) as unknown;

type TopPlaylistSuccess = Extract<TopPlaylistBody, { code: 200 }>;

// issue #102 B28 的登录主形态、匿名对照、真实空结果、真实尾页和 order=hot 兜底录制；
// 顶层视图见各录制的 context。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

const replayRaw = (body: string, status: number) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => new Response(body, { status }),
  });

type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ status: number; body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'top_playlist',
    recording: topPlaylistDefault,
    bodySchema: TopPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).topPlaylist(topPlaylistDefault.query),
  },
  {
    name: 'top_playlist for anonymous viewers',
    recording: topPlaylistAnonymous,
    bodySchema: TopPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).topPlaylist(topPlaylistAnonymous.query),
  },
  {
    name: 'top_playlist without results',
    recording: topPlaylistEmpty,
    bodySchema: TopPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).topPlaylist(topPlaylistEmpty.query),
  },
  {
    name: 'top_playlist at the real last page',
    recording: topPlaylistLastPage,
    bodySchema: TopPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).topPlaylist(topPlaylistLastPage.query),
  },
  {
    name: 'top_playlist with the order=hot offset fallback',
    recording: topPlaylistBeyondLastPage,
    bodySchema: TopPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).topPlaylist(topPlaylistBeyondLastPage.query),
  },
  {
    name: 'top_playlist with the fallback ignoring limit',
    recording: topPlaylistFallbackIgnoresLimit,
    bodySchema: TopPlaylistBody,
    call: (upstream, status) =>
      replay(upstream, status).topPlaylist(
        topPlaylistFallbackIgnoresLimit.query,
      ),
  },
];

test.each(cases)('$name returns the transformed recording', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

  expect(result.status).toBe(entry.recording.response.status);
  expect(result.body).toEqual(rewriteAvatarKey(entry.recording.response.body));

  const expected = rewriteAvatarKey(entry.recording.response.body);
  const validated = validateSync(entry.bodySchema, expected);
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toEqual(expected);
});

// 上游原文与最终体的唯一差异：`avatarImgId_str` 这个键名（上游同时给了 camelCase 键，值相同）。
test('top_playlist rewrites avatarImgId_str before returning', async () => {
  const result = await replay(topPlaylistDefault.response.body).topPlaylist(
    topPlaylistDefault.query,
  );
  const raw = topPlaylistDefault.response.body;
  const expected = rewriteAvatarKey(raw);
  const rawCreator = raw.playlists[0]?.creator as {
    avatarImgIdStr?: string;
    avatarImgId_str?: string;
  };
  const finalCreator = (
    result.body as unknown as {
      playlists: Array<{ creator?: { avatarImgIdStr?: string } }>;
    }
  ).playlists[0]?.creator;

  expect(JSON.stringify(raw)).toContain('avatarImgId_str');
  expect(JSON.stringify(result.body)).not.toContain('avatarImgId_str');
  expect(result.body as unknown).toEqual(expected);
  expect(finalCreator?.avatarImgIdStr).toBe(rawCreator.avatarImgIdStr);
  expect(finalCreator?.avatarImgIdStr).toBe(rawCreator.avatarImgId_str);
});

test('top_playlist tightens playlist ids and keeps pagination loose', () => {
  expectTypeOf<
    TopPlaylistSuccess['playlists'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<TopPlaylistSuccess['playlists'][number]['name']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    NonNullable<TopPlaylistSuccess['playlists'][number]['creator']>['userId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<TopPlaylistSuccess['total']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<TopPlaylistSuccess['more']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<TopPlaylistSuccess['cat']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<TopPlaylistBody>().toEqualTypeOf<TopPlaylistSuccess | ''>();
});

test('top_playlist returns a real order=new empty result', async () => {
  const result = await replay(topPlaylistEmpty.response.body).topPlaylist(
    topPlaylistEmpty.query,
  );
  const body = result.body as TopPlaylistSuccess;

  expect(body.playlists).toEqual([]);
  expect(body.total).toBe(0);
  expect(body.more).toBe(false);
  expect(body.cat).toBe('全部');
});

// order=hot 下 offset=680 是真实尾页，offset>=686 是另一份固定 6 条兜底列表，limit 在其中不生效。
test('top_playlist keeps the order=hot fallback list apart from the last page', async () => {
  const lastPage = await replay(topPlaylistLastPage.response.body).topPlaylist(
    topPlaylistLastPage.query,
  );
  const fallback = await replay(
    topPlaylistFallbackIgnoresLimit.response.body,
  ).topPlaylist(topPlaylistFallbackIgnoresLimit.query);

  expect(
    (lastPage.body as TopPlaylistSuccess).playlists.map(
      (playlist) => playlist.id,
    ),
  ).toEqual([
    18365425376, 18398962733, 12417974034, 8270375048, 12619696129, 14089582600,
  ]);
  expect(
    (fallback.body as TopPlaylistSuccess).playlists.map(
      (playlist) => playlist.id,
    ),
  ).toEqual([
    18271967084, 18374591158, 18359211192, 18428485896, 18194128578,
    18392644351,
  ]);
  expect((lastPage.body as TopPlaylistSuccess).more).toBe(false);
  expect((fallback.body as TopPlaylistSuccess).more).toBe(true);
  expect((fallback.body as TopPlaylistSuccess).playlists).toHaveLength(6);
});

test('top_playlist rejects the list without a playlists array', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body) as {
    playlists?: unknown;
  };
  delete upstream.playlists;

  await expectUpstreamShapeRejection(
    replay(upstream).topPlaylist(topPlaylistDefault.query),
    {
      module: 'top_playlist',
      path: 'body.playlists',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_playlist rejects a playlists block that is not an array', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body) as {
    playlists: unknown;
  };
  upstream.playlists = null;

  await expectUpstreamShapeRejection(
    replay(upstream).topPlaylist(topPlaylistDefault.query),
    {
      module: 'top_playlist',
      path: 'body.playlists',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('top_playlist rejects a playlist without an id', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body);
  delete (upstream.playlists[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).topPlaylist(topPlaylistDefault.query),
    {
      module: 'top_playlist',
      path: 'body.playlists[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('top_playlist rejects a playlist whose id is text', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body);
  (upstream.playlists[0] as { id: unknown }).id = '112875926';

  await expectUpstreamShapeRejection(
    replay(upstream).topPlaylist(topPlaylistDefault.query),
    {
      module: 'top_playlist',
      path: 'body.playlists[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('top_playlist rejects a body without a return code', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).topPlaylist(topPlaylistDefault.query),
    {
      module: 'top_playlist',
      path: 'body',
      expected: 'object with code 200 or an empty string',
      actual: 'object',
    },
  );
});

test('top_playlist drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body);
  const playlist = upstream.playlists[0] as {
    alg?: unknown;
    creator: Record<string, unknown>;
    name: unknown;
    playCount: unknown;
    subscribed: unknown;
    [key: string]: unknown;
  };
  playlist.name = 123;
  playlist.playCount = '23224';
  playlist.subscribed = null;
  delete playlist.alg;
  playlist.customField = { keep: true };
  playlist.creator.remarkName = null;
  (upstream as { total: unknown }).total = '686';
  (upstream as { more: unknown }).more = null;
  (upstream as { cat: unknown }).cat = 42;

  const result = await replay(upstream).topPlaylist(topPlaylistDefault.query);
  const body = result.body as TopPlaylistSuccess;

  expect(body.playlists[0] as unknown).not.toHaveProperty('name');
  expect(body.playlists[0] as unknown).not.toHaveProperty('playCount');
  expect(body.playlists[0]?.subscribed).toBeNull();
  expect(body.playlists[0] as unknown).not.toHaveProperty('alg');
  expect(body.playlists[0]?.customField).toEqual({ keep: true });
  expect(body.playlists[0]?.creator?.remarkName).toBeNull();
  expect(body as unknown).not.toHaveProperty('total');
  expect(body.more).toBeNull();
  expect(body as unknown).not.toHaveProperty('cat');
});

test('top_playlist drops a creator that is not an object', async () => {
  const upstream = structuredClone(topPlaylistDefault.response.body);
  (upstream.playlists[0] as { creator: unknown }).creator = 'listener';

  const result = await replay(upstream).topPlaylist(topPlaylistDefault.query);

  expect(
    (result.body as TopPlaylistSuccess).playlists[0] as unknown,
  ).not.toHaveProperty('creator');
});

// 非数字参数：上游回 HTTP 400 和空字符串正文，没有业务 code；网易云把它归一成
// `status: 200`、`body: ''`，空字符串作为独立分支保留，不报 502（录制 top_playlist.invalid-limit.json）。
test('top_playlist keeps the normalized empty HTTP 400 body', async () => {
  const result = await settle(
    replayRaw(
      topPlaylistInvalidLimit.response.body,
      topPlaylistInvalidLimit.response.status,
    ).topPlaylist(topPlaylistInvalidLimit.query),
  );

  expect(result as unknown).toEqual({
    resolved: { status: 200, cookie: [], body: '' },
  });
  const validated = validateSync(
    TopPlaylistBody,
    topPlaylistInvalidLimit.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toBe('');
});

// 改写只发生在成功返回体；业务拒绝的正文原样透传，不把 avatarImgId_str 改写成 avatarImgIdStr。
test('top_playlist passes a rejected code through without rewriting', async () => {
  const upstream = {
    code: 404,
    msg: '没有数据',
    data: { avatarImgId_str: 'unchanged' },
  };

  expect(await settle(replay(upstream).topPlaylist({}))).toEqual({
    rejected: {
      status: 404,
      cookie: [],
      body: upstream,
    },
  });
});
