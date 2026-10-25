import { expect, test } from 'bun:test';

import {
  createHanaMusicApi,
  PlaylistImportNameTaskCreateBody,
  PlaylistImportTaskStatusBody,
  PlaylistTrackAddBody,
  PlaylistTrackDeleteBody,
  PlaylistUpdateBody,
  PlaylistUpdatePlaycountBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import importCreateMissingText from '../fixtures/netease/playlist-write/playlist_import_name_task_create.missing-text.json';
import importCreate from '../fixtures/netease/playlist-write/playlist_import_name_task_create.no-match.json';
import importStatusMissingId from '../fixtures/netease/playlist-write/playlist_import_task_status.missing-id.json';
import importStatus from '../fixtures/netease/playlist-write/playlist_import_task_status.no-match.json';
import importStatusUnknown from '../fixtures/netease/playlist-write/playlist_import_task_status.unknown-task.json';
import trackAddDeleted from '../fixtures/netease/playlist-write/playlist_track_add.deleted-playlist.json';
import trackAddDenied from '../fixtures/netease/playlist-write/playlist_track_add.denied.json';
import trackAddMissingPid from '../fixtures/netease/playlist-write/playlist_track_add.missing-pid.json';
import trackDeleteDeleted from '../fixtures/netease/playlist-write/playlist_track_delete.deleted-playlist.json';
import trackDeleteDenied from '../fixtures/netease/playlist-write/playlist_track_delete.denied.json';
import trackDeleteMissingId from '../fixtures/netease/playlist-write/playlist_track_delete.missing-id.json';
import updateDeleted from '../fixtures/netease/playlist-write/playlist_update.deleted-playlist.json';
import update from '../fixtures/netease/playlist-write/playlist_update.ok.json';
import updatePartialFailure from '../fixtures/netease/playlist-write/playlist_update.partial-failure.json';
import playcountDeleted from '../fixtures/netease/playlist-write/playlist_update_playcount.deleted-playlist.json';
import playcountMissingId from '../fixtures/netease/playlist-write/playlist_update_playcount.missing-id.json';
import playcount from '../fixtures/netease/playlist-write/playlist_update_playcount.ok.json';

// issue #102 B6 的录制来自本机登录账号（context.viewer 是 authenticated），
// 歌单类写操作都写在一个临时歌单上，录完已删除；导入任务只建任务，不建歌单。
// track_add/track_delete 的成功路径上游拒绝，只有失败录制。
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
  ) => Promise<{ body: unknown }>;
};

