import { expect, test } from 'bun:test';

import {
  BroadcastCategoryRegionGetBody,
  BroadcastChannelCollectListBody,
  BroadcastChannelCurrentinfoBody,
  BroadcastChannelListBody,
  createHanaMusicApi,
  VoicelistListSearchBody,
  VoicelistSearchBody,
  VoiceLyricBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import broadcastCategoryRegionGetAnonymous from '../fixtures/netease/podcast/broadcast_category_region_get.anonymous.json';
import broadcastCategoryRegionGet from '../fixtures/netease/podcast/broadcast_category_region_get.default.json';
import broadcastChannelCollectListAnonymous from '../fixtures/netease/podcast/broadcast_channel_collect_list.anonymous.json';
import broadcastChannelCollectList from '../fixtures/netease/podcast/broadcast_channel_collect_list.default.json';
import broadcastChannelCurrentinfoAnonymous from '../fixtures/netease/podcast/broadcast_channel_currentinfo.anonymous.json';
import broadcastChannelCurrentinfo from '../fixtures/netease/podcast/broadcast_channel_currentinfo.default.json';
import broadcastChannelCurrentinfoDelisted from '../fixtures/netease/podcast/broadcast_channel_currentinfo.delisted.json';
import broadcastChannelCurrentinfoProgram from '../fixtures/netease/podcast/broadcast_channel_currentinfo.program.json';
import broadcastChannelListAnonymous from '../fixtures/netease/podcast/broadcast_channel_list.anonymous.json';
import broadcastChannelListCategory from '../fixtures/netease/podcast/broadcast_channel_list.category.json';
import broadcastChannelList from '../fixtures/netease/podcast/broadcast_channel_list.default.json';
import broadcastChannelListEmpty from '../fixtures/netease/podcast/broadcast_channel_list.empty.json';
import voiceLyricAnonymous from '../fixtures/netease/podcast/voice_lyric.anonymous.json';
import voiceLyric from '../fixtures/netease/podcast/voice_lyric.default.json';
import voiceLyricUnavailable from '../fixtures/netease/podcast/voice_lyric.unavailable.json';
import voiceLyricWithoutLyric from '../fixtures/netease/podcast/voice_lyric.without-lyric.json';
import voicelistListSearchAnonymous from '../fixtures/netease/podcast/voicelist_list_search.anonymous.json';
import voicelistListSearch from '../fixtures/netease/podcast/voicelist_list_search.default.json';
import voicelistSearchAnonymous from '../fixtures/netease/podcast/voicelist_search.anonymous.json';
import voicelistSearch from '../fixtures/netease/podcast/voicelist_search.default.json';

// issue #102 B31 的播客/电台读取录制：7 个模块，18 份登录/匿名成功录制和 2 份业务拒绝。
// 播客工作台的 voicelist_list/detail/trans 与 voice_detail 只对播客所有者开放，本机账号没有播客，
// 本批没有成功正文可录，未声明结构。
const replay = (upstream: unknown, status = 200) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream, { status }),
  });

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
    name: 'broadcast_category_region_get',
    recording: broadcastCategoryRegionGet,
    bodySchema: BroadcastCategoryRegionGetBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastCategoryRegionGet(),
  },
  {
    name: 'broadcast_category_region_get anonymously',
    recording: broadcastCategoryRegionGetAnonymous,
    bodySchema: BroadcastCategoryRegionGetBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastCategoryRegionGet(),
  },
  {
    name: 'broadcast_channel_list',
    recording: broadcastChannelList,
    bodySchema: BroadcastChannelListBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelList(broadcastChannelList.query),
  },
  {
    name: 'broadcast_channel_list anonymously',
    recording: broadcastChannelListAnonymous,
    bodySchema: BroadcastChannelListBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelList(
        broadcastChannelListAnonymous.query,
      ),
  },
  {
    name: 'broadcast_channel_list by category',
    recording: broadcastChannelListCategory,
    bodySchema: BroadcastChannelListBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelList(
        broadcastChannelListCategory.query,
      ),
  },
  {
    name: 'broadcast_channel_list for an unknown region',
    recording: broadcastChannelListEmpty,
    bodySchema: BroadcastChannelListBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelList(
        broadcastChannelListEmpty.query,
      ),
  },
  {
    name: 'broadcast_channel_currentinfo',
    recording: broadcastChannelCurrentinfo,
    bodySchema: BroadcastChannelCurrentinfoBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelCurrentinfo(
        broadcastChannelCurrentinfo.query,
      ),
  },
  {
    name: 'broadcast_channel_currentinfo anonymously',
    recording: broadcastChannelCurrentinfoAnonymous,
    bodySchema: BroadcastChannelCurrentinfoBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelCurrentinfo(
        broadcastChannelCurrentinfoAnonymous.query,
      ),
  },
  {
    name: 'broadcast_channel_currentinfo while a program is on air',
    recording: broadcastChannelCurrentinfoProgram,
    bodySchema: BroadcastChannelCurrentinfoBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelCurrentinfo(
        broadcastChannelCurrentinfoProgram.query,
      ),
  },
  {
    name: 'broadcast_channel_collect_list',
    recording: broadcastChannelCollectList,
    bodySchema: BroadcastChannelCollectListBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelCollectList(),
  },
  {
    name: 'broadcast_channel_collect_list anonymously',
    recording: broadcastChannelCollectListAnonymous,
    bodySchema: BroadcastChannelCollectListBody,
    call: (upstream, status) =>
      replay(upstream, status).broadcastChannelCollectList(),
  },
  {
    name: 'voicelist_search',
    recording: voicelistSearch,
    bodySchema: VoicelistSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).voicelistSearch(voicelistSearch.query),
  },
  {
    name: 'voicelist_search anonymously',
    recording: voicelistSearchAnonymous,
    bodySchema: VoicelistSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).voicelistSearch(voicelistSearchAnonymous.query),
  },
  {
    name: 'voicelist_list_search',
    recording: voicelistListSearch,
    bodySchema: VoicelistListSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).voicelistListSearch(voicelistListSearch.query),
  },
  {
    name: 'voicelist_list_search anonymously',
    recording: voicelistListSearchAnonymous,
    bodySchema: VoicelistListSearchBody,
    call: (upstream, status) =>
      replay(upstream, status).voicelistListSearch(
        voicelistListSearchAnonymous.query,
      ),
  },
  {
    name: 'voice_lyric',
    recording: voiceLyric,
    bodySchema: VoiceLyricBody,
    call: (upstream, status) =>
      replay(upstream, status).voiceLyric(voiceLyric.query),
  },
  {
    name: 'voice_lyric anonymously',
    recording: voiceLyricAnonymous,
    bodySchema: VoiceLyricBody,
    call: (upstream, status) =>
      replay(upstream, status).voiceLyric(voiceLyricAnonymous.query),
  },
  {
    name: 'voice_lyric for a voice without lyrics',
    recording: voiceLyricWithoutLyric,
    bodySchema: VoiceLyricBody,
    call: (upstream, status) =>
      replay(upstream, status).voiceLyric(voiceLyricWithoutLyric.query),
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

test('broadcast_channel_currentinfo for a delisted channel is rejected with the upstream status', async () => {
  expect(
    await settle(
      replay(
        broadcastChannelCurrentinfoDelisted.response.body,
        200,
      ).broadcastChannelCurrentinfo(broadcastChannelCurrentinfoDelisted.query),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: broadcastChannelCurrentinfoDelisted.response.body,
    },
  });
});

