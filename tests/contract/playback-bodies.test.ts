import { expect, test } from 'bun:test';

import type { ModuleInputOf } from '../../index.ts';
import {
  createHanaMusicApi,
  LyricNewBody,
  ScrobbleBody,
  SongDownloadUrlV1Body,
  SongUrlV1Body,
} from '../../index.ts';
import type { UpstreamShape } from '../_kit/assertions.ts';
import { expectUpstreamShapeRejection } from '../_kit/assertions.ts';
import lyricAllForms from '../fixtures/netease/playback/lyric_new.all-forms.json';
import lyricLrcOnly from '../fixtures/netease/playback/lyric_new.lrc-only.json';
import lyricPureMusic from '../fixtures/netease/playback/lyric_new.pure-music.json';
import lyricRomaji from '../fixtures/netease/playback/lyric_new.romaji.json';
import lyricTranslation from '../fixtures/netease/playback/lyric_new.translation.json';
import lyricUncollected from '../fixtures/netease/playback/lyric_new.uncollected.json';
import lyricYrc from '../fixtures/netease/playback/lyric_new.yrc.json';
import scrobbleRecording from '../fixtures/netease/playback/scrobble.json';
import downloadNoCopyright from '../fixtures/netease/playback/song_download_url_v1.no-copyright.json';
import downloadExhigh from '../fixtures/netease/playback/song_download_url_v1.vip-exhigh.json';
import downloadHires from '../fixtures/netease/playback/song_download_url_v1.vip-hires.json';
import downloadLossless from '../fixtures/netease/playback/song_download_url_v1.vip-lossless.json';
import urlAnonFree from '../fixtures/netease/playback/song_url_v1.anon-free.json';
import urlAnonTrial from '../fixtures/netease/playback/song_url_v1.anon-trial.json';
import urlNoCopyright from '../fixtures/netease/playback/song_url_v1.no-copyright.json';
import urlExhigh from '../fixtures/netease/playback/song_url_v1.vip-exhigh.json';
import urlHigher from '../fixtures/netease/playback/song_url_v1.vip-higher.json';
import urlHires from '../fixtures/netease/playback/song_url_v1.vip-hires.json';
import urlJyeffect from '../fixtures/netease/playback/song_url_v1.vip-jyeffect.json';
import urlJymaster from '../fixtures/netease/playback/song_url_v1.vip-jymaster.json';
import urlLossless from '../fixtures/netease/playback/song_url_v1.vip-lossless.json';
import urlSky from '../fixtures/netease/playback/song_url_v1.vip-sky.json';
import urlStandard from '../fixtures/netease/playback/song_url_v1.vip-standard.json';

type Recording = {
  readonly query: Record<string, unknown>;
  readonly response: { readonly body: object };
};

type Validator = {
  readonly '~standard': { readonly validate: (value: unknown) => unknown };
};

// 每个用例回放验证关卡①录下、脱敏后的网易云返回（nonhana/hana-music-api#20）。
const replay = (upstream: unknown) =>
  createHanaMusicApi({
    cookie: 'MUSIC_U=listener',
    fetcher: async () => Response.json(upstream),
  });

