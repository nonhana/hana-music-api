import { expect, expectTypeOf, test } from 'bun:test';

import {
  createHanaMusicApi,
  MlogToVideoBody,
  MlogUrlBody,
  UserAudioBody,
} from '../../index.ts';
import type { Recording, Validator } from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import mlogToVideo from '../fixtures/netease/voice/mlog_to_video.default.json';
import mlogToVideoNoVideo from '../fixtures/netease/voice/mlog_to_video.no-video.json';
import mlogToVideoSongShare from '../fixtures/netease/voice/mlog_to_video.song-share.json';
import mlogUrl from '../fixtures/netease/voice/mlog_url.default.json';
import mlogUrlInvalid from '../fixtures/netease/voice/mlog_url.invalid.json';
import mlogUrlSongShare from '../fixtures/netease/voice/mlog_url.song-share.json';
import userAudio from '../fixtures/netease/voice/user_audio.default.json';
import userAudioEmpty from '../fixtures/netease/voice/user_audio.empty.json';

// issue #102 B43 的录制：mlog 播放信息、mlog 转视频 id 和用户创建的电台。三个模块的成功录制都没有
// 账号资料；mlog_url 的视频 mlog 用登录调用录制（匿名调用有时不返回 song，showCollect 可能
// true/false，songs/relateSongs 3/3 存在；登录录制是为了拿到 isLiked/privilege 等登录态完整证据），
// 分享歌曲的 mlog、mlog_to_video 和 user_audio 用匿名调用录制；user_audio 另用合成用户编号
// 900000002 录了空结果。
// voice_detail、voicelist_detail、voicelist_list 是播客工作台接口：当前账号没有声音和播客，只能
// 录到“不允许操作他人的声音”“播客不存在”“只允许操作自己的播客”“参数错误”四类拒绝消息，以及
// voice_detail 未知 id 的 `code: 200` + `data: null` 空成功，没有带字段的成功正文，因此本批不为
// 它们声明 ModuleBody，缺口见七份录制（6 拒绝 + 1 空成功）。
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
    name: 'mlog_url',
    recording: mlogUrl,
    bodySchema: MlogUrlBody,
    call: (upstream, status) => replay(upstream, status).mlogUrl(mlogUrl.query),
  },
  {
    name: 'mlog_url for a shared song',
    recording: mlogUrlSongShare,
    bodySchema: MlogUrlBody,
    call: (upstream, status) =>
      replay(upstream, status).mlogUrl(mlogUrlSongShare.query),
  },
  {
    name: 'mlog_to_video',
    recording: mlogToVideo,
    bodySchema: MlogToVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).mlogToVideo(mlogToVideo.query),
  },
  {
    name: 'mlog_to_video for a shared song',
    recording: mlogToVideoSongShare,
    bodySchema: MlogToVideoBody,
    call: (upstream, status) =>
      replay(upstream, status).mlogToVideo(mlogToVideoSongShare.query),
  },
  {
    name: 'user_audio',
    recording: userAudio,
    bodySchema: UserAudioBody,
    call: (upstream, status) =>
      replay(upstream, status).userAudio(userAudio.query),
  },
  {
    name: 'user_audio without created radios',
    recording: userAudioEmpty,
    bodySchema: UserAudioBody,
    call: (upstream, status) =>
      replay(upstream, status).userAudio(userAudioEmpty.query),
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
    name: 'mlog_url',
    recording: mlogUrlInvalid,
    call: (upstream, status) =>
      replay(upstream, status).mlogUrl(mlogUrlInvalid.query),
  },
  {
    name: 'mlog_to_video',
    recording: mlogToVideoNoVideo,
    call: (upstream, status) =>
      replay(upstream, status).mlogToVideo(mlogToVideoNoVideo.query),
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

test('voice and mlog bodies type their tightened records and loose fields', () => {
  expectTypeOf<MlogUrlBody['data']['id']>().toEqualTypeOf<string>();
  expectTypeOf<MlogUrlBody['data']['resource']['id']>().toEqualTypeOf<string>();
  expectTypeOf<
    MlogUrlBody['data']['resource']['content']['video']['urlInfo']['url']
  >().toEqualTypeOf<string>();
  expectTypeOf<MlogUrlBody['data']['recmdType']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<MlogUrlBody['data']['resource']['commentCount']>().toEqualTypeOf<
    number | null | undefined
  >();
  expectTypeOf<MlogToVideoBody['data']>().toEqualTypeOf<string>();
  expectTypeOf<MlogToVideoBody['message']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<
    UserAudioBody['djRadios'][number]['id']
  >().toEqualTypeOf<number>();
  expectTypeOf<UserAudioBody['djRadios'][number]['rcmdtext']>().toEqualTypeOf<
    string | null | undefined
  >();
  expectTypeOf<UserAudioBody['count']>().toEqualTypeOf<
    number | null | undefined
  >();
});

test('voice and mlog modules reject invalid input before calling upstream', async () => {
  let upstreamCalls = 0;
  const api = createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => {
      upstreamCalls += 1;
      return Response.json({ code: 200 });
    },
  });

  const calls: Array<() => Promise<unknown>> = [
    () => api.mlogUrl(null as never),
    () => api.mlogToVideo(null as never),
    () => api.userAudio(null as never),
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

test('mlog_url rejects a body without an mlog record', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as { data?: unknown };
  delete upstream.data;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects an mlog id that is not a string', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { id: unknown };
  };
  upstream.data.id = 0;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.id',
    expected: 'string',
    actual: 'number',
  });
});

