import { describe, expect, test } from 'bun:test';

import {
  album,
  createHanaMusicApi,
  createRequest,
  getNcmFailureInfo,
  innerVersion,
  invokeModule,
  isNcmApiResponse,
  search,
} from '../../../index.ts';
import type {
  FetchLike,
  NcmApiFailure,
  NcmApiResponse,
} from '../../../index.ts';
import { settle } from '../../_kit/assertions.ts';

const cookie = 'MUSIC_U=failure-contract';

const failureOf = async (promise: Promise<unknown>): Promise<NcmApiFailure> => {
  const settled = await settle(promise);
  if (!('rejected' in settled)) {
    throw new Error('expected the public entry to reject');
  }
  expect(isNcmApiResponse(settled.rejected)).toBe(true);
  return settled.rejected;
};

const rejectingFetcher = async (): Promise<Response> =>
  Response.json({ code: 301, msg: '需要登录' });

const urlOf = (input: Parameters<FetchLike>[0]): string =>
  input instanceof URL
    ? input.href
    : input instanceof Request
      ? input.url
      : input;

const countCalls = (fetcher: FetchLike) => {
  const urls: Array<string> = [];
  const counting: FetchLike = (input, init) => {
    urls.push(urlOf(input));
    return fetcher(input, init);
  };
  return { counting, urls };
};