test.each<{ name: string; recording: Recording }>([
  { name: 'anonymous free', recording: urlAnonFree },
  { name: 'anonymous trial', recording: urlAnonTrial },
  { name: 'no-copyright', recording: urlNoCopyright },
  { name: 'member standard', recording: urlStandard },
  { name: 'member higher', recording: urlHigher },
  { name: 'member exhigh', recording: urlExhigh },
  { name: 'member lossless', recording: urlLossless },
  { name: 'member hires', recording: urlHires },
  { name: 'member jyeffect', recording: urlJyeffect },
  { name: 'member sky', recording: urlSky },
  { name: 'member jymaster', recording: urlJymaster },
])(
  'songUrlV1 returns the recorded $name body, keeping undeclared fields',
  async ({ recording }) => {
    const result = await replay(recording.response.body).songUrlV1(
      recording.query as ModuleInputOf<'song_url_v1'>,
    );

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test.each<{ name: string; recording: Recording }>([
  { name: 'no-copyright', recording: downloadNoCopyright },
  { name: 'member exhigh', recording: downloadExhigh },
  { name: 'member lossless', recording: downloadLossless },
  { name: 'member hires', recording: downloadHires },
])(
  'songDownloadUrlV1 returns the recorded $name body, keeping undeclared fields',
  async ({ recording }) => {
    const result = await replay(recording.response.body).songDownloadUrlV1(
      recording.query,
    );

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test.each<{ name: string; recording: Recording }>([
  {
    name: 'word-by-word with translation and romaji',
    recording: lyricAllForms,
  },
  { name: 'word-by-word', recording: lyricYrc },
  { name: 'line-by-line only', recording: lyricLrcOnly },
  { name: 'translated', recording: lyricTranslation },
  { name: 'romanized', recording: lyricRomaji },
  { name: 'pure music', recording: lyricPureMusic },
  { name: 'uncollected', recording: lyricUncollected },
])(
  'lyricNew returns the recorded $name body, keeping undeclared fields',
  async ({ recording }) => {
    const result = await replay(recording.response.body).lyricNew(
      recording.query,
    );

    expect(result.body as unknown).toEqual(recording.response.body);
  },
);

test('scrobble returns the recorded confirmation', async () => {
  const result = await replay(scrobbleRecording.response.body).scrobble(
    scrobbleRecording.query,
  );

  expect(result.body as unknown).toEqual(scrobbleRecording.response.body);
});

test.each<{ name: string; schema: Validator; recording: Recording }>([
  { name: 'SongUrlV1Body', schema: SongUrlV1Body, recording: urlAnonTrial },
  {
    name: 'SongDownloadUrlV1Body',
    schema: SongDownloadUrlV1Body,
    recording: downloadExhigh,
  },
  { name: 'LyricNewBody', schema: LyricNewBody, recording: lyricAllForms },
  {
    name: 'ScrobbleBody',
    schema: ScrobbleBody,
    recording: scrobbleRecording,
  },
])(
  'exported $name validates the recording through Standard Schema',
  ({ schema, recording }) => {
    expect(schema['~standard'].validate(recording.response.body)).toEqual({
      value: recording.response.body,
    });
  },
);

test.each<{
  name: string;
  call: () => Promise<unknown>;
  shape: UpstreamShape;
}>([
  {
    name: 'songUrlV1: a trial clip without its end',
    call: () => {
      const upstream = structuredClone(urlAnonTrial.response.body);
      delete (upstream.data[0] as { freeTrialInfo: { end?: number } })
        .freeTrialInfo.end;
      return replay(upstream).songUrlV1({ id: 1409311773 });
    },
    shape: {
      module: 'song_url_v1',
      path: 'body.data[0].freeTrialInfo.end',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'songUrlV1: an address entry without the address',
    call: () => {
      const upstream = structuredClone(urlNoCopyright.response.body);
      delete (upstream.data[0] as { url?: null }).url;
      return replay(upstream).songUrlV1({ id: 2108191414 });
    },
    shape: {
      module: 'song_url_v1',
      path: 'body.data[0].url',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'songDownloadUrlV1: a download address without its size',
    call: () => {
      const upstream = structuredClone(downloadExhigh.response.body);
      delete (upstream.data as { size?: number }).size;
      return replay(upstream).songDownloadUrlV1(downloadExhigh.query);
    },
    shape: {
      module: 'song_download_url_v1',
      path: 'body.data.size',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'lyricNew: the line-by-line lyric without its text',
    call: () => {
      const upstream = structuredClone(lyricPureMusic.response.body);
      delete (upstream.lrc as { lyric?: string }).lyric;
      return replay(upstream).lyricNew(lyricPureMusic.query);
    },
    shape: {
      module: 'lyric_new',
      path: 'body.lrc.lyric',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'lyricNew: a word-by-word lyric without its text',
    call: () => {
      const upstream = structuredClone(lyricYrc.response.body);
      delete (upstream.yrc as { lyric?: string }).lyric;
      return replay(upstream).lyricNew(lyricYrc.query);
    },
    shape: {
      module: 'lyric_new',
      path: 'body.yrc.lyric',
      expected: 'present',
      actual: 'missing',
    },
  },
  {
    name: 'scrobble: a non-object body',
    call: () => replay('success').scrobble(scrobbleRecording.query),
    shape: {
      module: 'scrobble',
      path: 'body',
      expected: 'object',
      actual: 'string',
    },
  },
])('$name rejects as an upstream shape change', ({ call, shape }) =>
  expectUpstreamShapeRejection(call(), shape),
);