test('mlog_url rejects a body without an mlog resource', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource?: unknown };
  };
  delete upstream.data.resource;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects a resource without its own id', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { id?: unknown } };
  };
  delete upstream.data.resource.id;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource.id',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects a mlog without a content', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { content?: unknown } };
  };
  delete upstream.data.resource.content;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource.content',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects a mlog without a video', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { content: { video?: unknown } } };
  };
  delete upstream.data.resource.content.video;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource.content.video',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects a playback address without a urlInfo', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { content: { video: { urlInfo?: unknown } } } };
  };
  delete upstream.data.resource.content.video.urlInfo;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource.content.video.urlInfo',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects a playback address without a url', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { content: { video: { urlInfo: { url?: unknown } } } } };
  };
  delete upstream.data.resource.content.video.urlInfo.url;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource.content.video.urlInfo.url',
    expected: 'present',
    actual: 'missing',
  });
});

test('mlog_url rejects a playback address that is not a string', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { content: { video: { urlInfo: { url: unknown } } } } };
  };
  upstream.data.resource.content.video.urlInfo.url = null;

  await expectUpstreamShapeRejection(replay(upstream).mlogUrl(mlogUrl.query), {
    module: 'mlog_url',
    path: 'body.data.resource.content.video.urlInfo.url',
    expected: 'string',
    actual: 'null',
  });
});

test('mlog_url drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: {
      recmdType: unknown;
      resource: {
        commentCount: unknown;
        customProbe?: unknown;
        content: { video: { playCount: unknown } };
      };
    };
  };
  upstream.data.recmdType = 'recommended';
  upstream.data.resource.commentCount = 'many';
  upstream.data.resource.content.video.playCount = 'played';
  upstream.data.resource.customProbe = { keep: true };

  const result = await replay(upstream).mlogUrl(mlogUrl.query);

  expect(result.body.data as unknown).not.toHaveProperty('recmdType');
  expect(result.body.data.resource as unknown).not.toHaveProperty(
    'commentCount',
  );
  expect(
    (result.body.data.resource as { content: { video: unknown } }).content
      .video,
  ).not.toHaveProperty('playCount');
  expect(result.body.data.resource as unknown).toHaveProperty('customProbe', {
    keep: true,
  });
});

test('mlog_url keeps missing, null and undeclared loose fields', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { recmdType: unknown; squareFeedType?: unknown };
    customProbe?: unknown;
  };
  delete upstream.data.squareFeedType;
  upstream.data.recmdType = null;
  upstream.customProbe = ['kept'];

  const result = await replay(upstream).mlogUrl(mlogUrl.query);

  expect(result.body.data as unknown).not.toHaveProperty('squareFeedType');
  expect(result.body.data as unknown).toHaveProperty('recmdType', null);
  expect(result.body as unknown).toHaveProperty('customProbe', ['kept']);
});

test('mlog_url keeps a null video area info', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: { resource: { content: { video: { videoAreaInfo: unknown } } } };
  };
  upstream.data.resource.content.video.videoAreaInfo = null;

  const result = await replay(upstream).mlogUrl(mlogUrl.query);

  expect(
    (result.body.data.resource as { content: { video: unknown } }).content
      .video,
  ).toHaveProperty('videoAreaInfo', null);
});

test('mlog_url drops a bad content song field and keeps the record', async () => {
  const upstream = structuredClone(mlogUrl.response.body) as {
    data: {
      resource: {
        content: { songs: Array<{ id: unknown; name: unknown }> };
      };
    };
  };
  const song = upstream.data.resource.content.songs[0]!;
  song.name = 42;

  const result = await replay(upstream).mlogUrl(mlogUrl.query);

  const songs = (
    result.body.data.resource as unknown as {
      content: { songs: Array<Record<string, unknown>> };
    }
  ).content.songs;

  expect(songs).toHaveLength(1);
  expect(songs[0]).not.toHaveProperty('name');
  expect(songs[0]).toHaveProperty('id', song.id);
});