describe('public failure classification', () => {
  test('named, client, invokeModule and createRequest share business metadata', async () => {
    const { counting, urls } = countCalls(rejectingFetcher);
    const failure = await failureOf(
      album({ id: 1 }, { cookie, fetcher: counting }),
    );
    expect(getNcmFailureInfo(failure)).toEqual({
      kind: 'business',
      code: 301,
      message: '需要登录',
    });

    const client = createHanaMusicApi({ cookie, fetcher: counting });
    const clientFailure = await failureOf(client.album({ id: 1 }));
    expect(getNcmFailureInfo(clientFailure)).toEqual({
      kind: 'business',
      code: 301,
      message: '需要登录',
    });

    const invoked = await failureOf(
      invokeModule('album', { id: 1 }, { cookie, fetcher: counting }),
    );
    expect(getNcmFailureInfo(invoked)).toEqual({
      kind: 'business',
      code: 301,
      message: '需要登录',
    });

    const raw = await failureOf(
      createRequest(
        '/api/v1/album/1',
        {},
        {
          crypto: 'api',
          fetcher: counting,
          state: { anonymousToken: 'token', deviceId: 'DEVICE_ID' },
        },
      ),
    );
    expect(getNcmFailureInfo(raw)).toEqual({
      kind: 'business',
      code: 301,
      message: '需要登录',
    });
    expect(urls).toHaveLength(4);
  });

  test('business 502 and transport 502 stay distinguishable', async () => {
    const business = await failureOf(
      album(
        { id: 1 },
        {
          cookie,
          fetcher: async () =>
            Response.json({ code: 502, msg: '歌单内歌曲重复' }),
        },
      ),
    );
    const transport = await failureOf(
      album(
        { id: 1 },
        {
          cookie,
          fetcher: async () => {
            throw new Error('gateway');
          },
        },
      ),
    );

    expect(business.status).toBe(502);
    expect(transport.status).toBe(502);
    expect(business.body).toEqual({ code: 502, msg: '歌单内歌曲重复' });
    expect(transport.body).toEqual({ code: 502, msg: 'gateway' });
    expect(getNcmFailureInfo(business)).toEqual({
      kind: 'business',
      code: 502,
      message: '歌单内歌曲重复',
    });
    expect(getNcmFailureInfo(transport)).toEqual({ kind: 'transport' });
  });

  test('business 405 and confirmed rate limiting stay distinguishable', async () => {
    const business = await failureOf(
      album(
        { id: 1 },
        {
          cookie,
          fetcher: async () =>
            Response.json({ code: 405, msg: '请求方法不允许' }),
        },
      ),
    );
    const limited = await failureOf(
      album(
        { id: 1 },
        {
          cookie,
          fetcher: async () =>
            Response.json({
              code: 405,
              msg: '操作过于频繁，请稍后再试',
            }),
        },
      ),
    );

    expect(business.status).toBe(405);
    expect(limited.status).toBe(405);
    expect(getNcmFailureInfo(business)).toEqual({
      kind: 'business',
      code: 405,
      message: '请求方法不允许',
    });
    expect(getNcmFailureInfo(limited)).toEqual({
      kind: 'rateLimited',
      code: 405,
      retryAfter: 30,
    });
    expect(limited.body).toMatchObject({ code: 405, retryAfter: 30 });
  });

  test('invalid input is invalidRequest and never reaches the network', async () => {
    const { counting, urls } = countCalls(rejectingFetcher);
    const failure = await failureOf(
      search({} as never, { cookie, fetcher: counting }),
    );
    expect(failure.status).toBe(400);
    expect(getNcmFailureInfo(failure)).toEqual({ kind: 'invalidRequest' });
    expect(urls).toHaveLength(0);
  });

  test('a module timeout is timeout while caller cancellation is cancelled', async () => {
    const client = createHanaMusicApi({
      cookie,
      fetcher: async () => new Promise<Response>(() => {}),
    });
    const timedOut = await failureOf(
      client.album({ id: 1 }, { timeoutMs: 20 }),
    );
    expect(timedOut.status).toBe(504);
    expect(getNcmFailureInfo(timedOut)).toEqual({ kind: 'timeout' });

    const controller = new AbortController();
    controller.abort();
    const { counting, urls } = countCalls(rejectingFetcher);
    const cancelled = await failureOf(
      client.album({ id: 1 }, { fetcher: counting, signal: controller.signal }),
    );
    expect(cancelled.status).toBe(499);
    expect(getNcmFailureInfo(cancelled)).toEqual({ kind: 'cancelled' });
    expect(urls).toHaveLength(0);
  });

  test('network and decoding failures are transport failures', async () => {
    const network = await failureOf(
      album(
        { id: 1 },
        {
          cookie,
          fetcher: async () => {
            throw new Error('socket failed MUSIC_U=sentinel-token');
          },
        },
      ),
    );
    expect(network.status).toBe(502);
    expect(getNcmFailureInfo(network)).toEqual({ kind: 'transport' });
    expect(JSON.stringify(getNcmFailureInfo(network))).not.toContain(
      'sentinel-token',
    );

    const decode = await failureOf(
      album(
        { id: 1 },
        {
          cookie,
          fetcher: async () =>
            Response.json({ code: 200, songs: [], album: {} }),
        },
      ),
    );
    expect(decode.status).toBe(502);
    expect(getNcmFailureInfo(decode)?.kind).toBe('upstreamShape');
  });

  test('shape failures keep the public upstreamShape fields', async () => {
    const failure = await failureOf(
      album(
        { id: 1 },
        { cookie, fetcher: async () => Response.json({ code: 200 }) },
      ),
    );
    expect(failure.status).toBe(502);
    const body = failure.body;
    if (
      typeof body !== 'object' ||
      body === null ||
      Array.isArray(body) ||
      !('upstreamShape' in body)
    ) {
      throw new Error('expected a public upstreamShape field');
    }
    const shape = body.upstreamShape;
    expect(typeof shape).toBe('object');
    expect(getNcmFailureInfo(failure)).toEqual({
      kind: 'upstreamShape',
      ...shape,
    });
  });

  test('successful responses stay three-field envelopes without failure', async () => {
    const result = await innerVersion({});
    expect(Object.keys(result).toSorted()).toEqual([
      'body',
      'cookie',
      'status',
    ]);
    expect('failure' in result).toBe(false);
    expect(result).toMatchObject({ status: 200, cookie: [] });
  });

  test('legacy response objects are read without guessing', () => {
    const legacy: NcmApiResponse = { status: 502, cookie: [], body: {} };
    expect(getNcmFailureInfo(legacy)).toBeUndefined();
  });
});
