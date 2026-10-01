import { expect } from 'bun:test';

import { Effect } from 'effect';

import { createHanaMusicApi } from '../../index.ts';
import { itEffect } from '../_kit/it.ts';

/**
 * Gated real-upstream smoke suite. Runs only when LIVE_UPSTREAM is set:
 *   LIVE_UPSTREAM=1 bun run test:live
 * login_status additionally requires NCM_LIVE_COOKIE.
 * Anti-rate-limit discipline: sequential (bun test default concurrency off),
 * 30s per-case timeout, fixed 6-case request set, read-only endpoints, full
 * default pipeline (TrafficGovernor quotas included) — never bypassed.
 */
const LIVE = process.env.LIVE_UPSTREAM !== undefined;
const itLive = LIVE ? itEffect : itEffect.skip;
const COOKIE_READY = process.env.NCM_LIVE_COOKIE !== undefined;
const itLiveAuthed = LIVE && COOKIE_READY ? itEffect : itEffect.skip;
const TIMEOUT = 30_000;

const hana = createHanaMusicApi({});

// Live bodies are untrusted shapes; assertions only lock the pipeline contract
// (HTTP 200 + code 200 + key presence), never content.
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const jsonBody = (response: {
  readonly body: unknown;
}): Record<string, unknown> => {
  expect(isRecord(response.body)).toBe(true);
  if (!isRecord(response.body)) {
    throw new Error('live response body is not a JSON object');
  }
  return response.body;
};

let songId: number | undefined; // derived by search; order guaranteed (bun test default concurrency off)

itLive(
  'live upstream: search returns songs and derives songId',
  Effect.promise(async () => {
    const response = await hana.search({ keywords: '周杰伦' });
    expect(response.status).toBe(200);
    const body = jsonBody(response);
    expect(body.code).toBe(200);
    const result = body.result;
    expect(isRecord(result)).toBe(true);
    if (!isRecord(result)) {
      throw new Error('search result is not an object');
    }
    const songs = result.songs;
    expect(Array.isArray(songs) && songs.length > 0).toBe(true);
    if (!Array.isArray(songs) || songs.length === 0) {
      throw new Error('search returned no songs');
    }
    const firstSong = songs[0];
    expect(isRecord(firstSong)).toBe(true);
    expect(typeof firstSong.id).toBe('number');
    songId = typeof firstSong.id === 'number' ? firstSong.id : undefined;
  }),
  { timeout: TIMEOUT },
);

itLive(
  'live upstream: toplist returns code 200',
  Effect.promise(async () => {
    const response = await hana.toplist({});
    expect(response.status).toBe(200);
    expect(jsonBody(response).code).toBe(200);
  }),
  { timeout: TIMEOUT },
);

itLive(
  'live upstream: artist_detail returns code 200',
  Effect.promise(async () => {
    const response = await hana.artistDetail({ id: 6452 });
    expect(response.status).toBe(200);
    expect(jsonBody(response).code).toBe(200);
  }),
  { timeout: TIMEOUT },
);

itLive(
  'live upstream: song_detail for derived songId returns songs',
  Effect.promise(async () => {
    const response = await hana.songDetail({ ids: songId });
    expect(response.status).toBe(200);
    const body = jsonBody(response);
    expect(body.code).toBe(200);
    const songs = body.songs;
    expect(Array.isArray(songs) && songs.length > 0).toBe(true);
  }),
  { timeout: TIMEOUT },
);

itLive(
  'live upstream: lyric for derived songId returns code 200',
  Effect.promise(async () => {
    const response = await hana.lyric({ id: songId });
    expect(response.status).toBe(200);
    expect(jsonBody(response).code).toBe(200);
  }),
  { timeout: TIMEOUT },
);

itLiveAuthed(
  'live upstream: login_status with cookie returns code 200',
  Effect.promise(async () => {
    const authed = createHanaMusicApi({
      cookie: process.env.NCM_LIVE_COOKIE,
    });
    const response = await authed.loginStatus({});
    expect(response.status).toBe(200);
    expect(jsonBody(response).code).toBe(200);
  }),
  { timeout: TIMEOUT },
);