const cases: Array<Case> = [
  {
    name: 'playlist_update',
    recording: update,
    bodySchema: PlaylistUpdateBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistUpdate(update.query),
  },
  {
    name: 'playlist_update against an already deleted playlist',
    recording: updateDeleted,
    bodySchema: PlaylistUpdateBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistUpdate(updateDeleted.query),
  },
  {
    name: 'playlist_update with one rejected sub-route',
    recording: updatePartialFailure,
    bodySchema: PlaylistUpdateBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistUpdate(updatePartialFailure.query),
  },
  {
    name: 'playlist_update_playcount',
    recording: playcount,
    bodySchema: PlaylistUpdatePlaycountBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistUpdatePlaycount(playcount.query),
  },
  {
    name: 'playlist_update_playcount against an already deleted playlist',
    recording: playcountDeleted,
    bodySchema: PlaylistUpdatePlaycountBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistUpdatePlaycount(playcountDeleted.query),
  },
  {
    name: 'playlist_import_name_task_create without matched songs',
    recording: importCreate,
    bodySchema: PlaylistImportNameTaskCreateBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistImportNameTaskCreate(importCreate.query),
  },
  {
    name: 'playlist_import_task_status for a task without matched songs',
    recording: importStatus,
    bodySchema: PlaylistImportTaskStatusBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistImportTaskStatus(importStatus.query),
  },
  {
    name: 'playlist_import_task_status for an unknown task',
    recording: importStatusUnknown,
    bodySchema: PlaylistImportTaskStatusBody,
    call: (upstream, status) =>
      replay(upstream, status).playlistImportTaskStatus(
        importStatusUnknown.query,
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

test.each([
  {
    name: 'playlist_track_add',
    recording: trackAddDenied,
    bodySchema: PlaylistTrackAddBody,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackAdd(trackAddDenied.query),
  },
  {
    name: 'playlist_track_delete',
    recording: trackDeleteDenied,
    bodySchema: PlaylistTrackDeleteBody,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackDelete(trackDeleteDenied.query),
  },
] as Array<Case>)(
  '$name accepts a success body that carries extra fields',
  async (entry) => {
    // 上游对自建歌单也回 401 无权限操作歌单，成功正文没有录到；这里只验证边界形状。
    const upstream = { code: 200, count: 1 };

    const result = await entry.call(upstream, 200);

    expect(result.body).toEqual(upstream);
    const validated = validateSync(entry.bodySchema, upstream);
    expect(validated.issues).toBeUndefined();
    expect(validated.value).toEqual(upstream);
  },
);

test.each([
  {
    module: 'playlist_track_add',
    bodySchema: PlaylistTrackAddBody,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackAdd(trackAddDenied.query),
  },
  {
    module: 'playlist_track_delete',
    bodySchema: PlaylistTrackDeleteBody,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackDelete(trackDeleteDenied.query),
  },
])(
  '$module rejects a body without a return code',
  async ({ module, bodySchema, call }) => {
    await expectUpstreamShapeRejection(call({ msg: 'x' }, 200), {
      module,
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    });

    // 请求层会把数字字符串 code 归一成数字，客户端路径测不到类型错，用结构定义直接验证。
    const validated = validateSync(bodySchema, { code: '200' });
    expect(validated.issues).toEqual([
      { path: ['code'], message: 'Expected 200' },
    ]);
  },
);

test.each([
  {
    module: 'playlist_track_add',
    call: (body: string) =>
      replayRaw(body, 200).playlistTrackAdd(trackAddDenied.query),
  },
  {
    module: 'playlist_track_delete',
    call: (body: string) =>
      replayRaw(body, 200).playlistTrackDelete(trackDeleteDenied.query),
  },
])('$module rejects a non-object body', async ({ module, call }) => {
  await expectUpstreamShapeRejection(call(''), {
    module,
    path: 'body',
    expected: 'object',
    actual: 'string',
  });
});

test('playlist_track_add rejects non-primitive ids before sending', async () => {
  let requests = 0;
  const client = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(await settle(client.playlistTrackAdd({ ids: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'ids must be a primitive value' },
    },
  });
  expect(requests).toBe(0);
});

test('playlist_track_delete rejects non-primitive ids before sending', async () => {
  let requests = 0;
  const client = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(await settle(client.playlistTrackDelete({ ids: {} }))).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'ids must be a primitive value' },
    },
  });
  expect(requests).toBe(0);
});

test('playlist_import_name_task_create rejects non-primitive text before sending', async () => {
  let requests = 0;
  const client = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      requests += 1;
      return Response.json({ code: 200 });
    },
  });

  expect(
    await settle(client.playlistImportNameTaskCreate({ text: {} })),
  ).toEqual({
    rejected: {
      status: 400,
      cookie: [],
      body: { code: 400, msg: 'text must be a primitive value' },
    },
  });
  expect(requests).toBe(0);
});

test.each([
  { name: 'playlist_track_add', recording: trackAddDenied },
  { name: 'playlist_track_delete', recording: trackDeleteDenied },
])('$name relays the recorded 401 permission rejection', async (entry) => {
  const client = replay(entry.recording.response.body);
  const call =
    entry.name === 'playlist_track_add'
      ? client.playlistTrackAdd(entry.recording.query)
      : client.playlistTrackDelete(entry.recording.query);

  expect(await settle(call)).toEqual({
    rejected: {
      status: 401,
      body: entry.recording.response.body,
      cookie: [],
    },
  });
});

test.each([
  {
    name: 'playlist_track_add',
    recording: trackAddDeleted,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackAdd(trackAddDeleted.query),
  },
  {
    name: 'playlist_track_delete',
    recording: trackDeleteDeleted,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackDelete(trackDeleteDeleted.query),
  },
])('$name relays the recorded 404 missing playlist', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 404,
      body: entry.recording.response.body,
      cookie: [],
    },
  });
});

