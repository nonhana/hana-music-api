import { expect, expectTypeOf, test } from 'bun:test';

import { Effect } from 'effect';

import {
  createHanaMusicApi,
  PersonalizedBody,
  PersonalizedMvBody,
  PersonalizedNewsongBody,
  PersonalizedPrivatecontentBody,
  PersonalizedPrivatecontentListBody,
  RecommendResourceBody,
} from '../../index.ts';
import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import personalizedModule from '../../src/modules/personalized.ts';
import type { RequestCapability } from '../../src/types/index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectFailure,
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { runExit } from '../_kit/it.ts';
import { replay } from '../_kit/replay.ts';
import personalizedAuthenticated from '../fixtures/netease/recommend/personalized.authenticated.json';
import personalizedDefault from '../fixtures/netease/recommend/personalized.default.json';
import personalizedInvalidLimit from '../fixtures/netease/recommend/personalized.invalid-limit.json';
import personalizedMvAuthenticated from '../fixtures/netease/recommend/personalized_mv.authenticated.json';
import personalizedMvDefault from '../fixtures/netease/recommend/personalized_mv.default.json';
import personalizedNewsongAuthenticated from '../fixtures/netease/recommend/personalized_newsong.authenticated.json';
import personalizedNewsongDefault from '../fixtures/netease/recommend/personalized_newsong.default.json';
import personalizedNewsongInvalidLimit from '../fixtures/netease/recommend/personalized_newsong.invalid-limit.json';
import personalizedPrivatecontentAuthenticated from '../fixtures/netease/recommend/personalized_privatecontent.authenticated.json';
import personalizedPrivatecontentDefault from '../fixtures/netease/recommend/personalized_privatecontent.default.json';
import personalizedPrivatecontentListAuthenticated from '../fixtures/netease/recommend/personalized_privatecontent_list.authenticated.json';
import personalizedPrivatecontentListDefault from '../fixtures/netease/recommend/personalized_privatecontent_list.default.json';
import personalizedPrivatecontentListInvalidOffset from '../fixtures/netease/recommend/personalized_privatecontent_list.invalid-offset.json';
import personalizedPrivatecontentListOffsetOutOfRange from '../fixtures/netease/recommend/personalized_privatecontent_list.offset-out-of-range.json';
import recommendResourceAuthenticated from '../fixtures/netease/recommend/recommend_resource.authenticated.json';
import recommendResourceDefault from '../fixtures/netease/recommend/recommend_resource.default.json';

