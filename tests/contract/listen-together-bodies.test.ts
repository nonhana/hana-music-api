import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  EventDelBody,
  ListentogetherAcceptBody,
  ListentogetherEndBody,
  ListentogetherHeatbeatBody,
  ListentogetherPlayCommandBody,
  ListentogetherRoomCreateBody,
  ListentogetherSyncListCommandBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import eventDelMissingId from '../fixtures/netease/event/event_del.missing-id.json';
import eventForwardRejected from '../fixtures/netease/event/event_forward.default.json';
import shareResourceRejected from '../fixtures/netease/event/share_resource.default.json';
import acceptAlreadyInRoom from '../fixtures/netease/listen/listentogether_accept.already-in-room.json';
import acceptExpiredRoom from '../fixtures/netease/listen/listentogether_accept.expired-room.json';
import listenTogetherEnd from '../fixtures/netease/listen/listentogether_end.default.json';
import listenTogetherEndSelfAcceptRoom from '../fixtures/netease/listen/listentogether_end.self-accept-room.json';
import listenTogetherHeatbeat from '../fixtures/netease/listen/listentogether_heatbeat.default.json';
import listenTogetherPlayCommand from '../fixtures/netease/listen/listentogether_play_command.default.json';
import listenTogetherRoomCreate from '../fixtures/netease/listen/listentogether_room_create.default.json';
import listenTogetherSyncListCommand from '../fixtures/netease/listen/listentogether_sync_list_command.default.json';