test.each([
  {
    name: 'playlist_track_add',
    recording: trackAddMissingPid,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackAdd(trackAddMissingPid.query),
  },
  {
    name: 'playlist_track_delete',
    recording: trackDeleteMissingId,
    call: (upstream: unknown, status: number) =>
      replay(upstream, status).playlistTrackDelete(trackDeleteMissingId.query),
  },
])('$name relays the recorded 400 missing parameter', async (entry) => {
  expect(
    await settle(
      entry.call(
        entry.recording.response.body,
        entry.recording.response.status,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      body: entry.recording.response.body,
      cookie: [],
    },
  });
});

test('playlist_import_name_task_create relays the recorded 400 rejection', async () => {
  expect(
    await settle(
      replay(
        importCreateMissingText.response.body,
      ).playlistImportNameTaskCreate(importCreateMissingText.query),
    ),
  ).toEqual({
    rejected: {
      status: 400,
      body: importCreateMissingText.response.body,
      cookie: [],
    },
  });
});

test('playlist_import_task_status relays the recorded 500 rejection', async () => {
  expect(
    await settle(
      replay(importStatusMissingId.response.body).playlistImportTaskStatus(
        importStatusMissingId.query,
      ),
    ),
  ).toEqual({
    rejected: {
      status: 500,
      body: importStatusMissingId.response.body,
      cookie: [],
    },
  });
});

test('playlist_update_playcount keeps the normalized empty HTTP 400 body', async () => {
  const result = await settle(
    replayRaw(
      playcountMissingId.response.body,
      playcountMissingId.response.status,
    ).playlistUpdatePlaycount(playcountMissingId.query),
  );

  expect(result).toEqual({
    resolved: { status: 200, cookie: [], body: '' },
  });
  const validated = validateSync(
    PlaylistUpdatePlaycountBody,
    playcountMissingId.response.body,
  );
  expect(validated.issues).toBeUndefined();
  expect(validated.value).toBe('');
});

