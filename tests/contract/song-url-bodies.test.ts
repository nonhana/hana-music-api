import { expect, test } from 'bun:test';

import { Effect } from 'effect';

import type { ModuleInputOf } from '../../index.ts';
import {
  createHanaMusicApi,
  SongDownloadUrlBody,
  SongUrlBody,
} from '../../index.ts';
import { Call } from '../../src/core/call.ts';
import type { CallShape } from '../../src/core/call.ts';
import { resolveIdentitySnapshot } from '../../src/core/identity.ts';
import { getRuntimeState } from '../../src/core/runtime.ts';
import songUrlModule from '../../src/modules/song_url.ts';
import type { RequestCapability } from '../../src/types/index.ts';
import type {
  Recording,
  UpstreamShape,
  Validator,
} from '../_kit/assertions.ts';
import {
  expectUpstreamShapeRejection,
  settle,
  validateSync,
} from '../_kit/assertions.ts';
import { runEffect } from '../_kit/it.ts';
import downloadCookieVipRestricted from '../fixtures/netease/song/song_download_url.cookie-vip-restricted.json';
import downloadFree from '../fixtures/netease/song/song_download_url.free.json';
import downloadNoCopyright from '../fixtures/netease/song/song_download_url.no-copyright.json';
import downloadStandard from '../fixtures/netease/song/song_download_url.standard.json';
import downloadTransient110 from '../fixtures/netease/song/song_download_url.transient-110.json';
import downloadVipRestricted from '../fixtures/netease/song/song_download_url.vip-restricted.json';
import urlAnonFree from '../fixtures/netease/song/song_url.anon-free.json';
import urlAnonTrial from '../fixtures/netease/song/song_url.anon-trial.json';
import urlCookieFree from '../fixtures/netease/song/song_url.cookie-free.json';
import urlCookieTrial from '../fixtures/netease/song/song_url.cookie-trial.json';
import urlMultiId from '../fixtures/netease/song/song_url.multi-id.json';
import urlNoCopyright from '../fixtures/netease/song/song_url.no-copyright.json';
import urlStandard from '../fixtures/netease/song/song_url.standard.json';
import urlTransient404 from '../fixtures/netease/song/song_url.transient-404.json';

// song_url 的最终体不是上游原文：模块把 `data` 数组按请求 id 顺序重排，并固定包成
// `{ code: 200, data }`。song_download_url 正常录制与上游逐字段一致；宽松字段类型不对时只丢该项。
type RecordingFixture = Recording & {
  readonly context?: { readonly viewer?: string };
};

const replay = (
  upstream: unknown,
  {
    status = 200,
    viewer,
  }: { readonly status?: number; readonly viewer?: string } = {},
) =>
  createHanaMusicApi({
    ...(viewer === 'invalid-cookie' || viewer === 'authenticated'
      ? { cookie: `MUSIC_U=${viewer}` }
      : { state: { anonymousToken: 'anonymous-test-token' } }),
    fetcher: async () => Response.json(upstream, { status }),
  });

const replayFixture = (recording: RecordingFixture) =>
  replay(recording.response.body, {
    status: recording.response.status,
    viewer: recording.context?.viewer,
  });

type UrlBody = {
  code: number;
  data: Array<Record<string, unknown> & { id: number | string }>;
};

const cloneUrlUpstream = (recording: RecordingFixture) =>
  structuredClone(recording.response.body) as UrlBody;

const cloneDownloadUpstream = (recording: RecordingFixture) =>
  structuredClone(recording.response.body) as {
    code: number;
    data: Record<string, unknown>;
  };

const orderedUrlEntries = (recording: RecordingFixture) => {
  const order = new Map<string, number>();
  for (const [index, id] of String(recording.query.id).split(',').entries()) {
    if (!order.has(id)) {
      order.set(id, index);
    }
  }
  return [...(recording.response.body as UrlBody).data].toSorted(
    (left, right) =>
      (order.get(String(left.id)) ?? -1) - (order.get(String(right.id)) ?? -1),
  );
};