// issue #102 B48 的一起听写操作与动态录制。本批创建并结束了两个一起听房间：
// e0902e73ecee9403a8d393247d6857d2_1792991303（room_create → heartbeat/play_command/
// sync_list/end）和 173c2b24bbfbd4f61546d31e0af852ed_1792991389（accept 用自己的房间），
// 清理后用 listentogether_status 回读 inRoom=false（listentogether_status.after-cleanup.json）。
// 没有第二账号的真实邀请，accept 只录到 ALREADY_IN_ROOM；share_resource 和 event_forward
// 被上游风控拒绝（code 250），没有创建出测试动态，user_event 探测（未保留录制）没有新条目，
// 因此这两个模块只有拒绝录制、没有声明 ModuleBody。event_del 删的是不存在的合成 id，正文只
// 证明返回码，没有删除任何真实动态。录制里的账号编号已换成合成值 900000001。
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
  ) => Promise<{ readonly status: number; readonly body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'listentogether_room_create',
    recording: listenTogetherRoomCreate,
    bodySchema: ListentogetherRoomCreateBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherRoomCreate(),
  },
  {
    name: 'listentogether_heatbeat',
    recording: listenTogetherHeatbeat,
    bodySchema: ListentogetherHeatbeatBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherHeatbeat(
        listenTogetherHeatbeat.query,
      ),
  },
  {
    name: 'listentogether_play_command',
    recording: listenTogetherPlayCommand,
    bodySchema: ListentogetherPlayCommandBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherPlayCommand(
        listenTogetherPlayCommand.query,
      ),
  },
  {
    name: 'listentogether_sync_list_command',
    recording: listenTogetherSyncListCommand,
    bodySchema: ListentogetherSyncListCommandBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherSyncListCommand(
        listenTogetherSyncListCommand.query,
      ),
  },
  {
    name: 'listentogether_end',
    recording: listenTogetherEnd,
    bodySchema: ListentogetherEndBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherEnd(listenTogetherEnd.query),
  },
  {
    name: 'listentogether_end ends the accept test room',
    recording: listenTogetherEndSelfAcceptRoom,
    bodySchema: ListentogetherEndBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherEnd(
        listenTogetherEndSelfAcceptRoom.query,
      ),
  },
  {
    name: 'listentogether_accept for the own room',
    recording: acceptAlreadyInRoom,
    bodySchema: ListentogetherAcceptBody,
    call: (upstream, status) =>
      replay(upstream, status).listentogetherAccept(acceptAlreadyInRoom.query),
  },
  {
    name: 'event_del for a synthetic id',
    recording: eventDelMissingId,
    bodySchema: EventDelBody,
    call: (upstream, status) =>
      replay(upstream, status).eventDel(eventDelMissingId.query),
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

test('listentogether_accept passes an expired-room code through', async () => {
  expect(
    await settle(
      replay(
        acceptExpiredRoom.response.body,
        acceptExpiredRoom.response.status,
      ).listentogetherAccept(acceptExpiredRoom.query),
    ),
  ).toEqual({
    rejected: {
      status: 488,
      cookie: [],
      body: acceptExpiredRoom.response.body,
    },
  });
});

test.each<{
  name: string;
  recording: Recording;
  call: (upstream: unknown, status: number) => Promise<unknown>;
}>([
  {
    name: 'share_resource',
    recording: shareResourceRejected,
    call: (upstream, status) =>
      replay(upstream, status).shareResource(shareResourceRejected.query),
  },
  {
    name: 'event_forward',
    recording: eventForwardRejected,
    call: (upstream, status) =>
      replay(upstream, status).eventForward(eventForwardRejected.query),
  },
])(
  '$name has no ModuleBody and passes the rejection through',
  async (entry) => {
    expect(
      await settle(
        entry.call(
          entry.recording.response.body,
          entry.recording.response.status,
        ),
      ),
    ).toEqual({
      resolved: {
        status: 250,
        cookie: [],
        body: entry.recording.response.body,
      },
    });
  },
);

test('listen together and event delete bodies type strict and loose fields', () => {
  expectTypeOf<ListentogetherRoomCreateBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    ListentogetherRoomCreateBody['data']['roomInfo']['roomId']
  >().toEqualTypeOf<string>();
  expectTypeOf<
    ListentogetherRoomCreateBody['data']['roomInfo']['creatorId']
  >().toEqualTypeOf<number | null | undefined>();
  expectTypeOf<ListentogetherHeatbeatBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<ListentogetherHeatbeatBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<ListentogetherPlayCommandBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    ListentogetherSyncListCommandBody['code']
  >().toEqualTypeOf<200>();
  expectTypeOf<ListentogetherEndBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<
    NonNullable<ListentogetherEndBody['data']>['success']
  >().toEqualTypeOf<boolean | null | undefined>();
  expectTypeOf<ListentogetherAcceptBody['code']>().toEqualTypeOf<200>();
  expectTypeOf<ListentogetherAcceptBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<EventDelBody['code']>().toEqualTypeOf<200>();
});

test.each<{
  name: string;
  module: string;
  path: string;
  recording: Recording;
  call: (upstream: unknown) => Promise<unknown>;
}>([
  {
    name: 'listentogether_room_create',
    module: 'listentogether_room_create',
    path: 'body.code',
    recording: listenTogetherRoomCreate,
    call: (upstream) => replay(upstream).listentogetherRoomCreate(),
  },
  {
    name: 'listentogether_heatbeat',
    module: 'listentogether_heatbeat',
    path: 'body.code',
    recording: listenTogetherHeatbeat,
    call: (upstream) =>
      replay(upstream).listentogetherHeatbeat(listenTogetherHeatbeat.query),
  },
  {
    name: 'listentogether_play_command',
    module: 'listentogether_play_command',
    path: 'body.code',
    recording: listenTogetherPlayCommand,
    call: (upstream) =>
      replay(upstream).listentogetherPlayCommand(
        listenTogetherPlayCommand.query,
      ),
  },
  {
    name: 'listentogether_sync_list_command',
    module: 'listentogether_sync_list_command',
    path: 'body.code',
    recording: listenTogetherSyncListCommand,
    call: (upstream) =>
      replay(upstream).listentogetherSyncListCommand(
        listenTogetherSyncListCommand.query,
      ),
  },
  {
    name: 'listentogether_end',
    module: 'listentogether_end',
    path: 'body.code',
    recording: listenTogetherEnd,
    call: (upstream) =>
      replay(upstream).listentogetherEnd(listenTogetherEnd.query),
  },
  {
    name: 'listentogether_accept',
    module: 'listentogether_accept',
    path: 'body.code',
    recording: acceptAlreadyInRoom,
    call: (upstream) =>
      replay(upstream).listentogetherAccept(acceptAlreadyInRoom.query),
  },
  {
    name: 'event_del',
    module: 'event_del',
    path: 'body.code',
    recording: eventDelMissingId,
    call: (upstream) => replay(upstream).eventDel(eventDelMissingId.query),
  },
])('$name rejects a body without a return code', async (entry) => {
  const upstream = structuredClone(entry.recording.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(entry.call(upstream), {
    module: entry.module,
    path: entry.path,
    expected: 'present',
    actual: 'missing',
  });
});

test('listentogether_room_create rejects a room without roomInfo or roomId', async () => {
  const withoutRoomInfo = structuredClone(
    listenTogetherRoomCreate.response.body,
  ) as { data?: { roomInfo?: unknown } };
  delete withoutRoomInfo.data?.roomInfo;

  await expectUpstreamShapeRejection(
    replay(withoutRoomInfo).listentogetherRoomCreate(),
    {
      module: 'listentogether_room_create',
      path: 'body.data.roomInfo',
      expected: 'present',
      actual: 'missing',
    },
  );

  const withoutRoomId = structuredClone(
    listenTogetherRoomCreate.response.body,
  ) as { data: { roomInfo: { roomId?: unknown } } };
  delete withoutRoomId.data.roomInfo.roomId;

  await expectUpstreamShapeRejection(
    replay(withoutRoomId).listentogetherRoomCreate(),
    {
      module: 'listentogether_room_create',
      path: 'body.data.roomInfo.roomId',
      expected: 'present',
      actual: 'missing',
    },
  );

  const wrongRoomId = structuredClone(
    listenTogetherRoomCreate.response.body,
  ) as { data: { roomInfo: { roomId: unknown } } };
  wrongRoomId.data.roomInfo.roomId = 7;

  await expectUpstreamShapeRejection(
    replay(wrongRoomId).listentogetherRoomCreate(),
    {
      module: 'listentogether_room_create',
      path: 'body.data.roomInfo.roomId',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('listentogether_room_create rejects a missing or null data block', async () => {
  const withoutData = structuredClone(
    listenTogetherRoomCreate.response.body,
  ) as { data?: unknown };
  delete withoutData.data;

  await expectUpstreamShapeRejection(
    replay(withoutData).listentogetherRoomCreate(),
    {
      module: 'listentogether_room_create',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );

  const nullData = structuredClone(listenTogetherRoomCreate.response.body) as {
    data?: unknown;
  };
  nullData.data = null;

  await expectUpstreamShapeRejection(
    replay(nullData).listentogetherRoomCreate(),
    {
      module: 'listentogether_room_create',
      path: 'body.data',
      expected: 'object',
      actual: 'null',
    },
  );
});

test('listentogether_room_create drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(listenTogetherRoomCreate.response.body) as {
    message?: unknown;
    data: {
      type?: unknown;
      roomInfo: {
        ltType?: unknown;
        creatorId?: unknown;
        roomUsers?: unknown;
        extra?: unknown;
      };
      extra?: unknown;
    };
  };
  upstream.message = 42;
  upstream.data.type = 42;
  upstream.data.roomInfo.ltType = 'high';
  upstream.data.roomInfo.creatorId = 'creator';
  upstream.data.roomInfo.roomUsers = 'listener';
  upstream.data.roomInfo.extra = { match: 'none' };
  upstream.data.extra = 'kept';

  const result = await replay(upstream).listentogetherRoomCreate();

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).not.toHaveProperty('data.type');
  expect(result.body as unknown).not.toHaveProperty('data.roomInfo.ltType');
  expect(result.body as unknown).not.toHaveProperty('data.roomInfo.creatorId');
  expect(result.body as unknown).not.toHaveProperty('data.roomInfo.roomUsers');
  expect(result.body as unknown).toHaveProperty('data.roomInfo.extra', {
    match: 'none',
  });
  expect(result.body as unknown).toHaveProperty('data.extra', 'kept');
  expect(result.body as unknown).toHaveProperty(
    'data.roomInfo.roomId',
    'e0902e73ecee9403a8d393247d6857d2_1792991303',
  );

  const missing = structuredClone(listenTogetherRoomCreate.response.body) as {
    message?: unknown;
    data: { type?: unknown };
  };
  delete missing.message;
  delete missing.data.type;

  const missingResult = await replay(missing).listentogetherRoomCreate();

  expect(missingResult.body as unknown).not.toHaveProperty('message');
  expect(missingResult.body as unknown).not.toHaveProperty('data.type');
});

test('listentogether_heatbeat drops a bad or missing data block', async () => {
  const upstream = structuredClone(listenTogetherHeatbeat.response.body) as {
    data?: unknown;
    message?: unknown;
  };
  upstream.data = { result: 'yes', time: 5 };
  upstream.message = null;

  const result = await replay(upstream).listentogetherHeatbeat(
    listenTogetherHeatbeat.query,
  );

  expect(result.body as unknown).toHaveProperty('data', { time: 5 });
  expect(result.body as unknown).toHaveProperty('message', null);

  const missing = structuredClone(listenTogetherHeatbeat.response.body) as {
    data?: unknown;
    message?: unknown;
  };
  delete missing.data;
  delete missing.message;

  const missingResult = await replay(missing).listentogetherHeatbeat(
    listenTogetherHeatbeat.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('data');
  expect(missingResult.body as unknown).not.toHaveProperty('message');
  expect(missingResult.body as unknown).toHaveProperty('code', 200);
});

test('listentogether_play_command drops bad loose fields', async () => {
  const upstream = structuredClone(listenTogetherPlayCommand.response.body) as {
    data?: unknown;
    message?: unknown;
  };
  upstream.data = { result: 'yes' };
  upstream.message = 42;

  const result = await replay(upstream).listentogetherPlayCommand(
    listenTogetherPlayCommand.query,
  );

  expect(result.body as unknown).toHaveProperty('data', {});
  expect(result.body as unknown).not.toHaveProperty('message');

  const missing = structuredClone(listenTogetherPlayCommand.response.body) as {
    data?: unknown;
  };
  delete missing.data;

  const missingResult = await replay(missing).listentogetherPlayCommand(
    listenTogetherPlayCommand.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('data');
});

test('listentogether_sync_list_command drops bad loose fields', async () => {
  const upstream = structuredClone(
    listenTogetherSyncListCommand.response.body,
  ) as { data?: unknown; message?: unknown };
  upstream.data = { result: 'yes', message: 7 };
  upstream.message = null;

  const result = await replay(upstream).listentogetherSyncListCommand(
    listenTogetherSyncListCommand.query,
  );

  expect(result.body as unknown).toHaveProperty('data', {});
  expect(result.body as unknown).toHaveProperty('message', null);
});

test('listentogether_end drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(listenTogetherEnd.response.body) as {
    data?: unknown;
    message?: unknown;
  };
  upstream.data = {
    success: 'yes',
    roomType: 7,
    shareInfo: { title: '一起听' },
  };
  upstream.message = 42;

  const result = await replay(upstream).listentogetherEnd(
    listenTogetherEnd.query,
  );

  expect(result.body as unknown).toHaveProperty('data', {
    shareInfo: { title: '一起听' },
  });
  expect(result.body as unknown).not.toHaveProperty('message');

  const missing = structuredClone(listenTogetherEnd.response.body) as {
    data?: unknown;
  };
  delete missing.data;

  const missingResult = await replay(missing).listentogetherEnd(
    listenTogetherEnd.query,
  );

  expect(missingResult.body as unknown).not.toHaveProperty('data');
});

test('listentogether_accept drops a bad data block and keeps undeclared fields', async () => {
  const upstream = structuredClone(acceptAlreadyInRoom.response.body) as {
    data?: unknown;
    message?: unknown;
  };
  upstream.data = {
    type: 'ALREADY_IN_ROOM',
    roomInfo: { roomId: 'room' },
    extra: 'kept',
  };
  upstream.message = null;

  const result = await replay(upstream).listentogetherAccept(
    acceptAlreadyInRoom.query,
  );

  expect(result.body as unknown).toHaveProperty('data', {
    type: 'ALREADY_IN_ROOM',
    roomInfo: { roomId: 'room' },
    extra: 'kept',
  });
  expect(result.body as unknown).toHaveProperty('message', null);

  const broken = structuredClone(acceptAlreadyInRoom.response.body) as {
    data?: unknown;
  };
  broken.data = 'joined';

  const brokenResult = await replay(broken).listentogetherAccept(
    acceptAlreadyInRoom.query,
  );

  expect(brokenResult.body as unknown).not.toHaveProperty('data');
});

// 顶层 `code` 在请求层会被 Number() 归一（`'200'` 也会变成数字 200），公开调用构造不出
// Body 的 code 类型错误；共享的 code 校验路径由上面的缺失返回码用例覆盖。

test('event_del keeps undeclared fields', async () => {
  const upstream = structuredClone(eventDelMissingId.response.body) as Record<
    string,
    unknown
  >;
  upstream.message = 'deleted';

  const result = await replay(upstream).eventDel(eventDelMissingId.query);

  expect(result.body as unknown).toHaveProperty('message', 'deleted');
});

test('listentogether_sync_list_command rejects non-string lists before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(
    await settle(
      api.listentogetherSyncListCommand({
        ...listenTogetherSyncListCommand.query,
        randomList: ['1394617453'] as never,
      }),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: {
        code: 400,
        msg: 'randomList and displayList must be strings',
      },
    },
  });
  expect(upstreamCalls).toBe(0);
});