test('mlog_to_video rejects a body without a video id', async () => {
  const upstream = structuredClone(mlogToVideo.response.body) as {
    data?: unknown;
  };
  delete upstream.data;

  await expectUpstreamShapeRejection(
    replay(upstream).mlogToVideo(mlogToVideo.query),
    {
      module: 'mlog_to_video',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('mlog_to_video rejects a video id that is not a string', async () => {
  const upstream = structuredClone(mlogToVideo.response.body) as {
    data: unknown;
  };
  upstream.data = 14514682;

  await expectUpstreamShapeRejection(
    replay(upstream).mlogToVideo(mlogToVideo.query),
    {
      module: 'mlog_to_video',
      path: 'body.data',
      expected: 'string',
      actual: 'number',
    },
  );
});

test('mlog_to_video drops a bad message and keeps undeclared fields', async () => {
  const upstream = structuredClone(mlogToVideo.response.body) as {
    message: unknown;
    customProbe?: unknown;
  };
  upstream.message = 200;
  upstream.customProbe = { keep: true };

  const result = await replay(upstream).mlogToVideo(mlogToVideo.query);

  expect(result.body as unknown).not.toHaveProperty('message');
  expect(result.body as unknown).toHaveProperty('customProbe', { keep: true });
});

test('user_audio rejects a body without the created radio list', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    djRadios?: unknown;
  };
  delete upstream.djRadios;

  await expectUpstreamShapeRejection(
    replay(upstream).userAudio(userAudio.query),
    {
      module: 'user_audio',
      path: 'body.djRadios',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_audio rejects a non-array created radio list', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    djRadios: unknown;
  };
  upstream.djRadios = null;

  await expectUpstreamShapeRejection(
    replay(upstream).userAudio(userAudio.query),
    {
      module: 'user_audio',
      path: 'body.djRadios',
      expected: 'array',
      actual: 'null',
    },
  );
});

test('user_audio rejects a radio without its own id', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    djRadios: Array<{ id?: unknown }>;
  };
  delete upstream.djRadios[0]!.id;

  await expectUpstreamShapeRejection(
    replay(upstream).userAudio(userAudio.query),
    {
      module: 'user_audio',
      path: 'body.djRadios[0].id',
      expected: 'present',
      actual: 'missing',
    },
  );
});

test('user_audio rejects a radio id that is not a number', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    djRadios: Array<{ id: unknown }>;
  };
  upstream.djRadios[0]!.id = '792544462';

  await expectUpstreamShapeRejection(
    replay(upstream).userAudio(userAudio.query),
    {
      module: 'user_audio',
      path: 'body.djRadios[0].id',
      expected: 'number',
      actual: 'string',
    },
  );
});

test('user_audio drops bad loose fields and keeps undeclared fields', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    count?: unknown;
    subCount: unknown;
    hasMore: unknown;
    djRadios: Array<{
      customProbe?: unknown;
      dj: { nickname: unknown };
    }>;
  };
  delete upstream.count;
  upstream.subCount = null;
  upstream.hasMore = 'no';
  upstream.djRadios[0]!.customProbe = { keep: true };
  upstream.djRadios[0]!.dj.nickname = 42;

  const result = await replay(upstream).userAudio(userAudio.query);

  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body as unknown).toHaveProperty('subCount', null);
  expect(result.body as unknown).not.toHaveProperty('hasMore');
  expect(result.body.djRadios[0] as unknown).toHaveProperty('customProbe', {
    keep: true,
  });
  expect(result.body.djRadios[0]!.dj as unknown).not.toHaveProperty('nickname');
});

test('user_audio keeps a radio without a dj', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    djRadios: Array<{ dj?: unknown }>;
  };
  delete upstream.djRadios[0]!.dj;

  const result = await replay(upstream).userAudio(userAudio.query);

  expect(result.body.djRadios[0] as unknown).not.toHaveProperty('dj');
});

test('user_audio keeps a null dj', async () => {
  const upstream = structuredClone(userAudio.response.body) as {
    djRadios: Array<{ dj: unknown }>;
  };
  upstream.djRadios[0]!.dj = null;

  const result = await replay(upstream).userAudio(userAudio.query);

  expect(result.body.djRadios[0] as unknown).toHaveProperty('dj', null);
});

test('user_audio keeps an empty radio list with loose counters', async () => {
  const upstream = structuredClone(userAudioEmpty.response.body) as {
    count: unknown;
    subCount: unknown;
  };
  upstream.count = 'none';
  upstream.subCount = null;

  const result = await replay(upstream).userAudio(userAudioEmpty.query);

  expect(result.body.djRadios).toEqual([]);
  expect(result.body as unknown).not.toHaveProperty('count');
  expect(result.body as unknown).toHaveProperty('subCount', null);
});