// issue #102 B26 的推荐补充读取录制：`default` 是匿名视角，`authenticated` 是登录视角（先经 login_status 确认 anonimousUser: false）。
type Case = {
  readonly name: string;
  readonly recording: Recording;
  readonly bodySchema: Validator;
  readonly call: (
    upstream: unknown,
    status: number,
  ) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'recommend_resource',
    recording: recommendResourceDefault,
    bodySchema: RecommendResourceBody,
    call: (upstream, status) =>
      replay(upstream, status).recommendResource(
        recommendResourceDefault.query,
      ),
  },
  {
    name: 'recommend_resource for an authenticated listener',
    recording: recommendResourceAuthenticated,
    bodySchema: RecommendResourceBody,
    call: (upstream, status) =>
      replay(upstream, status).recommendResource(
        recommendResourceAuthenticated.query,
      ),
  },
  {
    name: 'personalized',
    recording: personalizedDefault,
    bodySchema: PersonalizedBody,
    call: (upstream, status) =>
      replay(upstream, status).personalized(personalizedDefault.query),
  },
  {
    name: 'personalized for an authenticated listener',
    recording: personalizedAuthenticated,
    bodySchema: PersonalizedBody,
    call: (upstream, status) =>
      replay(upstream, status).personalized(personalizedAuthenticated.query),
  },
  {
    name: 'personalized_mv',
    recording: personalizedMvDefault,
    bodySchema: PersonalizedMvBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedMv(personalizedMvDefault.query),
  },
  {
    name: 'personalized_mv for an authenticated listener',
    recording: personalizedMvAuthenticated,
    bodySchema: PersonalizedMvBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedMv(
        personalizedMvAuthenticated.query,
      ),
  },
  {
    name: 'personalized_newsong',
    recording: personalizedNewsongDefault,
    bodySchema: PersonalizedNewsongBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedNewsong(
        personalizedNewsongDefault.query,
      ),
  },
  {
    name: 'personalized_newsong for an authenticated listener',
    recording: personalizedNewsongAuthenticated,
    bodySchema: PersonalizedNewsongBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedNewsong(
        personalizedNewsongAuthenticated.query,
      ),
  },
  {
    name: 'personalized_privatecontent',
    recording: personalizedPrivatecontentDefault,
    bodySchema: PersonalizedPrivatecontentBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedPrivatecontent(
        personalizedPrivatecontentDefault.query,
      ),
  },
  {
    name: 'personalized_privatecontent for an authenticated listener',
    recording: personalizedPrivatecontentAuthenticated,
    bodySchema: PersonalizedPrivatecontentBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedPrivatecontent(
        personalizedPrivatecontentAuthenticated.query,
      ),
  },
  {
    name: 'personalized_privatecontent_list',
    recording: personalizedPrivatecontentListDefault,
    bodySchema: PersonalizedPrivatecontentListBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedPrivatecontentList(
        personalizedPrivatecontentListDefault.query,
      ),
  },
  {
    name: 'personalized_privatecontent_list for an authenticated listener',
    recording: personalizedPrivatecontentListAuthenticated,
    bodySchema: PersonalizedPrivatecontentListBody,
    call: (upstream, status) =>
      replay(upstream, status).personalizedPrivatecontentList(
        personalizedPrivatecontentListAuthenticated.query,
      ),
  },
];

test.each(cases)('$name returns the recorded body', async (entry) => {
  const result = await entry.call(
    entry.recording.response.body,
    entry.recording.response.status,
  );

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
  status: number;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'personalized with a non-numeric limit',
    status: 400,
    recording: personalizedInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).personalized(personalizedInvalidLimit.query),
  },
  {
    name: 'personalized_newsong with a non-numeric limit',
    status: 400,
    recording: personalizedNewsongInvalidLimit,
    call: (upstream, status) =>
      replay(upstream, status).personalizedNewsong(
        personalizedNewsongInvalidLimit.query,
      ),
  },
  {
    name: 'personalized_privatecontent_list with a non-numeric offset',
    status: 400,
    recording: personalizedPrivatecontentListInvalidOffset,
    call: (upstream, status) =>
      replay(upstream, status).personalizedPrivatecontentList(
        personalizedPrivatecontentListInvalidOffset.query,
      ),
  },
  {
    name: 'personalized_privatecontent_list with an offset past its list',
    status: 404,
    recording: personalizedPrivatecontentListOffsetOutOfRange,
    call: (upstream, status) =>
      replay(upstream, status).personalizedPrivatecontentList(
        personalizedPrivatecontentListOffsetOutOfRange.query,
      ),
  },
])('$name passes the rejected code through', async (entry) => {
  expect(await settle(entry.call(entry.recording.response.body, 200))).toEqual({
    rejected: {
      status: entry.status,
      cookie: [],
      body: entry.recording.response.body,
    },
  });
});