test('playlist_update rejects a batch without one of the routes', async () => {
  const upstream = structuredClone(update.response.body) as Record<
    string,
    unknown
  >;
  delete upstream['/api/playlist/tags/update'];

  await expectUpstreamShapeRejection(
    replay(upstream).playlistUpdate(update.query),
    {
      module: 'playlist_update',
      path: 'body./api/playlist/tags/update',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_update rejects a batch without a top-level return code', async () => {
  const upstream = structuredClone(update.response.body) as {
    code?: unknown;
  };
  delete upstream.code;

  await expectUpstreamShapeRejection(
    replay(upstream).playlistUpdate(update.query),
    {
      module: 'playlist_update',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_update drops a bad loose message and keeps the tightened route codes', async () => {
  const upstream = {
    code: 200,
    '/api/playlist/desc/update': { code: 200, message: 5 },
    '/api/playlist/tags/update': { code: 400, message: '标签数据非法' },
    '/api/playlist/update/name': { code: 200, extra: { id: 1 } },
  };

  const result = await replay(upstream).playlistUpdate(update.query);

  expect(result.body).toEqual({
    code: 200,
    '/api/playlist/desc/update': { code: 200 },
    '/api/playlist/tags/update': { code: 400, message: '标签数据非法' },
    '/api/playlist/update/name': { code: 200, extra: { id: 1 } },
  });
});

test('playlist_update rejects a sub-route without a code', async () => {
  await expectUpstreamShapeRejection(
    replay({
      code: 200,
      '/api/playlist/desc/update': {},
      '/api/playlist/tags/update': { code: 200 },
      '/api/playlist/update/name': { code: 200 },
    }).playlistUpdate(update.query),
    {
      module: 'playlist_update',
      path: 'body./api/playlist/desc/update.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_update rejects a sub-route code that is not a number', async () => {
  await expectUpstreamShapeRejection(
    replay({
      code: 200,
      '/api/playlist/desc/update': { code: '200' },
      '/api/playlist/tags/update': { code: 200 },
      '/api/playlist/update/name': { code: 200 },
    }).playlistUpdate(update.query),
    {
      module: 'playlist_update',
      path: 'body./api/playlist/desc/update.code',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('playlist_import_name_task_create rejects a body without a return code', async () => {
  await expectUpstreamShapeRejection(
    replay({ msg: '' }).playlistImportNameTaskCreate(importCreate.query),
    {
      module: 'playlist_import_name_task_create',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_import_name_task_create validates the tightened return code', () => {
  const validated = validateSync(PlaylistImportNameTaskCreateBody, {
    code: '200',
  });

  expect(validated.issues).toEqual([
    { path: ['code'], message: 'Expected 200' },
  ]);
});

test('playlist_import_name_task_create tolerates a body without data', async () => {
  const result = await replay({
    code: 200,
    msg: '',
  }).playlistImportNameTaskCreate(importCreate.query);

  expect(result.body).toEqual({ code: 200, msg: '' });
});

test('playlist_import_name_task_create drops a bad loose task id and keeps undeclared fields', async () => {
  const upstream = {
    code: 200,
    data: { taskId: '202306216', extra: [1] },
    msg: 5,
    message: null,
    extra: { a: 1 },
  };

  const result = await replay(upstream).playlistImportNameTaskCreate(
    importCreate.query,
  );

  expect(result.body).toEqual({
    code: 200,
    data: { extra: [1] },
    message: null,
    extra: { a: 1 },
  });
});

test('playlist_import_task_status rejects a body without a return code', async () => {
  await expectUpstreamShapeRejection(
    replay({ data: { tasks: [] } }).playlistImportTaskStatus(
      importStatus.query,
    ),
    {
      module: 'playlist_import_task_status',
      path: 'body.code',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_import_task_status rejects a task id that is not a number', async () => {
  await expectUpstreamShapeRejection(
    replay({
      code: 200,
      data: { tasks: [{ id: '202306216', status: 'X' }] },
    }).playlistImportTaskStatus(importStatus.query),
    {
      module: 'playlist_import_task_status',
      path: 'body.data.tasks[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('playlist_import_task_status rejects a task without a status', async () => {
  await expectUpstreamShapeRejection(
    replay({
      code: 200,
      data: { tasks: [{ id: 202306216 }] },
    }).playlistImportTaskStatus(importStatus.query),
    {
      module: 'playlist_import_task_status',
      path: 'body.data.tasks[0].status',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_import_task_status rejects a body without the task list', async () => {
  await expectUpstreamShapeRejection(
    replay({ code: 200, data: {} }).playlistImportTaskStatus(
      importStatus.query,
    ),
    {
      module: 'playlist_import_task_status',
      path: 'body.data.tasks',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('playlist_import_task_status drops bad loose task fields and keeps undeclared ones', async () => {
  const upstream = {
    code: 200,
    data: {
      tasks: [
        {
          id: 202306216,
          status: 'NOT_SONG_MATCH',
          playlistId: '0',
          succCount: null,
          imgUrl: null,
          playlistName: null,
          extra: [1],
        },
      ],
      taskProcess: 5,
      extra: { a: 1 },
    },
    msg: 5,
    message: null,
  };

  const result = await replay(upstream).playlistImportTaskStatus(
    importStatus.query,
  );

  expect(result.body).toEqual({
    code: 200,
    data: {
      tasks: [
        {
          id: 202306216,
          status: 'NOT_SONG_MATCH',
          succCount: null,
          imgUrl: null,
          playlistName: null,
          extra: [1],
        },
      ],
      extra: { a: 1 },
    },
    message: null,
  });
});

test('playlist_update_playcount rejects a body that is neither code 200 nor an empty string', async () => {
  await expectUpstreamShapeRejection(
    replay({ msg: 'x' }).playlistUpdatePlaycount(playcount.query),
    {
      module: 'playlist_update_playcount',
      path: 'body',
      expected: 'object with code 200 or an empty string',
      actual: 'object',
    },
  );
});

test('playlist_update_playcount keeps undeclared fields', async () => {
  const result = await replay({
    code: 200,
    extra: 'kept',
  }).playlistUpdatePlaycount(playcount.query);

  expect(result.body).toEqual({ code: 200, extra: 'kept' });
});
