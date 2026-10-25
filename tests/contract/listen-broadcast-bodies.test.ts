import { expect, test } from 'bun:test';

import {
  createHanaMusicApi,
  ListentogetherRoomCheckBody,
  ListentogetherStatusBody,
  ListentogetherSyncPlaylistGetBody,
  RecentListenListBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import listentogetherRoomCheckAnonymous from '../fixtures/netease/listen/listentogether_room_check.anonymous.json';
import listentogetherRoomCheck from '../fixtures/netease/listen/listentogether_room_check.expired-room.json';
import listentogetherStatusAnonymous from '../fixtures/netease/listen/listentogether_status.anonymous.json';
import listentogetherStatus from '../fixtures/netease/listen/listentogether_status.default.json';
import listentogetherSyncPlaylistGetAnonymous from '../fixtures/netease/listen/listentogether_sync_playlist_get.anonymous.json';
import listentogetherSyncPlaylistGet from '../fixtures/netease/listen/listentogether_sync_playlist_get.expired-room.json';
import recentListenListAnonymous from '../fixtures/netease/listen/recent_listen_list.anonymous.json';
import recentListenList from '../fixtures/netease/listen/recent_listen_list.default.json';

// issue #102 B32 的一起听状态与最近常听读取录制：4 个模块，8 份成功录制。
// 一起听房间/列表只录到未加入或已失效状态；播客工作台的 voicelist_list/detail 与 voice_detail
// 只对播客所有者开放，本机账号没有播客，本批没有成功正文可录，未声明结构。
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
    name: 'listentogether_status',
    recording: listentogetherStatus,
    bodySchema: ListentogetherStatusBody,
    call: (upstream, status) => replay(upstream, status).listentogetherStatus(),
  },
  {
    name: 'listentogether_status anonymously',
    recording: listentogetherStatusAnonymous,
    bodySchema: ListentogetherStatusBody,
    call: (upstream, status) => replay(upstream, status).listentogetherStatus(),
  },
  {
    name: 'listentogether_sync_playlist_get for an expired room',
    recording: listentogetherSyncPlaylistGet,
    bodySchema: ListentogetherSyncPlaylistGetBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherSyncPlaylistGet(
        listentogetherSyncPlaylistGet.query,
      ),
  },
  {
    name: 'listentogether_sync_playlist_get anonymously',
    recording: listentogetherSyncPlaylistGetAnonymous,
    bodySchema: ListentogetherSyncPlaylistGetBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherSyncPlaylistGet(
        listentogetherSyncPlaylistGetAnonymous.query,
      ),
  },
  {
    name: 'listentogether_room_check for an expired room',
    recording: listentogetherRoomCheck,
    bodySchema: ListentogetherRoomCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherRoomCheck(
        listentogetherRoomCheck.query,
      ),
  },
  {
    name: 'listentogether_room_check anonymously',
    recording: listentogetherRoomCheckAnonymous,
    bodySchema: ListentogetherRoomCheckBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherRoomCheck(
        listentogetherRoomCheckAnonymous.query,
      ),
  },
  {
    name: 'recent_listen_list',
    recording: recentListenList,
    bodySchema: RecentListenListBody,
    call: (upstream, status) => replay(upstream, status).recentListenList(),
  },
  {
    name: 'recent_listen_list anonymously',
    recording: recentListenListAnonymous,
    bodySchema: RecentListenListBody,
    call: (upstream, status) => replay(upstream, status).recentListenList(),
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

test('listentogether_status rejects a body without inRoom', async () => {
  const upstream = structuredClone(listentogetherStatus.response.body) as {
    data?: Record<string, unknown>;
  };
  delete (upstream.data as Record<string, unknown>).inRoom;

  await expectUpstreamShapeRejection(replay(upstream).listentogetherStatus(), {
    module: 'listentogether_status',
    path: 'body.data.inRoom',
    expected: 'present',
    actual: 'missing',
  });
});

test('listentogether_status rejects an inRoom flag that is text', async () => {
  const upstream = structuredClone(listentogetherStatus.response.body) as {
    data: { inRoom: unknown };
  };
  upstream.data.inRoom = 'false';

  await expectUpstreamShapeRejection(replay(upstream).listentogetherStatus(), {
    module: 'listentogether_status',
    path: 'body.data.inRoom',
    expected: 'boolean',
    actual: 'string',
  });
});

test('listentogether_status rejects a body whose data is null', async () => {
  const upstream = structuredClone(listentogetherStatus.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(replay(upstream).listentogetherStatus(), {
    module: 'listentogether_status',
    path: 'body.data',
    expected: 'object',
    actual: 'null',
  });
});

test('listentogether_status drops bad loose fields and keeps null-only ones', async () => {
  const upstream = structuredClone(listentogetherStatus.response.body) as {
    data: Record<string, unknown>;
    message?: unknown;
  };
  upstream.data.anotherFollowStatus = 'no';
  upstream.data.roomInfo = { roomId: '100' };
  upstream.data.status = { state: 'VALID' };
  upstream.message = 1;

  const result = await replay(upstream).listentogetherStatus();

  expect(result.body.data).not.toHaveProperty('anotherFollowStatus');
  expect(result.body).not.toHaveProperty('message');
  expect(result.body.data.inRoom).toBe(false);
  expect(result.body.data.roomInfo).toEqual({ roomId: '100' });
  expect(result.body.data.status).toEqual({ state: 'VALID' });
});

test('listentogether_status drops a missing loose field', async () => {
  const upstream = structuredClone(listentogetherStatus.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.anotherFollowStatus;

  const result = await replay(upstream).listentogetherStatus();

  expect(result.body.data).not.toHaveProperty('anotherFollowStatus');
  expect(result.body.data.inRoom).toBe(false);
});

test('listentogether_sync_playlist_get rejects a body whose data is null', async () => {
  const upstream = structuredClone(
    listentogetherSyncPlaylistGet.response.body,
  ) as { data: unknown };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).listentogetherSyncPlaylistGet(
      listentogetherSyncPlaylistGet.query,
    ),
    {
      module: 'listentogether_sync_playlist_get',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('listentogether_sync_playlist_get rejects a body without data', async () => {
  const upstream = structuredClone(
    listentogetherSyncPlaylistGet.response.body,
  ) as { data?: unknown };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).listentogetherSyncPlaylistGet(
      listentogetherSyncPlaylistGet.query,
    ),
    {
      module: 'listentogether_sync_playlist_get',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listentogether_sync_playlist_get keeps undeclared playlist fields', async () => {
  const upstream = structuredClone(
    listentogetherSyncPlaylistGet.response.body,
  ) as { data: Record<string, unknown> };
  upstream.data.list = [{ id: 1, name: '一起听' }];
  upstream.data.currentIndex = 0;

  const result = await replay(upstream).listentogetherSyncPlaylistGet(
    listentogetherSyncPlaylistGet.query,
  );

  expect(result.body.data).toEqual({
    list: [{ id: 1, name: '一起听' }],
    currentIndex: 0,
  });
});

test('listentogether_room_check rejects a body whose data is null', async () => {
  const upstream = structuredClone(listentogetherRoomCheck.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(
    replay(upstream).listentogetherRoomCheck(listentogetherRoomCheck.query),
    {
      module: 'listentogether_room_check',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('listentogether_room_check rejects a body without a status', async () => {
  const upstream = structuredClone(listentogetherRoomCheck.response.body) as {
    data?: Record<string, unknown>;
  };
  delete (upstream.data as Record<string, unknown>).status;

  await expectUpstreamShapeRejection(
    replay(upstream).listentogetherRoomCheck(listentogetherRoomCheck.query),
    {
      module: 'listentogether_room_check',
      path: 'body.data.status',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('listentogether_room_check rejects a status that is a number', async () => {
  const upstream = structuredClone(listentogetherRoomCheck.response.body) as {
    data: { status: unknown };
  };
  upstream.data.status = 4;

  await expectUpstreamShapeRejection(
    replay(upstream).listentogetherRoomCheck(listentogetherRoomCheck.query),
    {
      module: 'listentogether_room_check',
      path: 'body.data.status',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('listentogether_room_check rejects a joinable flag that is text', async () => {
  const upstream = structuredClone(listentogetherRoomCheck.response.body) as {
    data: { joinable: unknown };
  };
  upstream.data.joinable = 'false';

  await expectUpstreamShapeRejection(
    replay(upstream).listentogetherRoomCheck(listentogetherRoomCheck.query),
    {
      module: 'listentogether_room_check',
      path: 'body.data.joinable',
      expected: 'boolean',
      actual: 'string',
    },
  );
});

test('listentogether_room_check drops bad loose fields and keeps type', async () => {
  const upstream = structuredClone(listentogetherRoomCheck.response.body) as {
    data: Record<string, unknown>;
    message?: unknown;
  };
  upstream.data.copywriting = 1;
  upstream.data.type = 'NORMAL';
  upstream.message = 1;

  const result = await replay(upstream).listentogetherRoomCheck(
    listentogetherRoomCheck.query,
  );

  expect(result.body.data).not.toHaveProperty('copywriting');
  expect(result.body).not.toHaveProperty('message');
  expect(result.body.data.joinable).toBe(false);
  expect(result.body.data.status).toBe('EXPIRED');
  expect(result.body.data.type).toBe('NORMAL');
});

test('listentogether_sync_playlist_get drops a bad message', async () => {
  const upstream = structuredClone(
    listentogetherSyncPlaylistGet.response.body,
  ) as { message?: unknown };
  upstream.message = 1;

  const result = await replay(upstream).listentogetherSyncPlaylistGet(
    listentogetherSyncPlaylistGet.query,
  );

  expect(result.body).not.toHaveProperty('message');
  expect(result.body.data).toEqual({});
});

test('listentogether_sync_playlist_get drops a missing message', async () => {
  const upstream = structuredClone(
    listentogetherSyncPlaylistGet.response.body,
  ) as { message?: unknown };
  delete upstream.message;

  const result = await replay(upstream).listentogetherSyncPlaylistGet(
    listentogetherSyncPlaylistGet.query,
  );

  expect(result.body).not.toHaveProperty('message');
  expect(result.body.data).toEqual({});
});

test('recent_listen_list rejects a body without data', async () => {
  const upstream = structuredClone(recentListenList.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(replay(upstream).recentListenList(), {
    module: 'recent_listen_list',
    path: 'body.data',
    expected: 'present',
    actual: 'missing',
  });
});

test('recent_listen_list rejects a body whose data is null', async () => {
  const upstream = structuredClone(recentListenList.response.body) as {
    data: unknown;
  };
  upstream.data = null;

  await expectUpstreamShapeRejection(replay(upstream).recentListenList(), {
    module: 'recent_listen_list',
    path: 'body.data',
    expected: 'object',
    actual: 'null',
  });
});

test('recent_listen_list rejects resources that is not an array', async () => {
  const upstream = structuredClone(recentListenList.response.body) as {
    data: { resources: unknown };
  };
  upstream.data.resources = {};

  await expectUpstreamShapeRejection(replay(upstream).recentListenList(), {
    module: 'recent_listen_list',
    path: 'body.data.resources',
    expected: 'array | null',
    actual: 'object',
  });
});

test('recent_listen_list rejects a resource without a resourceId', async () => {
  const upstream = structuredClone(recentListenList.response.body);
  delete (upstream.data.resources[0] as { resourceId?: unknown }).resourceId;

  await expectUpstreamShapeRejection(replay(upstream).recentListenList(), {
    module: 'recent_listen_list',
    path: 'body.data.resources[0].resourceId',
    expected: 'present',
    actual: 'missing',
  });
});

test('recent_listen_list rejects a resourceId that is text', async () => {
  const upstream = structuredClone(recentListenList.response.body);
  (upstream.data.resources[0] as { resourceId: unknown }).resourceId =
    '7699853347';

  await expectUpstreamShapeRejection(replay(upstream).recentListenList(), {
    module: 'recent_listen_list',
    path: 'body.data.resources[0].resourceId',
    expected: 'number',
    actual: 'string',
  });
});

test('recent_listen_list drops bad loose fields and keeps undeclared ones', async () => {
  const upstream = structuredClone(recentListenList.response.body);
  (upstream.data as { title: unknown }).title = 1;
  const resource = upstream.data.resources[0] as Record<string, unknown>;
  resource.coverUrlList = 'http://p1.music.126.net/cover.jpg';
  resource.update = 'false';
  resource.resourceCode = 'CODE';
  resource.trace = 'kept';

  const result = await replay(upstream).recentListenList();

  expect(result.body.data).not.toHaveProperty('title');
  expect(result.body.data.resources![0]).not.toHaveProperty('coverUrlList');
  expect(result.body.data.resources![0]).not.toHaveProperty('update');
  expect(result.body.data.resources![0]!.resourceCode).toBe('CODE');
  expect(
    (result.body.data.resources![0] as Record<string, unknown>).trace,
  ).toBe('kept');
  expect(result.body.data.resources![0]!.resourceId).toBe(7699853347);
  expect(result.body.data.resources![0]!.title).toBe('术力口');
});

test('listentogether_room_check drops a missing loose field', async () => {
  const upstream = structuredClone(listentogetherRoomCheck.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.copywriting;

  const result = await replay(upstream).listentogetherRoomCheck(
    listentogetherRoomCheck.query,
  );

  expect(result.body.data).not.toHaveProperty('copywriting');
  expect(result.body.data.status).toBe('EXPIRED');
});

test('recent_listen_list returns normally when resources is empty', async () => {
  const upstream = structuredClone(recentListenList.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.resources = [];

  const result = await replay(upstream).recentListenList();

  expect(result.body.data.resources).toEqual([]);
});

test('recent_listen_list returns normally when resources is missing', async () => {
  const upstream = structuredClone(recentListenList.response.body) as {
    data: Record<string, unknown>;
  };
  delete upstream.data.resources;

  const result = await replay(upstream).recentListenList();

  expect(result.body as unknown).toEqual(upstream);
});

test('recent_listen_list returns normally when resources is null', async () => {
  const upstream = structuredClone(recentListenList.response.body) as {
    data: Record<string, unknown>;
  };
  upstream.data.resources = null;

  const result = await replay(upstream).recentListenList();

  expect(result.body.data.resources).toBeNull();
});

test('recent_listen_list rejects a non-object input locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(recentListenList.response.body);
    },
  });

  expect(await settle(api.recentListenList(null as never))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'Expected <Declaration>' },
    },
  });
  expect(requests).toBe(0);
});

test('listentogether_room_check rejects a non-object input locally without calling upstream', async () => {
  let requests = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json(listentogetherRoomCheck.response.body);
    },
  });

  expect(await settle(api.listentogetherRoomCheck(null as never))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'Expected <Declaration>' },
    },
  });
  expect(requests).toBe(0);
});