test('voice_lyric for an inaccessible voice is rejected with the upstream status', async () => {
  expect(
    await settle(
      replay(voiceLyricUnavailable.response.body, 200).voiceLyric(
        voiceLyricUnavailable.query,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: voiceLyricUnavailable.response.body,
    },
  });
});

test('broadcast_category_region_get rejects a body without the category list', async () => {
  const upstream = structuredClone(
    broadcastCategoryRegionGet.response.body,
  ) as { data?: unknown };
  delete (upstream.data as Record<string, unknown>).categoryList;

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastCategoryRegionGet(),
    {
      module: 'broadcast_category_region_get',
      path: 'body.data.categoryList',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('broadcast_category_region_get rejects a region whose id is text', async () => {
  const upstream = structuredClone(
    broadcastCategoryRegionGet.response.body,
  ) as unknown as { data: { regionList: Array<{ id: unknown }> } };
  upstream.data.regionList[0]!.id = '5';

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastCategoryRegionGet(),
    {
      module: 'broadcast_category_region_get',
      path: 'body.data.regionList[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('broadcast_channel_list rejects a station without an id', async () => {
  const upstream = structuredClone(broadcastChannelList.response.body);
  delete (upstream.data.list[0] as { id?: unknown }).id;

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastChannelList(broadcastChannelList.query),
    {
      module: 'broadcast_channel_list',
      path: 'body.data.list[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('broadcast_channel_list rejects a station list that is not an array', async () => {
  const upstream = structuredClone(broadcastChannelList.response.body) as {
    data: { list: unknown };
  };
  upstream.data.list = {};

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastChannelList(broadcastChannelList.query),
    {
      module: 'broadcast_channel_list',
      path: 'body.data.list',
      expected: 'array',
      actual: 'object',
    },
  );
});

test('broadcast_channel_currentinfo rejects a body without a play url', async () => {
  const upstream = structuredClone(broadcastChannelCurrentinfo.response.body);
  delete (upstream.data as { playUrl?: unknown }).playUrl;

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastChannelCurrentinfo(
      broadcastChannelCurrentinfo.query,
    ),
    {
      module: 'broadcast_channel_currentinfo',
      path: 'body.data.playUrl',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('broadcast_channel_currentinfo rejects a channel whose id is null', async () => {
  const upstream = structuredClone(broadcastChannelCurrentinfo.response.body);
  (upstream.data as { id: unknown }).id = null;

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastChannelCurrentinfo(
      broadcastChannelCurrentinfo.query,
    ),
    {
      module: 'broadcast_channel_currentinfo',
      path: 'body.data.id',
      expected: 'number',
      actual: 'null',
    },
  );
});

test('broadcast_channel_collect_list rejects a body without a return code', async () => {
  const upstream = structuredClone(
    broadcastChannelCollectList.response.body,
  ) as { code?: unknown };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).broadcastChannelCollectList(),
    {
      module: 'broadcast_channel_collect_list',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('voicelist_search rejects a body without data', async () => {
  const upstream = structuredClone(voicelistSearch.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).voicelistSearch(voicelistSearch.query),
    {
      module: 'voicelist_search',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('voicelist_list_search rejects a body whose data is null', async () => {
  const upstream = structuredClone(voicelistListSearch.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).voicelistListSearch(voicelistListSearch.query),
    {
      module: 'voicelist_list_search',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('voice_lyric rejects a lyric whose url is text', async () => {
  const upstream = structuredClone(voiceLyric.response.body);
  (upstream.data as { lyricUrl: unknown }).lyricUrl = 1;

  await expectUpstreamShapeRejection(
    replay(upstream).voiceLyric(voiceLyric.query),
    {
      module: 'voice_lyric',
      path: 'body.data.lyricUrl',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('broadcast_category_region_get drops a bad name and keeps undeclared fields', async () => {
  const upstream = structuredClone(broadcastCategoryRegionGet.response.body);
  (upstream.data.categoryList[0] as { name: unknown }).name = 1;
  (upstream.data.categoryList[0] as Record<string, unknown>).categoryTrace =
    'kept';
  (upstream.data as Record<string, unknown>).trace = 'kept';

  const result = await replay(upstream).broadcastCategoryRegionGet();

  expect(result.body.data.categoryList[0]).not.toHaveProperty('name');
  expect(
    (result.body.data.categoryList[0] as Record<string, unknown>).categoryTrace,
  ).toBe('kept');
  expect((result.body.data as Record<string, unknown>).trace).toBe('kept');
});

test('broadcast_channel_list drops bad loose fields and keeps the rest', async () => {
  const upstream = structuredClone(broadcastChannelList.response.body);
  (upstream.data.list[0] as { coverUrl: unknown }).coverUrl = 1;
  (upstream.data.list[0] as { roomId: unknown }).roomId = '0';
  (upstream.data.list[0] as Record<string, unknown>).trace = 'kept';
  (upstream.data as { total: unknown }).total = null;

  const result = await replay(upstream).broadcastChannelList(
    broadcastChannelList.query,
  );

  expect(result.body.data.list[0]).not.toHaveProperty('coverUrl');
  expect(result.body.data.list[0]).not.toHaveProperty('roomId');
  expect(result.body.data.list[0]!.name).toBe(
    broadcastChannelList.response.body.data.list[0]!.name,
  );
  expect((result.body.data.list[0] as Record<string, unknown>).trace).toBe(
    'kept',
  );
  expect(result.body.data.total).toBeNull();
});

test('broadcast_channel_list drops a missing loose field', async () => {
  const upstream = structuredClone(broadcastChannelList.response.body);
  delete (upstream.data.list[0] as { coverUrl?: unknown }).coverUrl;

  const result = await replay(upstream).broadcastChannelList(
    broadcastChannelList.query,
  );

  expect(result.body.data.list[0]).not.toHaveProperty('coverUrl');
  expect(result.body.data.list[0]!.name).toBe(
    broadcastChannelList.response.body.data.list[0]!.name,
  );
});

test('broadcast_channel_currentinfo drops bad program fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(
    broadcastChannelCurrentinfoProgram.response.body,
  );
  (upstream.data as { programName: unknown }).programName = 1;
  (upstream.data as { thirdProgramId: unknown }).thirdProgramId = 123;
  (upstream.data as Record<string, unknown>).broadcaster = [{ name: '主播' }];

  const result = await replay(upstream).broadcastChannelCurrentinfo(
    broadcastChannelCurrentinfoProgram.query,
  );

  expect(result.body.data).not.toHaveProperty('programName');
  expect(result.body.data).not.toHaveProperty('thirdProgramId');
  expect(result.body.data.programId).toBe(1174042);
  expect((result.body.data as Record<string, unknown>).broadcaster).toEqual([
    { name: '主播' },
  ]);
});

test('broadcast_channel_collect_list drops a bad message and keeps the list', async () => {
  const upstream = structuredClone(
    broadcastChannelCollectList.response.body,
  ) as unknown as Record<string, unknown>;
  upstream.message = 1;
  upstream.data = [{ id: 131, name: '东莞综合广播' }];

  const result = await replay(upstream).broadcastChannelCollectList();

  expect(result.body).not.toHaveProperty('message');
  expect(result.body.data).toEqual([{ id: 131, name: '东莞综合广播' }]);
});

test('voicelist_search keeps a null total and the undeclared list', async () => {
  const upstream = structuredClone(voicelistSearch.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.total = null;
  upstream.data.list = [{ id: 1, name: '播客' }];

  const result = await replay(upstream).voicelistSearch(voicelistSearch.query);

  expect(result.body.data.total).toBeNull();
  expect(result.body.data.list).toEqual([{ id: 1, name: '播客' }]);
});

test('voicelist_list_search drops a bad hasMore and keeps the undeclared list', async () => {
  const upstream = structuredClone(voicelistListSearch.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.hasMore = 'false';
  upstream.data.list = [{ voiceId: 1 }];

  const result = await replay(upstream).voicelistListSearch(
    voicelistListSearch.query,
  );

  expect(result.body.data).not.toHaveProperty('hasMore');
  expect(result.body.data.list).toEqual([{ voiceId: 1 }]);
});

test('voice_lyric keeps the null-only source field as an undeclared value', async () => {
  const upstream = structuredClone(voiceLyric.response.body);
  (upstream.data as { source: unknown }).source = 'voice';
  (upstream.data as Record<string, unknown>).trace = 'kept';

  const result = await replay(upstream).voiceLyric(voiceLyric.query);

  expect((result.body.data as { source?: unknown }).source).toBe('voice');
  expect((result.body.data as { lyricUrl: string }).lyricUrl).toBe(
    voiceLyric.response.body.data.lyricUrl,
  );
  expect((result.body.data as Record<string, unknown>).trace).toBe('kept');
});

test('voice_lyric returns normally when data is missing', async () => {
  const upstream = structuredClone(voiceLyric.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  const result = await replay(upstream).voiceLyric(voiceLyric.query);

  expect(result.body as unknown).toEqual(upstream);
});

test('voice_lyric rejects a present lyric without a url', async () => {
  const upstream = structuredClone(voiceLyric.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.lyricUrl;

  await expectUpstreamShapeRejection(
    replay(upstream).voiceLyric(voiceLyric.query),
    {
      module: 'voice_lyric',
      path: 'body.data.lyricUrl',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('broadcast_channel_list rejects a non-object input locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(broadcastChannelList.response.body);
    },
  });

  expect(await settle(api.broadcastChannelList(null as never))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'Expected <Declaration>' },
    },
  });
  expect(requests).toBe(0);
});