test.each<{ name: string; recording: RecordingFixture }>([
  { name: 'anonymous free', recording: urlAnonFree },
  { name: 'anonymous trial', recording: urlAnonTrial },
  { name: 'cookie free', recording: urlCookieFree },
  { name: 'cookie trial', recording: urlCookieTrial },
  { name: 'no-copyright', recording: urlNoCopyright },
  { name: 'standard quality', recording: urlStandard },
  { name: 'transient 404', recording: urlTransient404 },
])(
  'songUrl replays the recorded $name body into the rewritten final body',
  async ({ recording }) => {
    const upstream = recording.response.body as UrlBody;
    const result = await replayFixture(recording).songUrl(
      recording.query as ModuleInputOf<'song_url'>,
    );

    // 改写规则：保留每条 data 项的原字段，只按请求 id 重排并重建顶层 `{ code, data }`。
    expect(result.body).toEqual({
      code: 200,
      data: upstream.data,
    } as unknown as typeof result.body);
    expect(Object.keys(result.body).toSorted()).toEqual(['code', 'data']);
  },
);

test('songUrl reorders multiple ids into request order and keeps mixed copyright states', async () => {
  const query = urlMultiId.query as ModuleInputOf<'song_url'>;
  const upstream = urlMultiId.response.body as UrlBody;

  // 录制里的上游顺序是 [2092595510, 1409311773, 2108191414]，与请求顺序不同。
  expect(upstream.data.map(({ id }) => id)).toEqual([
    2092595510, 1409311773, 2108191414,
  ]);

  const result = await replayFixture(urlMultiId).songUrl(query);
  const data = result.body.data as Array<
    Record<string, unknown> & {
      id: number;
      url: string | null;
      code: number;
      freeTrialInfo: Record<string, unknown> | null;
    }
  >;

  expect(Array.isArray(result.body.data)).toBe(true);
  expect(data.map(({ id }) => id)).toEqual([
    2108191414, 2092595510, 1409311773,
  ]);
  expect(data).toEqual(orderedUrlEntries(urlMultiId) as unknown as typeof data);

  // 无版权项地址为空；可播项地址原样保留；试听片段没有被替换或合并。
  expect(data[0]).toMatchObject({ id: 2108191414, code: 404, url: null });
  expect(data[1]).toMatchObject({ id: 2092595510, code: 200 });
  expect(data[1]?.url).toMatch(/^http:\/\//);
  expect(data[2]).toMatchObject({
    id: 1409311773,
    code: 200,
    freeTrialInfo: { fragmentType: -1, start: 0, end: 30 },
  });
  const recordedTrial = upstream.data.find(({ id }) => id === 1409311773)
    ?.freeTrialInfo as Record<string, unknown> | null | undefined;
  expect(data[2]?.freeTrialInfo).toEqual(recordedTrial);
});

test('songUrl keeps the first position of a repeated request id', async () => {
  const upstream = {
    code: 200,
    data: [
      { id: 1, url: 'first', code: 200 },
      { id: 2, url: 'second', code: 200 },
    ],
  };

  const result = await replay(upstream, {
    viewer: urlAnonFree.context.viewer,
  }).songUrl({ id: '1,2,1' });

  // 基线按 ids.indexOf 排序，重复 id 取第一次出现的位置。
  expect(result.body.data.map(({ id }) => id)).toEqual([1, 2]);
  expect(result.body.data.map(({ url }) => url)).toEqual(['first', 'second']);
});

test('songUrl keeps the recorded trial window unchanged in the final body', async () => {
  const result = await replayFixture(urlAnonTrial).songUrl(urlAnonTrial.query);

  expect(result.body.data[0]?.freeTrialInfo).toEqual({
    fragmentType: 1003,
    start: 0,
    end: 35,
    algData: { fragSource: 'alg', audioEffect: -1 },
  });
});

test('songUrl rebuilds the top level and drops upstream extra fields', async () => {
  const upstream = {
    ...cloneUrlUpstream(urlAnonFree),
    futureBodyField: { dropped: true },
  };

  const result = await replay(upstream, {
    viewer: urlAnonFree.context.viewer,
  }).songUrl(urlAnonFree.query);

  expect(result.body.code).toBe(200);
  expect(Object.keys(result.body).toSorted()).toEqual(['code', 'data']);
  expect(result.body).not.toHaveProperty('futureBodyField');
  expect(result.status).toBe(200);
});

test('songUrl turns a missing data array into an empty final data array', async () => {
  const upstream = cloneUrlUpstream(urlAnonFree);
  delete (upstream as { data?: unknown }).data;

  const result = await replay(upstream, {
    viewer: urlAnonFree.context.viewer,
  }).songUrl(urlAnonFree.query);

  expect(result.body).toEqual({ code: 200, data: [] });
});

test('songUrl ignores a special upstream code and synthesizes 200', async () => {
  const upstream = { ...cloneUrlUpstream(urlAnonFree), code: 400, data: [] };

  const result = await replay(upstream, {
    viewer: urlAnonFree.context.viewer,
  }).songUrl(urlAnonFree.query);

  expect(result.body).toEqual({ code: 200, data: [] });
});

test('songUrl synthesizes code 200 when a 301 body reaches the module', async () => {
  // 301 不在 SPECIAL_STATUS_CODES 里，公开请求层会在模块前拒绝；这里直接调用模块
  // Effect，锁定“上游顶层 code 被忽略、最终体合成 200”的模块合同。
  const request = (() =>
    Effect.succeed({
      status: 200,
      cookie: [],
      headers: new Headers(),
      body: { code: 301, data: [] },
    })) as RequestCapability;
  const config = { cookie: 'MUSIC_U=module-reader' };
  const call: CallShape = {
    identifier: 'song_url',
    input: { id: '1' },
    config,
    identity: resolveIdentitySnapshot(config, getRuntimeState()),
    policy: { read: true, upload: false },
    startedAt: Date.now(),
  };

  const result = await runEffect(
    songUrlModule({ id: '1' }, request).pipe(Effect.provideService(Call, call)),
  );

  expect(result).toEqual({
    status: 200,
    cookie: [],
    body: { code: 200, data: [] },
  });
});

test('songUrl keeps a string id and orders it like the request id', async () => {
  const upstream = cloneUrlUpstream(urlAnonFree);
  (upstream.data[0] as Record<string, unknown>).id = '2092595510';

  const result = await replay(upstream, {
    viewer: urlAnonFree.context.viewer,
  }).songUrl({ id: '2092595510' });

  expect(result.body.data[0]?.id).toBe('2092595510');
});

test('songUrl preserves undeclared entry fields', async () => {
  const upstream = cloneUrlUpstream(urlAnonFree);
  (upstream.data[0] as Record<string, unknown>).futureEntryField = {
    preserved: true,
  };

  const result = await replay(upstream, {
    viewer: urlAnonFree.context.viewer,
  }).songUrl(urlAnonFree.query);

  expect(result.body.data[0]).toHaveProperty('futureEntryField', {
    preserved: true,
  });
});

test.each<{ name: string; schema: Validator; body: unknown }>([
  {
    name: 'SongUrlBody',
    schema: SongUrlBody,
    body: {
      code: 200,
      data: orderedUrlEntries(urlMultiId),
    },
  },
  {
    name: 'SongDownloadUrlBody',
    schema: SongDownloadUrlBody,
    body: downloadFree.response.body,
  },
])(
  'exported $name validates the final body through Standard Schema',
  ({ schema, body }) => {
    const result = validateSync(schema, body);

    expect(result.issues).toBeUndefined();
    expect(result.value).toEqual(body);
  },
);

test.each<{
  name: string;
  mutate: (upstream: UrlBody) => void;
  actual: string;
}>([
  {
    name: 'a null data array',
    mutate: (upstream) => {
      (upstream as { data: unknown }).data = null;
    },
    actual: 'null',
  },
  {
    name: 'a non-array data field',
    mutate: (upstream) => {
      (upstream as { data: unknown }).data = {};
    },
    actual: 'object',
  },
])(
  'songUrl rejects $name as an upstream shape change',
  async ({ mutate, actual }) => {
    const upstream = cloneUrlUpstream(urlAnonFree);
    mutate(upstream);

    await expectUpstreamShapeRejection(
      replay(upstream, { viewer: urlAnonFree.context.viewer }).songUrl(
        urlAnonFree.query,
      ),
      {
        module: 'song_url',
        path: 'body.data',
        expected: 'array',
        actual,
      },
    );
  },
);

test('songUrl rejects a non-object upstream body', async () => {
  await expectUpstreamShapeRejection(
    replay('not a song url body', {
      viewer: urlAnonFree.context.viewer,
    }).songUrl(urlAnonFree.query),
    {
      module: 'song_url',
      path: 'body.data',
      expected: 'array',
      actual: 'string',
    },
  );
});

test.each<{
  name: string;
  mutate: (entry: Record<string, unknown>) => void;
  shape: UpstreamShape;
}>([
  {
    name: 'an entry without its address',
    mutate: (entry) => {
      delete entry.url;
    },
    shape: {
      module: 'song_url',
      path: 'body.data[0].url',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'an entry with a textual item code',
    mutate: (entry) => {
      entry.code = '200';
    },
    shape: {
      module: 'song_url',
      path: 'body.data[0].code',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'an entry without its id',
    mutate: (entry) => {
      delete entry.id;
    },
    shape: {
      module: 'song_url',
      path: 'body.data[0].id',
      expected: 'present',
      actual: 'missing',
    },
  },
])('songUrl rejects $name', async ({ mutate, shape }) => {
  const upstream = cloneUrlUpstream(urlAnonFree);
  mutate(upstream.data[0] as Record<string, unknown>);

  await expectUpstreamShapeRejection(
    replay(upstream, { viewer: urlAnonFree.context.viewer }).songUrl(
      urlAnonFree.query,
    ),
    shape,
  );
});

test.each<{
  name: string;
  mutate: (entry: Record<string, unknown>) => void;
  check: (entry: Record<string, unknown>) => void;
}>([
  {
    name: 'a missing size',
    mutate: (entry) => {
      delete entry.size;
    },
    check: (entry) => {
      expect(entry).not.toHaveProperty('size');
    },
  },
  {
    name: 'a textual bitrate',
    mutate: (entry) => {
      entry.br = '320000';
    },
    check: (entry) => {
      expect(entry).not.toHaveProperty('br');
    },
  },
  {
    name: 'a null md5',
    mutate: (entry) => {
      entry.md5 = null;
    },
    check: (entry) => {
      expect(entry.md5).toBeNull();
    },
  },
])(
  'songUrl treats $name on a loose entry field as missing',
  async ({ mutate, check }) => {
    const upstream = cloneUrlUpstream(urlAnonFree);
    mutate(upstream.data[0] as Record<string, unknown>);

    const result = await replay(upstream, {
      viewer: urlAnonFree.context.viewer,
    }).songUrl(urlAnonFree.query);

    expect(result.status).toBe(200);
    check(result.body.data[0] as Record<string, unknown>);
  },
);

test('songUrl drops the broken end but keeps the trial window', async () => {
  const upstream = cloneUrlUpstream(urlAnonTrial);
  const trialInfo = (upstream.data[0] as Record<string, unknown>)
    .freeTrialInfo as Record<string, unknown>;
  trialInfo.end = '35';

  const result = await replay(upstream, {
    viewer: urlAnonTrial.context.viewer,
  }).songUrl(urlAnonTrial.query);

  expect(result.status).toBe(200);
  expect(result.body.data[0]).toHaveProperty('freeTrialInfo');
  expect(result.body.data[0]?.freeTrialInfo).not.toHaveProperty('end');
});

test.each<{ name: string; recording: RecordingFixture }>([
  { name: 'downloadable free song', recording: downloadFree },
  { name: 'downloadable standard quality', recording: downloadStandard },
  { name: 'anonymous member restriction', recording: downloadVipRestricted },
  { name: 'cookie member restriction', recording: downloadCookieVipRestricted },
  { name: 'no-copyright', recording: downloadNoCopyright },
  { name: 'transient -110', recording: downloadTransient110 },
])(
  'songDownloadUrl matches the recorded $name body on a normal response',
  async ({ recording }) => {
    const result = await replayFixture(recording).songDownloadUrl(
      recording.query,
    );

    expect(result.body).toEqual(
      recording.response.body as unknown as typeof result.body,
    );
  },
);

test.each<{
  name: string;
  recording: RecordingFixture;
  item: Record<string, unknown>;
}>([
  {
    name: 'downloadable free song',
    recording: downloadFree,
    item: { code: 200, br: 128000, level: 'standard' },
  },
  {
    name: 'downloadable standard quality',
    recording: downloadStandard,
    item: { code: 200, br: 128000, level: 'standard' },
  },
  {
    name: 'anonymous member restriction',
    recording: downloadVipRestricted,
    item: { code: -105, url: null, level: null, size: 0 },
  },
  {
    name: 'cookie member restriction',
    recording: downloadCookieVipRestricted,
    item: { code: -105, url: null, level: null, size: 0 },
  },
  {
    name: 'no-copyright',
    recording: downloadNoCopyright,
    item: { code: -110, url: null, level: null, size: 0 },
  },
  {
    name: 'transient -110',
    recording: downloadTransient110,
    item: { code: -110, url: null, level: null, size: 0 },
  },
])(
  'songDownloadUrl exposes the $name download state',
  ({ recording, item }) => {
    const body = recording.response.body as {
      data: Record<string, unknown>;
    };
    expect(body.data).toMatchObject(item);
    if (item.code === 200) {
      expect(body.data.url).toMatch(/^http:\/\//);
    }
  },
);

test.each<{
  name: string;
  mutate: (upstream: ReturnType<typeof cloneDownloadUpstream>) => void;
  shape: UpstreamShape;
}>([
  {
    name: 'an entry without its address',
    mutate: (upstream) => {
      delete upstream.data.url;
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data.url',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'an entry with a textual item code',
    mutate: (upstream) => {
      upstream.data.code = '200';
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data.code',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'an entry without its id',
    mutate: (upstream) => {
      delete upstream.data.id;
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data.id',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'an entry with a textual id',
    mutate: (upstream) => {
      upstream.data.id = '2736209461';
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data.id',
      expected: 'number',
      actual: 'string',
    },
  },
  {
    name: 'an entry without its code',
    mutate: (upstream) => {
      delete upstream.data.code;
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data.code',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'a missing data object',
    mutate: (upstream) => {
      delete (upstream as { data?: unknown }).data;
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'a data array',
    mutate: (upstream) => {
      (upstream as { data: unknown }).data = [];
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data',
      expected: 'object',
      actual: 'array',
    },
  },
  {
    name: 'a textual data field',
    mutate: (upstream) => {
      (upstream as { data: unknown }).data = 'download';
    },
    shape: {
      module: 'song_download_url',
      path: 'body.data',
      expected: 'object',
      actual: 'string',
    },
  },
])('songDownloadUrl rejects $name', async ({ mutate, shape }) => {
  const upstream = cloneDownloadUpstream(downloadFree);
  mutate(upstream);

  await expectUpstreamShapeRejection(
    replay(upstream, { viewer: downloadFree.context.viewer }).songDownloadUrl(
      downloadFree.query,
    ),
    shape,
  );
});

test.each<{
  code: number;
  status: number;
}>([
  { code: 400, status: 400 },
  { code: 302, status: 302 },
  { code: 803, status: 400 },
])(
  'songDownloadUrl rejects an upstream top-level $code with status $status',
  async ({ code, status }) => {
    const upstream = { ...cloneDownloadUpstream(downloadFree), code };

    const result = await settle(
      replay(upstream, { viewer: downloadFree.context.viewer }).songDownloadUrl(
        downloadFree.query,
      ),
    );

    expect(result).toEqual({
      rejected: { status, cookie: [], body: upstream },
    });
  },
);

test('songDownloadUrl rejects a non-object body', async () => {
  await expectUpstreamShapeRejection(
    replay('not a download body', {
      viewer: downloadFree.context.viewer,
    }).songDownloadUrl(downloadFree.query),
    {
      module: 'song_download_url',
      path: 'body',
      expected: 'object',
      actual: 'string',
    },
  );
});

test.each<{
  name: string;
  mutate: (data: Record<string, unknown>) => void;
  check: (data: Record<string, unknown>) => void;
}>([
  {
    name: 'a missing size',
    mutate: (data) => {
      delete data.size;
    },
    check: (data) => {
      expect(data).not.toHaveProperty('size');
    },
  },
  {
    name: 'a textual bitrate',
    mutate: (data) => {
      data.br = '128000';
    },
    check: (data) => {
      expect(data).not.toHaveProperty('br');
    },
  },
  {
    name: 'a null md5',
    mutate: (data) => {
      data.md5 = null;
    },
    check: (data) => {
      expect(data.md5).toBeNull();
    },
  },
])(
  'songDownloadUrl treats $name on a loose field as missing',
  async ({ mutate, check }) => {
    const upstream = cloneDownloadUpstream(downloadFree);
    mutate(upstream.data);

    const result = await replay(upstream, {
      viewer: downloadFree.context.viewer,
    }).songDownloadUrl(downloadFree.query);

    expect(result.status).toBe(200);
    check(result.body.data);
  },
);

test('songDownloadUrl preserves undeclared fields at every level', async () => {
  const upstream = cloneDownloadUpstream(downloadFree);
  (upstream as Record<string, unknown>).futureBodyField = {
    preserved: true,
  };
  upstream.data.futureEntryField = { preserved: true };
  const withExtras = upstream as unknown as Record<string, unknown> & {
    data: Record<string, unknown>;
  };

  const result = await replay(withExtras, {
    viewer: downloadFree.context.viewer,
  }).songDownloadUrl(downloadFree.query);

  expect(result.body).toHaveProperty('futureBodyField', {
    preserved: true,
  });
  expect(result.body.data).toHaveProperty('futureEntryField', {
    preserved: true,
  });
});