test('recommend bodies type their tightened records and loose fields', () => {
  expectTypeOf<
    RecommendResourceBody['recommend'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    RecommendResourceBody['recommend'][number]['playcount']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<RecommendResourceBody['haveRcmdSongs']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    PersonalizedBody['result'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<PersonalizedBody['hasTaste']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    PersonalizedMvBody['result'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<PersonalizedMvBody['result'][number]['subed']>().toEqualTypeOf<
    boolean | null | undefined
  >();
  expectTypeOf<
    PersonalizedNewsongBody['result'][number]['id']
  >().toEqualTypeOf<number>();
  type Newsong = NonNullable<PersonalizedNewsongBody['result'][number]['song']>;
  expectTypeOf<Newsong['id']>().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<
    PersonalizedPrivatecontentBody['result'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    PersonalizedPrivatecontentListBody['result'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<
    PersonalizedPrivatecontentListBody['result'][number]['time']
  >().toEqualTypeOf<number | null | undefined>();
});

test('recommend_resource rejects a body without the recommend list', async () => {
  const upstream = structuredClone(recommendResourceDefault.response.body) as {
    recommend?: unknown;
  };
  delete upstream.recommend;

  await expectUpstreamShapeRejection(
    replay(upstream).recommendResource(recommendResourceDefault.query),
    {
      module: 'recommend_resource',
      path: 'body.recommend',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('recommend_resource rejects a playlist without an id', async () => {
  const upstream = structuredClone(recommendResourceDefault.response.body) as {
    recommend: Array<{ id?: unknown }>;
  };
  delete upstream.recommend[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).recommendResource(recommendResourceDefault.query),
    {
      module: 'recommend_resource',
      path: 'body.recommend[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('recommend_resource accepts an empty list and keeps undeclared fields', async () => {
  const upstream = structuredClone(recommendResourceDefault.response.body) as {
    recommend: unknown;
    featureFirst?: unknown;
    haveRcmdSongs: unknown;
    extra?: unknown;
  };
  upstream.recommend = [];
  delete upstream.featureFirst;
  upstream.haveRcmdSongs = null;
  upstream.extra = { keep: true };

  const result = await replay(upstream).recommendResource(
    recommendResourceDefault.query,
  );

  expect(result.body.recommend).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('featureFirst');
  expect(result.body.haveRcmdSongs).toBeNull();
  expect(result.body as unknown).toHaveProperty('extra', { keep: true });
});

test('recommend_resource drops a bad count and keeps nested extras', async () => {
  const upstream = structuredClone(recommendResourceDefault.response.body) as {
    featureFirst: unknown;
    recommend: Array<
      Record<string, unknown> & { creator: Record<string, unknown> }
    >;
  };
  upstream.featureFirst = 'yes';
  upstream.recommend[0]!.playcount = '25360427008';
  upstream.recommend[0]!.customCard = { tag: 'x' };
  upstream.recommend[0]!.creator.remarkName = '备注';
  upstream.recommend[0]!.creator.customUser = 7;

  const result = await replay(upstream).recommendResource(
    recommendResourceDefault.query,
  );

  expect(result.body as unknown).not.toHaveProperty('featureFirst');
  expect(result.body.recommend[0] as unknown).not.toHaveProperty('playcount');
  expect(result.body.recommend[0] as unknown).toHaveProperty('customCard', {
    tag: 'x',
  });
  expect(
    (result.body.recommend[0]!.creator as Record<string, unknown>).remarkName,
  ).toBe('备注');
  expect(
    (result.body.recommend[0]!.creator as Record<string, unknown>).customUser,
  ).toBe(7);
});

test('personalized rejects a text return code with 502', async () => {
  // 请求层会把 `code` 归一成 number；这里直接喂未归一化的响应，确认 Body 结构本身拒绝文本返回码。
  const request = (() =>
    Effect.succeed({
      status: 200,
      headers: new Headers(),
      cookie: [],
      body: { ...personalizedDefault.response.body, code: '200' },
    })) as RequestCapability;
  const config = { cookie: 'MUSIC_U=module-reader' };
  const call: CallShape = {
    identifier: 'personalized',
    input: personalizedDefault.query,
    config,
    identity: resolveIdentitySnapshot(config, getRuntimeState()),
    policy: { read: true, upload: false },
    startedAt: Date.now(),
  };

  const failure = expectFailure(
    await runExit(
      personalizedModule(personalizedDefault.query, request).pipe(
        Effect.provideService(Call, call),
      ),
    ),
  );

  expect(failure).toMatchObject({
    status: 502,
    body: {
      code: 502,
      upstreamShape: {
        module: 'personalized',
        path: 'body.code',
        expected: '200',
        actual: 'string',
      },
    },
  });
});

test('personalized rejects a body without the playlist list', async () => {
  const upstream = structuredClone(personalizedDefault.response.body) as {
    result?: unknown;
  };
  delete upstream.result;

  await expectUpstreamShapeRejection(
    replay(upstream).personalized(personalizedDefault.query),
    {
      module: 'personalized',
      path: 'body.result',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized rejects a playlist whose id is text', async () => {
  const upstream = structuredClone(personalizedDefault.response.body) as {
    result: Array<{ id: unknown }>;
  };
  upstream.result[0]!.id = '3136952023';

  await expectUpstreamShapeRejection(
    replay(upstream).personalized(personalizedDefault.query),
    {
      module: 'personalized',
      path: 'body.result[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('personalized accepts an empty list and keeps undeclared fields', async () => {
  const upstream = structuredClone(personalizedDefault.response.body) as {
    result: unknown;
    category?: unknown;
    hasTaste: unknown;
    extra?: unknown;
  };
  upstream.result = [];
  delete upstream.category;
  upstream.hasTaste = null;
  upstream.extra = ['keep'];

  const result = await replay(upstream).personalized(personalizedDefault.query);

  expect(result.body.result).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('category');
  expect(result.body.hasTaste).toBeNull();
  expect(result.body as unknown).toHaveProperty('extra', ['keep']);
});

test('personalized drops bad counters and keeps undeclared card fields', async () => {
  const upstream = structuredClone(personalizedDefault.response.body) as {
    category: unknown;
    hasTaste: unknown;
    result: Array<Record<string, unknown>>;
  };
  upstream.category = 'recommend';
  upstream.hasTaste = 'no';
  upstream.result[0]!.highQuality = 'false';
  upstream.result[0]!.customCard = { tag: 'y' };

  const result = await replay(upstream).personalized(personalizedDefault.query);

  expect(result.body as unknown).not.toHaveProperty('category');
  expect(result.body as unknown).not.toHaveProperty('hasTaste');
  expect(result.body.result[0] as unknown).not.toHaveProperty('highQuality');
  expect(result.body.result[0] as unknown).toHaveProperty('customCard', {
    tag: 'y',
  });
});

test('personalized_mv rejects a body without the mv list', async () => {
  const upstream = structuredClone(personalizedMvDefault.response.body) as {
    result?: unknown;
  };
  delete upstream.result;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedMv(personalizedMvDefault.query),
    {
      module: 'personalized_mv',
      path: 'body.result',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_mv rejects an mv whose id is missing', async () => {
  const upstream = structuredClone(personalizedMvDefault.response.body) as {
    result: Array<{ id?: unknown }>;
  };
  delete upstream.result[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedMv(personalizedMvDefault.query),
    {
      module: 'personalized_mv',
      path: 'body.result[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_mv accepts an empty list and keeps undeclared fields', async () => {
  const upstream = structuredClone(personalizedMvDefault.response.body) as {
    result: unknown;
    category?: unknown;
    extra?: unknown;
  };
  upstream.result = [];
  delete upstream.category;
  upstream.extra = 1;

  const result = await replay(upstream).personalizedMv(
    personalizedMvDefault.query,
  );

  expect(result.body.result).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('category');
  expect(result.body as unknown).toHaveProperty('extra', 1);
});

test('personalized_mv keeps a null subscription flag and drops a bad artist list', async () => {
  const upstream = structuredClone(personalizedMvDefault.response.body) as {
    category: unknown;
    result: Array<Record<string, unknown> & { artists: unknown }>;
  };
  upstream.category = 'mv';
  upstream.result[0]!.subed = null;
  upstream.result[0]!.artists = 'none';
  upstream.result[0]!.customMvField = true;

  const result = await replay(upstream).personalizedMv(
    personalizedMvDefault.query,
  );

  expect(result.body as unknown).not.toHaveProperty('category');
  expect(result.body.result[0]!.subed).toBeNull();
  expect(result.body.result[0] as unknown).not.toHaveProperty('artists');
  expect(result.body.result[0] as unknown).toHaveProperty(
    'customMvField',
    true,
  );
});

test('personalized_newsong rejects a body without the song list', async () => {
  const upstream = structuredClone(
    personalizedNewsongAuthenticated.response.body,
  ) as { result?: unknown };
  delete upstream.result;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedNewsong(
      personalizedNewsongAuthenticated.query,
    ),
    {
      module: 'personalized_newsong',
      path: 'body.result',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_newsong rejects a record without an id', async () => {
  const upstream = structuredClone(
    personalizedNewsongAuthenticated.response.body,
  ) as { result: Array<{ id?: unknown }> };
  delete upstream.result[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedNewsong(
      personalizedNewsongAuthenticated.query,
    ),
    {
      module: 'personalized_newsong',
      path: 'body.result[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_newsong accepts an empty list and drops a bad song record', async () => {
  const upstream = structuredClone(
    personalizedNewsongAuthenticated.response.body,
  ) as {
    result: Array<{ song?: unknown }>;
    extra?: unknown;
  };
  upstream.result[0]!.song = 'not a song';
  upstream.extra = { keep: true };

  const result = await replay(upstream).personalizedNewsong(
    personalizedNewsongAuthenticated.query,
  );

  expect(result.body.result[0] as unknown).not.toHaveProperty('song');
  expect(result.body as unknown).toHaveProperty('extra', { keep: true });

  const empty = structuredClone(
    personalizedNewsongAuthenticated.response.body,
  ) as { result: unknown };
  empty.result = [];

  const emptyResult = await replay(empty).personalizedNewsong(
    personalizedNewsongAuthenticated.query,
  );
  expect(emptyResult.body.result).toEqual([]);
});

test('personalized_newsong keeps a null trp and drops a non-object one', async () => {
  const upstream = structuredClone(
    personalizedNewsongAuthenticated.response.body,
  ) as { trp: unknown };
  upstream.trp = null;

  const nullResult = await replay(upstream).personalizedNewsong(
    personalizedNewsongAuthenticated.query,
  );
  expect(nullResult.body.trp).toBeNull();

  upstream.trp = 'rules';
  const badResult = await replay(upstream).personalizedNewsong(
    personalizedNewsongAuthenticated.query,
  );
  expect(badResult.body as unknown).not.toHaveProperty('trp');
});

test('personalized_newsong keeps undeclared song blocks and drops bad loose fields', async () => {
  const upstream = structuredClone(
    personalizedNewsongAuthenticated.response.body,
  ) as {
    result: Array<{
      song: Record<string, unknown> & {
        album: Record<string, unknown>;
        rtUrls: unknown;
      };
    }>;
  };
  upstream.result[0]!.song.album.company = 42;
  upstream.result[0]!.song.album.customAlbumField = 'keep';
  upstream.result[0]!.song.rtUrls = [{ url: 'http://example.com' }];
  upstream.result[0]!.song.customSongField = 1;

  const result = await replay(upstream).personalizedNewsong(
    personalizedNewsongAuthenticated.query,
  );

  const song = result.body.result[0]!.song as unknown as Record<
    string,
    unknown
  >;
  const album = song.album as Record<string, unknown>;
  expect(album).not.toHaveProperty('company');
  expect(album).toHaveProperty('customAlbumField', 'keep');
  expect(song).toHaveProperty('rtUrls', [{ url: 'http://example.com' }]);
  expect(song).toHaveProperty('customSongField', 1);
});

test('personalized_privatecontent rejects a body without the content list', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentDefault.response.body,
  ) as { result?: unknown };
  delete upstream.result;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedPrivatecontent(
      personalizedPrivatecontentDefault.query,
    ),
    {
      module: 'personalized_privatecontent',
      path: 'body.result',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_privatecontent rejects a content record without an id', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentDefault.response.body,
  ) as { result: Array<{ id?: unknown }> };
  delete upstream.result[1]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedPrivatecontent(
      personalizedPrivatecontentDefault.query,
    ),
    {
      module: 'personalized_privatecontent',
      path: 'body.result[1].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_privatecontent accepts an empty list and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentDefault.response.body,
  ) as {
    result: unknown;
    name?: unknown;
    extra?: unknown;
  };
  upstream.result = [];
  delete upstream.name;
  upstream.extra = 'keep';

  const result = await replay(upstream).personalizedPrivatecontent(
    personalizedPrivatecontentDefault.query,
  );

  expect(result.body.result).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('name');
  expect(result.body as unknown).toHaveProperty('extra', 'keep');
});

test('personalized_privatecontent keeps null loose fields', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentDefault.response.body,
  ) as {
    name: unknown;
    result: Array<{ url: unknown }>;
  };
  upstream.name = null;
  upstream.result[0]!.url = null;

  const result = await replay(upstream).personalizedPrivatecontent(
    personalizedPrivatecontentDefault.query,
  );

  expect(result.body.name).toBeNull();
  expect(result.body.result[0]!.url).toBeNull();
});

test('personalized_privatecontent drops a bad url and keeps undeclared record fields', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentDefault.response.body,
  ) as {
    name: unknown;
    result: Array<Record<string, unknown>>;
  };
  upstream.name = 1;
  upstream.result[0]!.url = { href: 'x' };
  upstream.result[0]!.customContentField = 'keep';

  const result = await replay(upstream).personalizedPrivatecontent(
    personalizedPrivatecontentDefault.query,
  );

  expect(result.body as unknown).not.toHaveProperty('name');
  expect(result.body.result[0] as unknown).not.toHaveProperty('url');
  expect(result.body.result[0] as unknown).toHaveProperty(
    'customContentField',
    'keep',
  );
});

test('personalized_privatecontent_list rejects a body without the content list', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentListDefault.response.body,
  ) as { result?: unknown };
  delete upstream.result;

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedPrivatecontentList(
      personalizedPrivatecontentListDefault.query,
    ),
    {
      module: 'personalized_privatecontent_list',
      path: 'body.result',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('personalized_privatecontent_list rejects a content record whose id is text', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentListDefault.response.body,
  ) as { result: Array<{ id: unknown }> };
  upstream.result[0]!.id = '14514232';

  await expectUpstreamShapeRejection(
    replay(upstream).personalizedPrivatecontentList(
      personalizedPrivatecontentListDefault.query,
    ),
    {
      module: 'personalized_privatecontent_list',
      path: 'body.result[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('personalized_privatecontent_list accepts an empty list and keeps undeclared fields', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentListDefault.response.body,
  ) as {
    result: unknown;
    more: unknown;
    offset: unknown;
    extra?: unknown;
  };
  upstream.result = [];
  upstream.more = null;
  upstream.offset = '6';
  upstream.extra = true;

  const result = await replay(upstream).personalizedPrivatecontentList(
    personalizedPrivatecontentListDefault.query,
  );

  expect(result.body.result).toEqual([]);
  expect(result.body.more).toBeNull();
  expect(result.body as unknown).not.toHaveProperty('offset');
  expect(result.body as unknown).toHaveProperty('extra', true);
});

test('personalized_privatecontent_list drops a bad time and keeps undeclared record fields', async () => {
  const upstream = structuredClone(
    personalizedPrivatecontentListDefault.response.body,
  ) as { result: Array<Record<string, unknown>> };
  upstream.result[0]!.time = '1648546294107';
  upstream.result[0]!.customListItemField = 'keep';

  const result = await replay(upstream).personalizedPrivatecontentList(
    personalizedPrivatecontentListDefault.query,
  );

  expect(result.body.result[0] as unknown).not.toHaveProperty('time');
  expect(result.body.result[0] as unknown).toHaveProperty(
    'customListItemField',
    'keep',
  );
});

test('personalized rejects a non-object input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json(personalizedDefault.response.body);
    },
  });

  const result = await Reflect.apply(api.personalized, undefined, [null]).catch(
    (error: unknown) => error,
  );

  expect(result).toMatchObject({ status: 400, body: { code: 400 } });
  expect(upstreamCalls).toBe(0);
});
